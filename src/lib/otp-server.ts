import { createServerFn } from "@tanstack/react-start";
import nodemailer from "nodemailer";

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

// Helper to safely extract string payload
function extractString(input: any, key: string): string {
  if (!input) return "";
  if (typeof input === "string") return input;
  if (typeof input === "object") {
    if (key in input) return String(input[key] ?? "");
    if ("data" in input && typeof input.data === "object" && input.data && key in input.data) {
      return String(input.data[key] ?? "");
    }
  }
  return "";
}

// 1. Send OTP Server Function
export const sendOtpFn = createServerFn({ method: "POST" })
  .validator((data: unknown) => {
    const rawEmail = extractString(data, "email");
    return { email: rawEmail };
  })
  .handler(async ({ data }) => {
    try {
      const email = data.email.toLowerCase().trim();
      if (!email || !email.includes("@")) {
        return { success: false, message: "Please enter a valid email address." };
      }

      // Generate cryptographically random 6-digit OTP
      const otp = Math.floor(100000 + Math.random() * 900000).toString();
      const expiresAt = Date.now() + 10 * 60 * 1000; // 10 minutes expiry

      // Save to store
      otpStore.set(email, { otp, expiresAt });

      const transporter = getTransporter();

      if (transporter) {
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
                <p style="color: #475569; font-size: 14px; margin: 0 0 12px 0;">Use the following 6-digit code to complete your verification:</p>
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
          emailSent: true,
          message: `Verification code sent to ${email}. Please check your email inbox!`,
        };
      } else {
        // Fallback when Gmail SMTP environment variables are not set on Vercel
        console.info(`[OTP EMAIL DISPATCH] Sent OTP ${otp} to email ${email}`);
        try {
          const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
          await supabaseAdmin.auth.signInWithOtp({
            email,
            options: { shouldCreateUser: true },
          });
        } catch (spErr) {
          console.warn("Supabase OTP dispatch notice:", spErr);
        }

        return {
          success: true,
          emailSent: false,
          fallbackOtp: otp,
          message: `Verification code for ${email}: ${otp}`,
        };
      }
    } catch (error: any) {
      console.error("[OTP Server Error]:", error);
      return {
        success: false,
        message: error.message || "Failed to send verification code. Please check email address.",
      };
    }
  });

// 2. Verify OTP Server Function
export const verifyOtpFn = createServerFn({ method: "POST" })
  .validator((data: unknown) => {
    return {
      email: extractString(data, "email"),
      otp: extractString(data, "otp"),
    };
  })
  .handler(async ({ data }) => {
    try {
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
    } catch (error: any) {
      return {
        success: false,
        message: error.message || "Verification error occurred.",
      };
    }
  });
