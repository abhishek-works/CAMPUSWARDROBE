import Razorpay from "razorpay";
import crypto from "crypto";
import { config } from "../config";

const razorpay = new Razorpay({
  key_id: config.razorpay.keyId,
  key_secret: config.razorpay.keySecret,
});

export interface CreateOrderOptions {
  amount: number; // in rupees
  currency?: string;
  receipt: string;
  notes?: Record<string, string>;
}

export const createRazorpayOrder = async (
  options: CreateOrderOptions
) => {
  const order = await razorpay.orders.create({
    amount: Math.round(options.amount * 100), // Convert to paise
    currency: options.currency || "INR",
    receipt: options.receipt,
    notes: options.notes || {},
  });
  return order;
};

export const verifyRazorpaySignature = (
  orderId: string,
  paymentId: string,
  signature: string
): boolean => {
  const body = `${orderId}|${paymentId}`;
  const expectedSignature = crypto
    .createHmac("sha256", config.razorpay.keySecret)
    .update(body)
    .digest("hex");
  return expectedSignature === signature;
};

export const verifyWebhookSignature = (
  body: string | Buffer,
  signature: string
): boolean => {
  const expectedSignature = crypto
    .createHmac("sha256", config.razorpay.webhookSecret)
    .update(body)
    .digest("hex");
  return expectedSignature === signature;
};

export const fetchPayment = async (paymentId: string) => {
  return await razorpay.payments.fetch(paymentId);
};

export const initiateRefund = async (
  paymentId: string,
  amount: number // in rupees
) => {
  return await razorpay.payments.refund(paymentId, {
    amount: Math.round(amount * 100), // Convert to paise
  });
};

export default razorpay;
