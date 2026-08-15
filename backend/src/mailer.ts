import nodemailer from "nodemailer";
import path from "path";
import { fileURLToPath } from "url";
import dotenv from "dotenv";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Explicitly load .env from root and relative paths
dotenv.config();
dotenv.config({ path: path.resolve(process.cwd(), "../.env") });
dotenv.config({ path: path.resolve(__dirname, "../../.env") });
dotenv.config({ path: path.resolve(__dirname, "../.env") });

let transporter: nodemailer.Transporter | null = null;

function getTransporter() {
  const gmailUser = process.env.GMAIL_USER?.trim();
  const rawPass = process.env.GMAIL_APP_PASSWORD;
  const gmailPass = rawPass ? rawPass.replace(/\s+/g, "") : undefined;

  if (gmailUser && gmailPass) {
    return nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: gmailUser,
        pass: gmailPass,
      },
    });
  }

  return nodemailer.createTransport({
    host: process.env.SMTP_HOST || "smtp.ethereal.email",
    port: Number(process.env.SMTP_PORT) || 587,
    auth: {
      user: process.env.SMTP_USER || "",
      pass: process.env.SMTP_PASS || "",
    },
  });
}

export interface SendMailResult {
  success: boolean;
  error?: string;
  messageId?: string;
}

export async function sendOtpEmail(to: string, code: string): Promise<SendMailResult> {
  const cleanTo = to.trim().toLowerCase();
  try {
    const gmailUser = process.env.GMAIL_USER?.trim();
    const mailOptions = {
      from: `"STOCKERZ RO" <${gmailUser || process.env.SMTP_FROM || "no-reply@stockerzro.com"}>`,
      to: cleanTo,
      subject: `Your STOCKERZ RO Verification Code: ${code}`,
      html: `
        <div style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; max-width: 500px; margin: 0 auto; padding: 24px; border: 1px solid #e2e8f0; border-radius: 12px; background-color: #ffffff;">
          <div style="text-align: center; margin-bottom: 20px;">
            <h2 style="color: #0284c7; margin: 0; font-size: 24px; font-weight: 700;">STOCKERZ RO</h2>
            <p style="color: #64748b; font-size: 14px; margin-top: 4px;">Security Verification Code</p>
          </div>
          <p style="font-size: 15px; color: #334155; line-height: 1.5;">Hello,</p>
          <p style="font-size: 15px; color: #334155; line-height: 1.5;">Your one-time email verification code is:</p>
          <div style="font-size: 36px; font-weight: 800; letter-spacing: 8px; color: #0284c7; padding: 20px; background-color: #f0f9ff; border: 2px dashed #bae6fd; border-radius: 10px; text-align: center; margin: 24px 0;">
            ${code}
          </div>
          <p style="font-size: 13px; color: #64748b; line-height: 1.4;">This code is valid for <strong>10 minutes</strong>. Please do not share this code with anyone.</p>
          <hr style="border: none; border-top: 1px solid #f1f5f9; margin: 24px 0;" />
          <p style="font-size: 12px; color: #94a3b8; text-align: center; margin: 0;">&copy; ${new Date().getFullYear()} STOCKERZ RO. All rights reserved.</p>
        </div>
      `,
    };

    const mailer = getTransporter();
    console.log(`[Mailer] Attempting to send OTP email to ${cleanTo} via SMTP...`);
    const info = await mailer.sendMail(mailOptions);
    console.log(`[Mailer] Successfully sent OTP code [${code}] to ${cleanTo}. MessageId: ${info.messageId}`);
    return { success: true, messageId: info.messageId };
  } catch (err: any) {
    const errorMsg = err?.message || String(err);
    console.error(`[Mailer] Failed to send OTP email to ${cleanTo}:`, err);
    return { success: false, error: errorMsg };
  }
}
