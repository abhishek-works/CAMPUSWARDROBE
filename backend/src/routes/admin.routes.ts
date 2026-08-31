import { Router } from "express";
import {
  getUsers,
  getBookings,
  getTransactions,
  getDisputes,
  resolveDispute,
  getAnalytics,
  flagListing,
} from "../controllers/admin.controller";
import { authenticate, requireAdmin } from "../middleware/auth";
import { validate } from "../middleware/validate";
import { resolveDisputeSchema } from "../utils/validators";

const router = Router();

// All admin routes require authentication + admin role
router.use(authenticate, requireAdmin);

router.get("/users", getUsers);
router.get("/bookings", getBookings);
router.get("/transactions", getTransactions);
router.get("/disputes", getDisputes);
router.put("/disputes/:id/resolve", validate(resolveDisputeSchema), resolveDispute);
router.get("/analytics", getAnalytics);
router.put("/listings/:id/flag", flagListing);

export default router;
