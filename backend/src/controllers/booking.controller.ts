import { Response, NextFunction } from "express";
import crypto from "crypto";
import { AuthRequest } from "../middleware/auth";
import prisma from "../lib/prisma";
import { config } from "../config";

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

export const createBooking = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { listingId, startDate, endDate, rentalType = "DAY" } = req.body;
    const renterId = req.user!.id;

    if (!listingId || !startDate || !endDate) {
      res.status(400).json({ error: "Listing ID, start date, and end date are required." });
      return;
    }

    // Get listing
    const listing = await prisma.listing.findUnique({
      where: { id: listingId },
      include: {
        owner: { select: { id: true, name: true, email: true, collegeId: true, college: true } },
      },
    });

    if (!listing) {
      res.status(404).json({ error: "Listing not found" });
      return;
    }

    if (listing.status !== "ACTIVE") {
      res.status(400).json({ error: "This clothing item is currently unavailable for rental." });
      return;
    }

    // Can't rent own listing
    if (listing.ownerId === renterId) {
      res.status(400).json({ error: "You cannot rent your own clothing listing." });
      return;
    }

    const start = new Date(startDate);
    const end = new Date(endDate);

    if (end < start) {
      res.status(400).json({ error: "Return date cannot be earlier than start date." });
      return;
    }

    // Check for overlapping bookings
    const overlapping = await prisma.booking.findFirst({
      where: {
        listingId,
        status: { in: ["CONFIRMED", "READY_FOR_PICKUP", "PICKED_UP"] },
        AND: [
          { startDate: { lte: end } },
          { endDate: { gte: start } },
        ],
      },
    });

    if (overlapping) {
      res.status(400).json({ error: "These dates are already booked by another student. Please select different dates." });
      return;
    }

    // Calculate duration & price
    const diffTime = Math.abs(end.getTime() - start.getTime());
    const totalDays = Math.max(1, Math.ceil(diffTime / (1000 * 60 * 60 * 24)) || 1);

    const isNight = rentalType.toUpperCase() === "NIGHT";
    const unitPrice = isNight ? (listing.nightPrice || listing.dailyPrice * 2.2) : listing.dailyPrice;
    const rentalAmount = totalDays * unitPrice;
    const depositAmount = listing.securityDeposit || 0;
    const platformFee = Math.round((rentalAmount * (config.platformCommission || 0.15)) * 100) / 100;
    const totalAmount = rentalAmount + depositAmount;

    // Generate unique bookingCode (e.g. CW-2327CS1190-1025)
    const randomSuffix = Math.floor(1000 + Math.random() * 9000);
    const bookingCode = `CW-${req.user!.collegeId || "STU"}-${randomSuffix}`;
    const qrToken = crypto.randomBytes(24).toString("hex");

    // Create booking
    const booking = await prisma.booking.create({
      data: {
        bookingCode,
        listingId,
        renterId,
        lenderId: listing.ownerId,
        startDate: start,
        endDate: end,
        rentalType: isNight ? "NIGHT" : "DAY",
        totalDays,
        rentalAmount,
        depositAmount,
        totalAmount,
        platformFee,
        qrToken,
        status: "CONFIRMED",
      },
      include: {
        listing: {
          select: {
            id: true,
            title: true,
            images: true,
            dailyPrice: true,
            nightPrice: true,
            pickupLocation: true,
          },
        },
        renter: {
          select: { id: true, name: true, collegeId: true, college: true, avatarUrl: true },
        },
        lender: {
          select: { id: true, name: true, collegeId: true, college: true, avatarUrl: true },
        },
      },
    });

    // Create notifications
    await prisma.notification.create({
      data: {
        userId: listing.ownerId,
        type: "LISTING_BOOKED",
        title: "New Outfit Rental! 🎉",
        message: `${req.user!.name} (${req.user!.collegeId}) booked your "${listing.title}" for ${totalDays} ${isNight ? "night(s)" : "day(s)"}.`,
        link: "/dashboard/listings",
      },
    });

    await prisma.notification.create({
      data: {
        userId: renterId,
        type: "BOOKING_CONFIRMED",
        title: "Booking Confirmed! 🎉",
        message: `Your booking for "${listing.title}" is confirmed. Pass ID: ${bookingCode}. Show your QR at ${listing.pickupLocation}.`,
        link: "/dashboard/bookings",
      },
    });

    res.status(201).json({
      booking: {
        ...booking,
        listing: formatListingImages(booking.listing),
      },
      message: "Booking confirmed successfully! Your pickup QR pass has been generated.",
    });
  } catch (error) {
    next(error);
  }
};

