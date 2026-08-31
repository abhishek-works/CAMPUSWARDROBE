import { z } from "zod";

export const loginSchema = z.object({
  email: z.string().email("Invalid email address"),
  password: z.string().min(1, "Password is required"),
});

export const registerSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  email: z.string().email("Invalid email address"),
  password: z
    .string()
    .min(8, "Password must be at least 8 characters")
    .regex(
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/,
      "Must include uppercase, lowercase, and number"
    ),
  college: z.string().min(2, "College name is required"),
  phone: z.string().optional(),
});

export const listingSchema = z.object({
  title: z.string().min(3, "Title must be at least 3 characters"),
  description: z.string().min(10, "Description must be at least 10 characters"),
  size: z.enum(["XS", "S", "M", "L", "XL", "XXL", "FREE"]),
  gender: z.enum(["MALE", "FEMALE", "UNISEX"]),
  category: z.enum([
    "CASUAL",
    "FORMAL",
    "ETHNIC",
    "PARTY",
    "SPORTS",
    "ACCESSORIES",
    "FOOTWEAR",
    "OTHER",
  ]),
  dailyPrice: z.number().min(50, "Minimum ₹50"),
  securityDeposit: z.number().min(100, "Minimum ₹100"),
  availableFrom: z.string().min(1, "Required"),
  availableTo: z.string().min(1, "Required"),
});

export const bookingSchema = z.object({
  startDate: z.string().min(1, "Start date is required"),
  endDate: z.string().min(1, "End date is required"),
});

export const reviewSchema = z.object({
  rating: z.number().int().min(1).max(5),
  comment: z.string().max(1000).optional(),
});

export const profileSchema = z.object({
  name: z.string().min(2).optional(),
  college: z.string().min(2).optional(),
  phone: z.string().optional(),
});

export type LoginFormData = z.infer<typeof loginSchema>;
export type RegisterFormData = z.infer<typeof registerSchema>;
export type ListingFormData = z.infer<typeof listingSchema>;
export type BookingFormData = z.infer<typeof bookingSchema>;
export type ReviewFormData = z.infer<typeof reviewSchema>;
export type ProfileFormData = z.infer<typeof profileSchema>;
