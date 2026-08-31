import nodemailer from "nodemailer";
import { config } from "../config";

const transporter = nodemailer.createTransport({
  host: config.smtp.host,
  port: config.smtp.port,
  secure: config.smtp.port === 465,
  auth: {
    user: config.smtp.user,
    pass: config.smtp.pass,
  },
});

interface EmailOptions {
  to: string;
  subject: string;
  html: string;
}

export const sendEmail = async (options: EmailOptions): Promise<void> => {
  try {
    await transporter.sendMail({
      from: config.smtp.from,
      to: options.to,
      subject: options.subject,
      html: options.html,
    });
    console.log(`📧 Email sent to ${options.to}`);
  } catch (error) {
    console.error("Failed to send email:", error);
    // Don't throw - email failure shouldn't break the flow
  }
};

export const sendVerificationEmail = async (
  email: string,
  token: string
): Promise<void> => {
  const verifyUrl = `${config.frontendUrl}/verify-email?token=${token}`;
  await sendEmail({
    to: email,
    subject: "Verify your CampusWardrobe account",
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h1 style="color: #7c3aed;">Welcome to CampusWardrobe! 👗</h1>
        <p>Thanks for signing up! Please verify your email address by clicking the button below:</p>
        <a href="${verifyUrl}" style="display: inline-block; background-color: #7c3aed; color: white; padding: 12px 24px; text-decoration: none; border-radius: 8px; margin: 16px 0;">Verify Email</a>
        <p style="color: #666;">If you didn't create this account, you can safely ignore this email.</p>
        <hr style="border: none; border-top: 1px solid #eee; margin: 24px 0;" />
        <p style="color: #999; font-size: 12px;">CampusWardrobe - Rent clothes from your campus peers</p>
      </div>
    `,
  });
};

export const sendPasswordResetEmail = async (
  email: string,
  token: string
): Promise<void> => {
  const resetUrl = `${config.frontendUrl}/reset-password?token=${token}`;
  await sendEmail({
    to: email,
    subject: "Reset your CampusWardrobe password",
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h1 style="color: #7c3aed;">Password Reset 🔑</h1>
        <p>You requested a password reset. Click the button below to set a new password:</p>
        <a href="${resetUrl}" style="display: inline-block; background-color: #7c3aed; color: white; padding: 12px 24px; text-decoration: none; border-radius: 8px; margin: 16px 0;">Reset Password</a>
        <p style="color: #666;">This link expires in 1 hour. If you didn't request this, ignore this email.</p>
        <hr style="border: none; border-top: 1px solid #eee; margin: 24px 0;" />
        <p style="color: #999; font-size: 12px;">CampusWardrobe - Rent clothes from your campus peers</p>
      </div>
    `,
  });
};

export const sendBookingConfirmationEmail = async (
  email: string,
  bookingDetails: {
    listingTitle: string;
    startDate: string;
    endDate: string;
    totalAmount: number;
    bookingId: string;
  }
): Promise<void> => {
  await sendEmail({
    to: email,
    subject: `Booking Confirmed - ${bookingDetails.listingTitle}`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h1 style="color: #7c3aed;">Booking Confirmed! 🎉</h1>
        <div style="background: #f3f4f6; padding: 20px; border-radius: 8px; margin: 16px 0;">
          <h3 style="margin: 0 0 12px 0;">${bookingDetails.listingTitle}</h3>
          <p><strong>Booking ID:</strong> ${bookingDetails.bookingId}</p>
          <p><strong>Dates:</strong> ${bookingDetails.startDate} to ${bookingDetails.endDate}</p>
          <p><strong>Total Amount:</strong> ₹${bookingDetails.totalAmount}</p>
        </div>
        <p>You can view your booking details in your dashboard.</p>
        <a href="${config.frontendUrl}/dashboard/bookings" style="display: inline-block; background-color: #7c3aed; color: white; padding: 12px 24px; text-decoration: none; border-radius: 8px; margin: 16px 0;">View Booking</a>
        <hr style="border: none; border-top: 1px solid #eee; margin: 24px 0;" />
        <p style="color: #999; font-size: 12px;">CampusWardrobe - Rent clothes from your campus peers</p>
      </div>
    `,
  });
};

export const sendPaymentConfirmationEmail = async (
  email: string,
  paymentDetails: {
    amount: number;
    paymentId: string;
    listingTitle: string;
  }
): Promise<void> => {
  await sendEmail({
    to: email,
    subject: `Payment Received - ₹${paymentDetails.amount}`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h1 style="color: #7c3aed;">Payment Successful! 💰</h1>
        <div style="background: #f3f4f6; padding: 20px; border-radius: 8px; margin: 16px 0;">
          <p><strong>Amount:</strong> ₹${paymentDetails.amount}</p>
          <p><strong>Payment ID:</strong> ${paymentDetails.paymentId}</p>
          <p><strong>For:</strong> ${paymentDetails.listingTitle}</p>
        </div>
        <p>Your payment is securely held in escrow until the rental is completed.</p>
        <hr style="border: none; border-top: 1px solid #eee; margin: 24px 0;" />
        <p style="color: #999; font-size: 12px;">CampusWardrobe - Rent clothes from your campus peers</p>
      </div>
    `,
  });
};