export const getMyBookings = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { role = "renter", status } = req.query;
    const userId = req.user!.id;

    const where: any = {};
    if (role === "renter") {
      where.renterId = userId;
    } else {
      where.lenderId = userId;
    }
    if (status && status !== "ALL") {
      where.status = status;
    }

    const bookings = await prisma.booking.findMany({
      where,
      orderBy: { createdAt: "desc" },
      include: {
        listing: {
          select: {
            id: true,
            title: true,
            images: true,
            dailyPrice: true,
            nightPrice: true,
            category: true,
            pickupLocation: true,
            size: true,
          },
        },
        renter: {
          select: { id: true, name: true, collegeId: true, college: true, avatarUrl: true, rating: true, phone: true },
        },
        lender: {
          select: { id: true, name: true, collegeId: true, college: true, avatarUrl: true, rating: true, phone: true },
        },
        review: true,
      },
    });

    const formattedBookings = bookings.map((b) => ({
      ...b,
      listing: formatListingImages(b.listing),
    }));

    res.json({ bookings: formattedBookings });
  } catch (error) {
    next(error);
  }
};

export const getBookingById = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { id } = req.params;
    const userId = req.user!.id;

    const booking = await prisma.booking.findFirst({
      where: {
        OR: [{ id }, { bookingCode: id }, { qrToken: id }],
      },
      include: {
        listing: {
          include: {
            owner: {
              select: {
                id: true,
                name: true,
                college: true,
                collegeId: true,
                avatarUrl: true,
                phone: true,
                rating: true,
              },
            },
          },
        },
        renter: {
          select: {
            id: true,
            name: true,
            college: true,
            collegeId: true,
            avatarUrl: true,
            phone: true,
            rating: true,
          },
        },
        lender: {
          select: {
            id: true,
            name: true,
            college: true,
            collegeId: true,
            avatarUrl: true,
            phone: true,
            rating: true,
          },
        },
        review: true,
      },
    });

    if (!booking) {
      res.status(404).json({ error: "Booking not found" });
      return;
    }

    if (
      booking.renterId !== userId &&
      booking.lenderId !== userId &&
      req.user!.role !== "ADMIN"
    ) {
      res.status(403).json({ error: "Not authorized to view this booking" });
      return;
    }

    res.json({
      booking: {
        ...booking,
        listing: formatListingImages(booking.listing),
      },
    });
  } catch (error) {
    next(error);
  }
};

export const verifyQrPickup = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { qrToken, bookingCode } = req.body;
    const userId = req.user!.id;

    if (!qrToken && !bookingCode) {
      res.status(400).json({ error: "QR Token or Booking Code is required for verification." });
      return;
    }

    // Look up booking by qrToken or bookingCode
    const booking = await prisma.booking.findFirst({
      where: {
        OR: [
          ...(qrToken ? [{ qrToken }] : []),
          ...(bookingCode ? [{ bookingCode }] : []),
        ],
      },
      include: {
        listing: true,
        renter: { select: { id: true, name: true, collegeId: true, college: true, avatarUrl: true, phone: true } },
        lender: { select: { id: true, name: true, collegeId: true, college: true } },
      },
    });

    if (!booking) {
      res.status(404).json({ error: "Invalid or expired booking QR code." });
      return;
    }

    // Check that the person verifying is the owner or admin
    if (booking.lenderId !== userId && req.user!.role !== "ADMIN") {
      res.status(403).json({ error: "Only the clothing owner can verify and hand over this item." });
      return;
    }

    if (booking.status === "PICKED_UP") {
      res.status(400).json({ error: "This booking has already been verified and picked up." });
      return;
    }

    if (booking.status === "COMPLETED") {
      res.status(400).json({ error: "This rental has already been completed and returned." });
      return;
    }

    if (booking.status === "CANCELLED") {
      res.status(400).json({ error: "This booking was cancelled and is no longer active." });
      return;
    }

    // Mark as PICKED_UP
    const updated = await prisma.booking.update({
      where: { id: booking.id },
      data: {
        status: "PICKED_UP",
        pickupTime: new Date(),
      },
    });

    // Notify renter
    await prisma.notification.create({
      data: {
        userId: booking.renterId,
        type: "QR_VERIFIED",
        title: "Pickup Verified ✓",
        message: `Pickup for "${booking.listing.title}" verified by ${booking.lender.name}. Enjoy your outfit!`,
        link: "/dashboard/bookings",
      },
    });

    res.json({
      success: true,
      message: "Pickup verified successfully! Status updated to Picked Up.",
      booking: {
        ...updated,
        listing: formatListingImages(booking.listing),
        renter: booking.renter,
      },
    });
  } catch (error) {
    next(error);
  }
};

