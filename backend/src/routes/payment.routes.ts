import { Router } from "express";
import {
  createOrder,
  verifyPayment,
  handleWebhook,
  getPaymentInfo,
  processRefund,
} from "../controllers/payment.controller";
import { authenticate } from "../middleware/auth";

const router = Router();

router.post("/create-order", authenticate, createOrder);
router.post("/verify", authenticate, verifyPayment);
router.post("/webhook", handleWebhook); // No auth - Razorpay calls this
router.get("/:bookingId", authenticate, getPaymentInfo);
router.post("/:bookingId/refund", authenticate, processRefund);

export default router;
