import { Router } from "express";
import {
  createReview,
  getListingReviews,
  getUserReviews,
} from "../controllers/review.controller";
import { authenticate } from "../middleware/auth";
import { validate } from "../middleware/validate";
import { createReviewSchema } from "../utils/validators";

const router = Router();

router.post("/", authenticate, validate(createReviewSchema), createReview);
router.get("/listing/:listingId", authenticate, getListingReviews);
router.get("/user/:userId", authenticate, getUserReviews);

export default router;
