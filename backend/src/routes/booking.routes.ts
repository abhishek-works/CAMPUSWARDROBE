import { Router } from "express";
import {
  createBooking,
  getMyBookings,
  getBookingById,
  verifyQrPickup,
  verifyReturn,
  cancelBooking,
} from "../controllers/booking.controller";
import { authenticate } from "../middleware/auth";
import { validate } from "../middleware/validate";
import { createBookingSchema } from "../utils/validators";

const router = Router();

router.post("/", authenticate, validate(createBookingSchema), createBooking);
router.get("/my", authenticate, getMyBookings);
router.post("/verify-pickup", authenticate, verifyQrPickup);
router.post("/:id/verify-return", authenticate, verifyReturn);
router.post("/:id/cancel", authenticate, cancelBooking);
router.get("/:id", authenticate, getBookingById);

export default router;
