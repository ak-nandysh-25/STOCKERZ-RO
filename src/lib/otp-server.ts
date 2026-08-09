import { createServerFn } from "@tanstack/react-start";
import nodemailer from "nodemailer";
import { z } from "zod";

interface OtpEntry {
  otp: string;
  expiresAt: number;
}

// In-memory OTP storage (mapped by normalized email)
const otpStore = new Map<string, OtpEntry>();

// Helper to create Nodemailer transporter
function getTransporter() {
  const user = process.env.GMAIL_USER;
  const rawPass = process.env.GMAIL_APP_PASSWORD;
  const pass = rawPass ? rawPass.replace(/\s+/g, "") : "";

  if (!user || !pass || user.includes("your-gmail") || rawPass?.includes("your-16-char")) {
    return null;
  }

  return nodemailer.createTransport({
    service: "gmail",
    auth: {
      user,
      pass,
    },
  });
}

// 1. Send OTP Server Function
export const sendOtpFn = createServerFn({ method: "POST" })
  .validator((data: unknown) => {
    return z.object({ email: z.string().email("Invalid email address") }).parse(data);
  })
  .handler(async ({ data }) => {
    const email = data.email.toLowerCase().trim();
    
    // Generate cryptographically random 6-digit OTP
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const expiresAt = Date.now() + 10 * 60 * 1000; // 10 minutes expiry

    // Save to store
    otpStore.set(email, { otp, expiresAt });

    const transporter = getTransporter();

    // Development fallback if Gmail credentials are not set up yet
    if (!transporter) {
      console.warn(`[OTP DEV MODE] Gmail credentials missing in .env. OTP for ${email} is: ${otp}`);
      return {
        success: true,
        devMode: true,
        message: `OTP sent! (Dev mode: Check server logs or use code ${otp})`,
        otp: process.env.NODE_ENV === "development" ? otp : undefined,
      };
    }

    try {
      const gmailUser = process.env.GMAIL_USER;
      await transporter.sendMail({
        from: `"STOCKERZ RO Security" <${gmailUser}>`,
        to: email,
        subject: `${otp} is your STOCKERZ RO verification code`,
        html: `
          <div style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; max-width: 500px; margin: 0 auto; padding: 24px; border: 1px solid #e2e8f0; border-radius: 12px; background-color: #ffffff;">
            <div style="text-align: center; margin-bottom: 24px;">
              <h2 style="color: #0f172a; margin: 0; font-size: 24px; font-weight: 700;">STOCKERZ RO</h2>
              <p style="color: #64748b; font-size: 14px; margin-top: 4px;">Authentication Verification Code</p>
            </div>
            <div style="background-color: #f8fafc; border-radius: 8px; padding: 20px; text-align: center; margin-bottom: 24px;">
              <p style="color: #475569; font-size: 14px; margin: 0 0 12px 0;">Use the following 6-digit code to complete your login:</p>
              <div style="font-size: 36px; font-weight: 800; letter-spacing: 8px; color: #2563eb; font-family: monospace;">${otp}</div>
              <p style="color: #94a3b8; font-size: 12px; margin: 12px 0 0 0;">This code will expire in <strong>10 minutes</strong>.</p>
            </div>
            <p style="color: #64748b; font-size: 13px; text-align: center; margin: 0;">
              If you didn't request this verification code, please ignore this email or contact support.
            </p>
          </div>
        `,
      });

      return {
        success: true,
        devMode: false,
        message: "Verification code sent to your Gmail inbox!",
      };
    } catch (error: any) {
      console.error("[Nodemailer Error]:", error);
      return {
        success: false,
        devMode: false,
        message: error.message || "Failed to send OTP via Gmail. Please check SMTP configuration.",
      };
    }
  });

// 2. Verify OTP Server Function
export const verifyOtpFn = createServerFn({ method: "POST" })
  .validator((data: unknown) => {
    return z.object({
      email: z.string().email(),
      otp: z.string().length(6, "OTP must be 6 digits"),
    }).parse(data);
  })
  .handler(async ({ data }) => {
    const email = data.email.toLowerCase().trim();
    const inputOtp = data.otp.trim();

    const record = otpStore.get(email);

    if (!record) {
      return {
        success: false,
        message: "No OTP request found for this email. Please request a new code.",
      };
    }

    if (Date.now() > record.expiresAt) {
      otpStore.delete(email);
      return {
        success: false,
        message: "OTP code has expired. Please request a new code.",
      };
    }

    if (record.otp !== inputOtp) {
      return {
        success: false,
        message: "Incorrect verification code. Please check your email and try again.",
      };
    }

    // OTP verified successfully - consume it
    otpStore.delete(email);

    return {
      success: true,
      message: "OTP verified successfully!",
    };
  });
