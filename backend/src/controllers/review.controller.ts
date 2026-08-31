import { Response, NextFunction } from "express";
import { AuthRequest } from "../middleware/auth";
import prisma from "../lib/prisma";

export const createReview = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { bookingId, rating, comment } = req.body;
    const authorId = req.user!.id;

    // Get booking
    const booking = await prisma.booking.findUnique({
      where: { id: bookingId },
      include: {
        review: true,
      },
    });

    if (!booking) {
      res.status(404).json({ error: "Booking not found" });
      return;
    }

    if (booking.status !== "COMPLETED") {
      res.status(400).json({ error: "Can only review completed bookings" });
      return;
    }

    if (booking.renterId !== authorId) {
      res.status(403).json({ error: "Only the renter can leave a review" });
      return;
    }

    if (booking.review) {
      res.status(400).json({ error: "Review already exists for this booking" });
      return;
    }

    const review = await prisma.review.create({
      data: {
        bookingId,
        listingId: booking.listingId,
        authorId,
        targetId: booking.lenderId,
        rating,
        comment,
      },
      include: {
        author: {
          select: { id: true, name: true, avatarUrl: true },
        },
      },
    });

    // Update lender's average rating
    const allReviews = await prisma.review.findMany({
      where: { targetId: booking.lenderId },
      select: { rating: true },
    });

    const avgRating =
      allReviews.reduce((sum, r) => sum + r.rating, 0) / allReviews.length;

    await prisma.user.update({
      where: { id: booking.lenderId },
      data: {
        rating: Math.round(avgRating * 10) / 10,
        totalRatings: allReviews.length,
      },
    });

    res.status(201).json({ review, message: "Review submitted successfully" });
  } catch (error) {
    next(error);
  }
};

export const getListingReviews = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { listingId } = req.params;
    const { page = "1", limit = "10" } = req.query;

    const pageNum = parseInt(page as string, 10);
    const limitNum = parseInt(limit as string, 10);

    const [reviews, total] = await Promise.all([
      prisma.review.findMany({
        where: { listingId },
        orderBy: { createdAt: "desc" },
        skip: (pageNum - 1) * limitNum,
        take: limitNum,
        include: {
          author: {
            select: { id: true, name: true, avatarUrl: true },
          },
        },
      }),
      prisma.review.count({ where: { listingId } }),
    ]);

    // Calculate average rating for listing
    const avgResult = await prisma.review.aggregate({
      where: { listingId },
      _avg: { rating: true },
      _count: true,
    });

    res.json({
      reviews,
      averageRating: avgResult._avg.rating || 0,
      totalReviews: avgResult._count,
      pagination: {
        page: pageNum,
        limit: limitNum,
        total,
        totalPages: Math.ceil(total / limitNum),
      },
    });
  } catch (error) {
    next(error);
  }
};

export const getUserReviews = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { userId } = req.params;

    const reviews = await prisma.review.findMany({
      where: { targetId: userId },
      orderBy: { createdAt: "desc" },
      include: {
        author: {
          select: { id: true, name: true, avatarUrl: true },
        },
        listing: {
          select: { id: true, title: true, images: true },
        },
      },
    });

    res.json({ reviews });
  } catch (error) {
    next(error);
  }
};
