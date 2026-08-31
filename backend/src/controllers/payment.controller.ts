import { Request, Response, NextFunction } from "express";
import { AuthRequest } from "../middleware/auth";
import prisma from "../lib/prisma";
import {
  createRazorpayOrder,
  verifyRazorpaySignature,
  verifyWebhookSignature,
  initiateRefund,
} from "../utils/razorpay";
import { config } from "../config";
import {
  sendPaymentConfirmationEmail,
  sendBookingConfirmationEmail,
} from "../utils/email";

export const createOrder = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { bookingId } = req.body;

    const booking = await prisma.booking.findUnique({
      where: { id: bookingId },
      include: {
        listing: { select: { title: true } },
        payment: true,
      },
    });

    if (!booking) {
      res.status(404).json({ error: "Booking not found" });
      return;
    }

    if (booking.renterId !== req.user!.id) {
      res.status(403).json({ error: "Only the renter can make payment" });
      return;
    }

    if (booking.status !== "PENDING") {
      res.status(400).json({ error: "Booking is not in pending state" });
      return;
    }

    // Check if order already created
    if (booking.payment) {
      res.json({
        order: {
          id: booking.payment.razorpayOrderId,
          amount: booking.payment.amount * 100,
          currency: booking.payment.currency,
        },
        key: config.razorpay.keyId,
      });
      return;
    }

    // Create Razorpay order
    const order = await createRazorpayOrder({
      amount: booking.totalAmount,
      receipt: `booking_${booking.id}`,
      notes: {
        bookingId: booking.id,
        renterId: booking.renterId,
        lenderId: booking.lenderId,
        listingTitle: booking.listing.title,
      },
    });

    // Store payment record
    await prisma.payment.create({
      data: {
        bookingId: booking.id,
        razorpayOrderId: order.id,
        amount: booking.totalAmount,
        currency: "INR",
        status: "PENDING",
      },
    });

    res.json({
      order: {
        id: order.id,
        amount: order.amount,
        currency: order.currency,
      },
      key: config.razorpay.keyId,
    });
  } catch (error) {
    next(error);
  }
};

export const verifyPayment = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature } =
      req.body;

    // Verify signature
    const isValid = verifyRazorpaySignature(
      razorpay_order_id,
      razorpay_payment_id,
      razorpay_signature
    );

    if (!isValid) {
      res.status(400).json({ error: "Invalid payment signature" });
      return;
    }

    // Update payment record
    const payment = await prisma.payment.update({
      where: { razorpayOrderId: razorpay_order_id },
      data: {
        razorpayPaymentId: razorpay_payment_id,
        razorpaySignature: razorpay_signature,
        status: "CAPTURED",
      },
      include: {
        booking: {
          include: {
            listing: { select: { title: true } },
            renter: { select: { email: true, name: true } },
            lender: { select: { email: true, name: true } },
          },
        },
      },
    });

    // Update booking status to CONFIRMED
    await prisma.booking.update({
      where: { id: payment.bookingId },
      data: { status: "CONFIRMED" },
    });

    // Record transaction in renter's wallet
    const renterWallet = await prisma.wallet.findUnique({
      where: { userId: payment.booking.renterId },
    });

    if (renterWallet) {
      await prisma.transaction.createMany({
        data: [
          {
            walletId: renterWallet.id,
            type: "RENTAL_PAYMENT",
            amount: -payment.booking.rentalAmount,
            description: `Rental payment for "${payment.booking.listing.title}"`,
            referenceId: payment.bookingId,
          },
          {
            walletId: renterWallet.id,
            type: "SECURITY_DEPOSIT",
            amount: -payment.booking.depositAmount,
            description: `Security deposit for "${payment.booking.listing.title}"`,
            referenceId: payment.bookingId,
          },
        ],
      });
    }

    // Send confirmation emails
    await Promise.all([
      sendPaymentConfirmationEmail(payment.booking.renter.email, {
        amount: payment.amount,
        paymentId: razorpay_payment_id,
        listingTitle: payment.booking.listing.title,
      }),
      sendBookingConfirmationEmail(payment.booking.renter.email, {
        listingTitle: payment.booking.listing.title,
        startDate: payment.booking.startDate.toLocaleDateString("en-IN"),
        endDate: payment.booking.endDate.toLocaleDateString("en-IN"),
        totalAmount: payment.booking.totalAmount,
        bookingId: payment.bookingId,
      }),
    ]);

    res.json({
      message: "Payment verified successfully. Booking confirmed.",
      payment: {
        id: payment.id,
        status: payment.status,
        amount: payment.amount,
      },
    });
  } catch (error) {
    next(error);
  }
};

