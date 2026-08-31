import { Response, NextFunction } from "express";
import { AuthRequest } from "../middleware/auth";
import prisma from "../lib/prisma";
import { uploadToCloudinary } from "../utils/cloudinary";

export const getProfile = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const user = await prisma.user.findUnique({
      where: { id: req.user!.id },
      select: {
        id: true,
        name: true,
        email: true,
        college: true,
        phone: true,
        avatarUrl: true,
        role: true,
        rating: true,
        totalRatings: true,
        createdAt: true,
        wallet: {
          select: {
            id: true,
            balance: true,
          },
        },
        _count: {
          select: {
            listings: true,
            bookingsAsRenter: true,
            bookingsAsLender: true,
          },
        },
      },
    });

    res.json({ user });
  } catch (error) {
    next(error);
  }
};

export const updateProfile = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { name, college, phone } = req.body;

    const user = await prisma.user.update({
      where: { id: req.user!.id },
      data: {
        ...(name && { name }),
        ...(college && { college }),
        ...(phone !== undefined && { phone }),
      },
      select: {
        id: true,
        name: true,
        email: true,
        college: true,
        phone: true,
        avatarUrl: true,
        role: true,
        rating: true,
      },
    });

    res.json({ user, message: "Profile updated successfully" });
  } catch (error) {
    next(error);
  }
};

export const uploadAvatar = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    if (!req.file) {
      res.status(400).json({ error: "No image file provided" });
      return;
    }

    const { url } = await uploadToCloudinary(
      req.file.buffer,
      "campuswardrobe/avatars"
    );

    const user = await prisma.user.update({
      where: { id: req.user!.id },
      data: { avatarUrl: url },
      select: {
        id: true,
        name: true,
        avatarUrl: true,
      },
    });

    res.json({ user, message: "Avatar updated successfully" });
  } catch (error) {
    next(error);
  }
};

export const getWallet = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const wallet = await prisma.wallet.findUnique({
      where: { userId: req.user!.id },
      include: {
        transactions: {
          orderBy: { createdAt: "desc" },
          take: 20,
        },
      },
    });

    if (!wallet) {
      res.status(404).json({ error: "Wallet not found" });
      return;
    }

    res.json({ wallet });
  } catch (error) {
    next(error);
  }
};

export const getPublicProfile = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { id } = req.params;

    const user = await prisma.user.findUnique({
      where: { id },
      select: {
        id: true,
        name: true,
        college: true,
        avatarUrl: true,
        rating: true,
        totalRatings: true,
        createdAt: true,
        listings: {
          where: { status: "ACTIVE" },
          select: {
            id: true,
            title: true,
            images: true,
            dailyPrice: true,
            category: true,
            size: true,
          },
          take: 10,
        },
        _count: {
          select: {
            listings: { where: { status: "ACTIVE" } },
          },
        },
      },
    });

    if (!user) {
      res.status(404).json({ error: "User not found" });
      return;
    }

    res.json({ user });
  } catch (error) {
    next(error);
  }
};