export const verifyReturn = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { id } = req.params;
    const userId = req.user!.id;

    const booking = await prisma.booking.findUnique({
      where: { id },
      include: {
        listing: true,
        renter: { select: { id: true, name: true, collegeId: true, email: true } },
        lender: { select: { id: true, name: true, collegeId: true, email: true } },
      },
    });

    if (!booking) {
      res.status(404).json({ error: "Booking not found" });
      return;
    }

    if (booking.lenderId !== userId && req.user!.role !== "ADMIN") {
      res.status(403).json({ error: "Only the owner can confirm return." });
      return;
    }

    if (booking.status === "COMPLETED") {
      res.status(400).json({ error: "This rental is already marked as completed." });
      return;
    }

    // Complete booking and release deposit & payout
    const lenderPayout = booking.rentalAmount - booking.platformFee;

    await prisma.$transaction(async (tx) => {
      await tx.booking.update({
        where: { id },
        data: {
          status: "COMPLETED",
          returnTime: new Date(),
        },
      });

      // Credit owner wallet
      const lenderWallet = await tx.wallet.findUnique({ where: { userId: booking.lenderId } });
      if (lenderWallet) {
        await tx.wallet.update({
          where: { id: lenderWallet.id },
          data: { balance: { increment: lenderPayout } },
        });

        await tx.transaction.create({
          data: {
            walletId: lenderWallet.id,
            type: "PAYOUT",
            amount: lenderPayout,
            description: `Rental payout for booking ${booking.bookingCode}`,
            referenceId: booking.id,
          },
        });
      }

      // Return deposit to renter wallet if any
      if (booking.depositAmount > 0) {
        const renterWallet = await tx.wallet.findUnique({ where: { userId: booking.renterId } });
        if (renterWallet) {
          await tx.wallet.update({
            where: { id: renterWallet.id },
            data: { balance: { increment: booking.depositAmount } },
          });

          await tx.transaction.create({
            data: {
              walletId: renterWallet.id,
              type: "DEPOSIT_RETURN",
              amount: booking.depositAmount,
              description: `Deposit returned for booking ${booking.bookingCode}`,
              referenceId: booking.id,
            },
          });
        }
      }
    });

    // Notify renter
    await prisma.notification.create({
      data: {
        userId: booking.renterId,
        type: "RETURN_VERIFIED",
        title: "Rental Completed! ⭐",
        message: `Your return for "${booking.listing.title}" was verified. Please leave a rating and review!`,
        link: `/dashboard/bookings?review=${booking.id}`,
      },
    });

    res.json({
      success: true,
      message: "Item return verified and rental completed! Security deposit and earnings processed.",
    });
  } catch (error) {
    next(error);
  }
};

export const cancelBooking = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { id } = req.params;
    const userId = req.user!.id;

    const booking = await prisma.booking.findUnique({
      where: { id },
    });

    if (!booking) {
      res.status(404).json({ error: "Booking not found" });
      return;
    }

    if (booking.renterId !== userId && booking.lenderId !== userId && req.user!.role !== "ADMIN") {
      res.status(403).json({ error: "Not authorized to cancel this booking" });
      return;
    }

    if (booking.status === "PICKED_UP" || booking.status === "COMPLETED") {
      res.status(400).json({ error: "Cannot cancel an active or completed rental." });
      return;
    }

    await prisma.booking.update({
      where: { id },
      data: { status: "CANCELLED" },
    });

    res.json({ message: "Booking cancelled successfully." });
  } catch (error) {
    next(error);
  }
};

