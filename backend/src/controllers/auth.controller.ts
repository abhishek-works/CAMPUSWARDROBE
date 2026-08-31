import { Request, Response, NextFunction } from "express";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import crypto from "crypto";
import { config } from "../config";
import prisma from "../lib/prisma";
import { AuthRequest } from "../middleware/auth";
import {
  sendVerificationEmail,
  sendPasswordResetEmail,
} from "../utils/email";

const generateToken = (user: { id: string; email: string; collegeId: string; college: string; role: string; name: string }) => {
  return jwt.sign(
    { id: user.id, email: user.email, collegeId: user.collegeId, college: user.college, role: user.role, name: user.name },
    config.jwt.secret,
    { expiresIn: "7d" }
  );
};

export const register = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { name, email, collegeId, password, college = "KIET Group of Institutions", phone, avatarUrl } = req.body;

    if (!name || !email || !collegeId || !password) {
      res.status(400).json({ error: "Name, email, College ID, and password are required" });
      return;
    }

    const trimmedCollegeId = collegeId.trim().toUpperCase();
    const trimmedEmail = email.trim().toLowerCase();

    // Check if email already exists
    const existingEmail = await prisma.user.findUnique({
      where: { email: trimmedEmail },
    });
    if (existingEmail) {
      res.status(400).json({ error: "Email is already registered" });
      return;
    }

    // Check if College ID already exists in this college
    const existingCollegeId = await prisma.user.findFirst({
      where: {
        college: college.trim(),
        collegeId: trimmedCollegeId,
      },
    });
    if (existingCollegeId) {
      res.status(400).json({ error: `College ID ${trimmedCollegeId} is already registered for ${college}` });
      return;
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 12);

    // Generate email verification token
    const emailVerifyToken = crypto.randomBytes(32).toString("hex");

    // Create user with wallet
    const user = await prisma.user.create({
      data: {
        name: name.trim(),
        email: trimmedEmail,
        collegeId: trimmedCollegeId,
        password: hashedPassword,
        college: college.trim(),
        phone: phone ? phone.trim() : null,
        avatarUrl: avatarUrl || `https://api.dicebear.com/7.x/avataaars/svg?seed=${trimmedCollegeId}`,
        emailVerifyToken,
        isEmailVerified: true, // auto-verify for smooth campus onboarding
        wallet: {
          create: {
            balance: 500, // starting credit for new campus students
          },
        },
      },
      select: {
        id: true,
        name: true,
        email: true,
        collegeId: true,
        college: true,
        role: true,
        avatarUrl: true,
        rating: true,
        totalRatings: true,
        createdAt: true,
      },
    });

    // Generate JWT
    const token = generateToken({
      id: user.id,
      email: user.email,
      collegeId: user.collegeId,
      college: user.college,
      role: user.role,
      name: user.name,
    });

    res.status(201).json({
      message: "Registration successful! Welcome to CampusWardrobe.",
      token,
      user,
    });
  } catch (error) {
    next(error);
  }
};

export const login = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { loginIdentifier, email, collegeId, password, college } = req.body;

    const identifier = (loginIdentifier || collegeId || email || "").trim();
    if (!identifier || !password) {
      res.status(400).json({ error: "College ID / Email and password are required" });
      return;
    }

    // Find user by email or by collegeId
    let user = await prisma.user.findFirst({
      where: {
        OR: [
          { email: { equals: identifier.toLowerCase() } },
          { email: { equals: identifier } },
          { collegeId: { equals: identifier.toUpperCase() } },
          { collegeId: { equals: identifier } },
        ],
        ...(college ? { college: { contains: college.trim() } } : {}),
      },
      select: {
        id: true,
        name: true,
        email: true,
        collegeId: true,
        college: true,
        password: true,
        role: true,
        avatarUrl: true,
        isEmailVerified: true,
        rating: true,
        totalRatings: true,
      },
    });

    // Fallback if college filter didn't match immediately
    if (!user) {
      user = await prisma.user.findFirst({
        where: {
          OR: [
            { email: { equals: identifier.toLowerCase() } },
            { email: { equals: identifier } },
            { collegeId: { equals: identifier.toUpperCase() } },
            { collegeId: { equals: identifier } },
          ],
        },
        select: {
          id: true,
          name: true,
          email: true,
          collegeId: true,
          college: true,
          password: true,
          role: true,
          avatarUrl: true,
          isEmailVerified: true,
          rating: true,
          totalRatings: true,
        },
      });
    }

    if (!user) {
      res.status(401).json({ error: "Invalid College ID/Email or password" });
      return;
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      res.status(401).json({ error: "Invalid College ID/Email or password" });
      return;
    }

    const token = generateToken({
      id: user.id,
      email: user.email,
      collegeId: user.collegeId,
      college: user.college,
      role: user.role,
      name: user.name,
    });

    const { password: _, ...userWithoutPassword } = user;

    res.json({
      token,
      user: userWithoutPassword,
      message: `Welcome back, ${user.name}!`,
    });
  } catch (error) {
    next(error);
  }
};

export const verifyEmail = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { token } = req.params;

    const user = await prisma.user.findFirst({
      where: { emailVerifyToken: token },
    });

    if (!user) {
      res.status(400).json({ error: "Invalid or expired verification token" });
      return;
    }

    await prisma.user.update({
      where: { id: user.id },
      data: {
        isEmailVerified: true,
        emailVerifyToken: null,
      },
    });

    res.json({ message: "Email verified successfully" });
  } catch (error) {
    next(error);
  }
};

export const forgotPassword = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { email } = req.body;

    const user = await prisma.user.findUnique({
      where: { email },
    });

    if (!user) {
      res.json({ message: "If the email exists, a reset link has been sent." });
      return;
    }

    const resetToken = crypto.randomBytes(32).toString("hex");
    const resetExpiry = new Date(Date.now() + 60 * 60 * 1000); // 1 hour

    await prisma.user.update({
      where: { id: user.id },
      data: {
        resetPasswordToken: resetToken,
        resetPasswordExpiry: resetExpiry,
      },
    });

    await sendPasswordResetEmail(email, resetToken);

    res.json({ message: "If the email exists, a reset link has been sent." });
  } catch (error) {
    next(error);
  }
};

export const resetPassword = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { token, password } = req.body;

    const user = await prisma.user.findFirst({
      where: {
        resetPasswordToken: token,
        resetPasswordExpiry: {
          gt: new Date(),
        },
      },
    });

    if (!user) {
      res.status(400).json({ error: "Invalid or expired reset token" });
      return;
    }

    const hashedPassword = await bcrypt.hash(password, 12);

    await prisma.user.update({
      where: { id: user.id },
      data: {
        password: hashedPassword,
        resetPasswordToken: null,
        resetPasswordExpiry: null,
      },
    });

    res.json({ message: "Password reset successfully" });
  } catch (error) {
    next(error);
  }
};

export const getMe = async (
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
        collegeId: true,
        college: true,
        phone: true,
        avatarUrl: true,
        role: true,
        isEmailVerified: true,
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
            favorites: true,
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

