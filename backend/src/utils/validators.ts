import { z } from "zod";

export const registerSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters").max(100),
  collegeId: z.string().min(2, "College ID is required").max(50),
  email: z.string().email("Invalid email address"),
  password: z.string().min(6, "Password must be at least 6 characters"),
  college: z.string().min(2, "College name is required").max(200).optional(),
  phone: z.string().optional(),
  avatarUrl: z.string().optional(),
});

export const loginSchema = z.object({
  loginIdentifier: z.string().optional(),
  email: z.string().optional(),
  collegeId: z.string().optional(),
  password: z.string().min(1, "Password is required"),
  college: z.string().optional(),
});

export const forgotPasswordSchema = z.object({
  email: z.string().email("Invalid email address"),
});

export const resetPasswordSchema = z.object({
  token: z.string().min(1, "Reset token is required"),
  password: z.string().min(6, "Password must be at least 6 characters"),
});

export const updateProfileSchema = z.object({
  name: z.string().min(2).max(100).optional(),
  college: z.string().min(2).max(200).optional(),
  phone: z.string().max(15).optional(),
  avatarUrl: z.string().optional(),
});

export const createListingSchema = z.object({
  title: z.string().min(3, "Title must be at least 3 characters").max(200),
  description: z.string().min(5, "Description must be at least 5 characters").max(2000),
  size: z.string(),
  gender: z.string().optional(),
  category: z.string(),
  brand: z.string().optional(),
  condition: z.string().optional(),
  color: z.string().optional(),
  dailyPrice: z.any(),
  nightPrice: z.any().optional(),
  securityDeposit: z.any().optional(),
  availableFrom: z.string().optional(),
  availableTo: z.string().optional(),
  pickupLocation: z.string().optional(),
  notes: z.string().optional(),
  images: z.any().optional(),
});

export const updateListingSchema = createListingSchema.partial();

export const createBookingSchema = z.object({
  listingId: z.string().min(1, "Listing ID is required"),
  startDate: z.string().refine((val) => !isNaN(Date.parse(val)), {
    message: "Invalid start date",
  }),
  endDate: z.string().refine((val) => !isNaN(Date.parse(val)), {
    message: "Invalid end date",
  }),
  rentalType: z.enum(["DAY", "NIGHT", "day", "night"]).optional(),
});

export const createReviewSchema = z.object({
  bookingId: z.string().min(1, "Booking ID is required"),
  rating: z.number().int().min(1).max(5),
  clothingRating: z.number().int().min(1).max(5).optional(),
  comment: z.string().max(1000).optional(),
});

export const createDisputeSchema = z.object({
  bookingId: z.string().min(1, "Booking ID is required"),
  reason: z.string().min(5, "Reason must be at least 5 characters").max(200),
  description: z.string().min(10, "Description must be at least 10 characters").max(2000),
});

export const resolveDisputeSchema = z.object({
  resolution: z.string().min(5, "Resolution must be at least 5 characters"),
  decision: z.string(),
});

