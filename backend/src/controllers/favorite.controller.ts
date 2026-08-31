import { Response, NextFunction } from "express";
import { AuthRequest } from "../middleware/auth";
import prisma from "../lib/prisma";

const formatListingImages = (listing: any) => {
  if (!listing) return null;
  let parsedImages: string[] = [];
  try {
    if (Array.isArray(listing.images)) {
      parsedImages = listing.images;
    } else if (typeof listing.images === "string") {
      parsedImages = JSON.parse(listing.images);
    }
  } catch {
    parsedImages = listing.images ? [listing.images] : [];
  }
  return {
    ...listing,
    images: parsedImages,
  };
};

export const toggleFavorite = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { listingId } = req.body;
    const userId = req.user!.id;

    if (!listingId) {
      res.status(400).json({ error: "Listing ID is required" });
      return;
    }

    const existing = await prisma.favorite.findUnique({
      where: {
        userId_listingId: {
          userId,
          listingId,
        },
      },
    });

    if (existing) {
      await prisma.favorite.delete({
        where: { id: existing.id },
      });
      res.json({ favorited: false, message: "Removed from saved items." });
    } else {
      await prisma.favorite.create({
        data: {
          userId,
          listingId,
        },
      });
      res.json({ favorited: true, message: "Saved to your favorites!" });
    }
  } catch (error) {
    next(error);
  }
};

export const getMyFavorites = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const userId = req.user!.id;

    const favorites = await prisma.favorite.findMany({
      where: { userId },
      orderBy: { createdAt: "desc" },
      include: {
        listing: {
          include: {
            owner: {
              select: {
                id: true,
                name: true,
                collegeId: true,
                college: true,
                avatarUrl: true,
                rating: true,
              },
            },
            _count: {
              select: { bookings: true, reviews: true, favorites: true },
            },
          },
        },
      },
    });

    const listings = favorites.map((f) => ({
      ...formatListingImages(f.listing),
      favoritedAt: f.createdAt,
    }));

    res.json({ listings });
  } catch (error) {
    next(error);
  }
};