export const handleWebhook = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const signature = req.headers["x-razorpay-signature"] as string;

    if (!signature) {
      res.status(400).json({ error: "Missing webhook signature" });
      return;
    }

    const isValid = verifyWebhookSignature(req.body, signature);
    if (!isValid) {
      res.status(400).json({ error: "Invalid webhook signature" });
      return;
    }

    const event = JSON.parse(req.body.toString());
    const { event: eventType, payload } = event;

    switch (eventType) {
      case "payment.captured": {
        const paymentEntity = payload.payment.entity;
        const orderId = paymentEntity.order_id;

        await prisma.payment.update({
          where: { razorpayOrderId: orderId },
          data: {
            razorpayPaymentId: paymentEntity.id,
            status: "CAPTURED",
          },
        });

        // Update booking
        const payment = await prisma.payment.findUnique({
          where: { razorpayOrderId: orderId },
        });
        if (payment) {
          await prisma.booking.update({
            where: { id: payment.bookingId },
            data: { status: "CONFIRMED" },
          });
        }
        break;
      }

      case "payment.failed": {
        const paymentEntity = payload.payment.entity;
        const orderId = paymentEntity.order_id;

        await prisma.payment.update({
          where: { razorpayOrderId: orderId },
          data: {
            status: "FAILED",
          },
        });

        const payment = await prisma.payment.findUnique({
          where: { razorpayOrderId: orderId },
        });
        if (payment) {
          await prisma.booking.update({
            where: { id: payment.bookingId },
            data: { status: "CANCELLED" },
          });
        }
        break;
      }

      case "refund.created": {
        const refundEntity = payload.refund.entity;
        const paymentId = refundEntity.payment_id;

        await prisma.payment.updateMany({
          where: { razorpayPaymentId: paymentId },
          data: {
            status: "REFUNDED",
            refundedAt: new Date(),
          },
        });
        break;
      }
    }

    res.json({ status: "ok" });
  } catch (error) {
    next(error);
  }
};

export const getPaymentInfo = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { bookingId } = req.params;

    const payment = await prisma.payment.findUnique({
      where: { bookingId },
      include: {
        booking: {
          select: {
            renterId: true,
            lenderId: true,
            totalAmount: true,
            rentalAmount: true,
            depositAmount: true,
            platformFee: true,
            status: true,
          },
        },
      },
    });

    if (!payment) {
      res.status(404).json({ error: "Payment not found" });
      return;
    }

    // Only allow involved parties
    if (
      payment.booking.renterId !== req.user!.id &&
      payment.booking.lenderId !== req.user!.id &&
      req.user!.role !== "ADMIN"
    ) {
      res.status(403).json({ error: "Not authorized" });
      return;
    }

    res.json({ payment });
  } catch (error) {
    next(error);
  }
};

export const processRefund = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { bookingId } = req.params;

    // Admin only
    if (req.user!.role !== "ADMIN") {
      res.status(403).json({ error: "Admin access required" });
      return;
    }

    const payment = await prisma.payment.findUnique({
      where: { bookingId },
      include: {
        booking: true,
      },
    });

    if (!payment || !payment.razorpayPaymentId) {
      res.status(404).json({ error: "Payment not found" });
      return;
    }

    if (payment.status !== "CAPTURED") {
      res.status(400).json({ error: "Payment cannot be refunded" });
      return;
    }

    // Initiate refund via Razorpay
    await initiateRefund(payment.razorpayPaymentId, payment.amount);

    // Update records
    await prisma.$transaction(async (tx) => {
      await tx.payment.update({
        where: { id: payment.id },
        data: { status: "REFUNDED", refundedAt: new Date() },
      });

      await tx.booking.update({
        where: { id: bookingId },
        data: { status: "CANCELLED" },
      });

      // Record refund transaction
      const renterWallet = await tx.wallet.findUnique({
        where: { userId: payment.booking.renterId },
      });

      if (renterWallet) {
        await tx.transaction.create({
          data: {
            walletId: renterWallet.id,
            type: "REFUND",
            amount: payment.amount,
            description: `Refund for booking ${bookingId}`,
            referenceId: bookingId,
          },
        });
      }
    });

    res.json({ message: "Refund initiated successfully" });
  } catch (error) {
    next(error);
  }
};
