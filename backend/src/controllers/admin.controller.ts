import { Response, NextFunction } from "express";
import { AuthRequest } from "../middleware/auth";
import prisma from "../lib/prisma";
import { config } from "../config";

export const getUsers = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { page = "1", limit = "20", search } = req.query;
    const pageNum = parseInt(page as string, 10);
    const limitNum = parseInt(limit as string, 10);

    const where: any = {};
    if (search) {
      where.OR = [
        { name: { contains: search as string, mode: "insensitive" } },
        { email: { contains: search as string, mode: "insensitive" } },
        { college: { contains: search as string, mode: "insensitive" } },
      ];
    }

    const [users, total] = await Promise.all([
      prisma.user.findMany({
        where,
        orderBy: { createdAt: "desc" },
        skip: (pageNum - 1) * limitNum,
        take: limitNum,
        select: {
          id: true,
          name: true,
          email: true,
          college: true,
          role: true,
          isEmailVerified: true,
          rating: true,
          createdAt: true,
          _count: {
            select: {
              listings: true,
              bookingsAsRenter: true,
              bookingsAsLender: true,
            },
          },
        },
      }),
      prisma.user.count({ where }),
    ]);

    res.json({
      users,
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

export const getBookings = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { page = "1", limit = "20", status } = req.query;
    const pageNum = parseInt(page as string, 10);
    const limitNum = parseInt(limit as string, 10);

    const where: any = {};
    if (status) where.status = status;

    const [bookings, total] = await Promise.all([
      prisma.booking.findMany({
        where,
        orderBy: { createdAt: "desc" },
        skip: (pageNum - 1) * limitNum,
        take: limitNum,
        include: {
          listing: { select: { id: true, title: true, images: true } },
          renter: { select: { id: true, name: true, email: true } },
          lender: { select: { id: true, name: true, email: true } },
          payment: { select: { status: true, amount: true } },
        },
      }),
      prisma.booking.count({ where }),
    ]);

    res.json({
      bookings,
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

export const getTransactions = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { page = "1", limit = "20", type } = req.query;
    const pageNum = parseInt(page as string, 10);
    const limitNum = parseInt(limit as string, 10);

    const where: any = {};
    if (type) where.type = type;

    const [transactions, total] = await Promise.all([
      prisma.transaction.findMany({
        where,
        orderBy: { createdAt: "desc" },
        skip: (pageNum - 1) * limitNum,
        take: limitNum,
        include: {
          wallet: {
            include: {
              user: { select: { id: true, name: true, email: true } },
            },
          },
        },
      }),
      prisma.transaction.count({ where }),
    ]);

    res.json({
      transactions,
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

export const getDisputes = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { page = "1", limit = "20", status } = req.query;
    const pageNum = parseInt(page as string, 10);
    const limitNum = parseInt(limit as string, 10);

    const where: any = {};
    if (status) where.status = status;

    const [disputes, total] = await Promise.all([
      prisma.dispute.findMany({
        where,
        orderBy: { createdAt: "desc" },
        skip: (pageNum - 1) * limitNum,
        take: limitNum,
        include: {
          booking: {
            include: {
              listing: { select: { id: true, title: true } },
              payment: { select: { amount: true, status: true } },
            },
          },
          raisedBy: { select: { id: true, name: true, email: true } },
          against: { select: { id: true, name: true, email: true } },
        },
      }),
      prisma.dispute.count({ where }),
    ]);

    res.json({
      disputes,
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

export const resolveDispute = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { id } = req.params;
    const { resolution, decision } = req.body;

    const dispute = await prisma.dispute.findUnique({
      where: { id },
      include: {
        booking: {
          include: {
            payment: true,
          },
        },
      },
    });

    if (!dispute) {
      res.status(404).json({ error: "Dispute not found" });
      return;
    }

    if (dispute.status !== "OPEN" && dispute.status !== "UNDER_REVIEW") {
      res.status(400).json({ error: "Dispute is already resolved" });
      return;
    }

    await prisma.$transaction(async (tx) => {
      // Update dispute
      await tx.dispute.update({
        where: { id },
        data: {
          status: decision,
          resolution,
          resolvedAt: new Date(),
        },
      });

      // Handle financial resolution
      if (decision === "RESOLVED_RENTER" && dispute.booking.payment?.razorpayPaymentId) {
        // Full refund to renter
        const renterWallet = await tx.wallet.findUnique({
          where: { userId: dispute.booking.renterId },
        });

        if (renterWallet) {
          await tx.wallet.update({
            where: { id: renterWallet.id },
            data: {
              balance: { increment: dispute.booking.totalAmount },
            },
          });

          await tx.transaction.create({
            data: {
              walletId: renterWallet.id,
              type: "REFUND",
              amount: dispute.booking.totalAmount,
              description: `Dispute resolved in your favor - booking ${dispute.bookingId}`,
              referenceId: dispute.bookingId,
            },
          });
        }

        await tx.booking.update({
          where: { id: dispute.bookingId },
          data: { status: "CANCELLED" },
        });
      } else if (decision === "RESOLVED_LENDER") {
        // Release payment to lender
        const lenderPayout =
          dispute.booking.rentalAmount - dispute.booking.platformFee;

        const lenderWallet = await tx.wallet.findUnique({
          where: { userId: dispute.booking.lenderId },
        });

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
              description: `Dispute resolved in your favor - booking ${dispute.bookingId}`,
              referenceId: dispute.bookingId,
            },
          });
        }

        // Return deposit to renter
        const renterWallet = await tx.wallet.findUnique({
          where: { userId: dispute.booking.renterId },
        });

        if (renterWallet) {
          await tx.wallet.update({
            where: { id: renterWallet.id },
            data: { balance: { increment: dispute.booking.depositAmount } },
          });

          await tx.transaction.create({
            data: {
              walletId: renterWallet.id,
              type: "DEPOSIT_RETURN",
              amount: dispute.booking.depositAmount,
              description: `Security deposit returned - dispute ${dispute.id}`,
              referenceId: dispute.bookingId,
            },
          });
        }

        await tx.booking.update({
          where: { id: dispute.bookingId },
          data: { status: "COMPLETED" },
        });
      }
    });

    res.json({ message: "Dispute resolved successfully" });
  } catch (error) {
    next(error);
  }
};

export const getAnalytics = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const [
      totalUsers,
      totalListings,
      totalBookings,
      totalRevenue,
      recentBookings,
      bookingsByStatus,
      monthlyRevenue,
    ] = await Promise.all([
      prisma.user.count(),
      prisma.listing.count(),
      prisma.booking.count(),
      prisma.transaction.aggregate({
        where: { type: "COMMISSION" },
        _sum: { amount: true },
      }),
      prisma.booking.findMany({
        orderBy: { createdAt: "desc" },
        take: 5,
        include: {
          listing: { select: { title: true } },
          renter: { select: { name: true } },
        },
      }),
      prisma.booking.groupBy({
        by: ["status"],
        _count: true,
      }),
      // Monthly revenue for the last 6 months
      prisma.$queryRaw`
        SELECT 
          DATE_TRUNC('month', "createdAt") as month,
          SUM(ABS(amount)) as revenue
        FROM transactions
        WHERE type = 'COMMISSION'
          AND "createdAt" >= NOW() - INTERVAL '6 months'
        GROUP BY DATE_TRUNC('month', "createdAt")
        ORDER BY month DESC
      ` as Promise<any[]>,
    ]);

    res.json({
      analytics: {
        totalUsers,
        totalListings,
        totalBookings,
        totalRevenue: Math.abs(totalRevenue._sum.amount || 0),
        platformCommission: config.platformCommission,
        recentBookings,
        bookingsByStatus: bookingsByStatus.reduce(
          (acc, item) => ({ ...acc, [item.status]: item._count }),
          {}
        ),
        monthlyRevenue: monthlyRevenue || [],
      },
    });
  } catch (error) {
    next(error);
  }
};

export const flagListing = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { id } = req.params;
    const { action } = req.body; // "flag" or "approve"

    const listing = await prisma.listing.findUnique({ where: { id } });
    if (!listing) {
      res.status(404).json({ error: "Listing not found" });
      return;
    }

    const newStatus = action === "flag" ? "FLAGGED" : "ACTIVE";

    await prisma.listing.update({
      where: { id },
      data: { status: newStatus as any },
    });

    res.json({
      message: `Listing ${action === "flag" ? "flagged" : "approved"} successfully`,
    });
  } catch (error) {
    next(error);
  }
};
