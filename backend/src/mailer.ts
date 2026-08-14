import nodemailer from "nodemailer";

let transporter: nodemailer.Transporter | null = null;

function getTransporter() {
  if (transporter) return transporter;

  const gmailUser = process.env.GMAIL_USER;
  const gmailPass = process.env.GMAIL_APP_PASSWORD;

  if (gmailUser && gmailPass) {
    transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: gmailUser,
        pass: gmailPass,
      },
    });
  } else {
    transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST || "smtp.ethereal.email",
      port: Number(process.env.SMTP_PORT) || 587,
      auth: {
        user: process.env.SMTP_USER || "",
        pass: process.env.SMTP_PASS || "",
      },
    });
  }
  return transporter;
}

export async function sendOtpEmail(to: string, code: string): Promise<boolean> {
  try {
    const mailOptions = {
      from: `"STOCKERZ RO" <${process.env.GMAIL_USER || process.env.SMTP_FROM || "no-reply@stockerzro.com"}>`,
      to,
      subject: `Your STOCKERZ RO Verification Code: ${code}`,
      html: `
        <div style="font-family: sans-serif; max-width: 500px; margin: 0 auto; padding: 24px; border: 1px solid #e2e8f0; border-radius: 12px; background-color: #ffffff;">
          <h2 style="color: #0284c7; margin-bottom: 12px;">STOCKERZ RO Verification</h2>
          <p style="font-size: 15px; color: #334155;">Your one-time security verification code is:</p>
          <div style="font-size: 32px; font-weight: bold; letter-spacing: 6px; color: #0f172a; padding: 16px; background-color: #f0f9ff; border-radius: 8px; text-align: center; margin: 20px 0;">
            ${code}
          </div>
          <p style="font-size: 13px; color: #64748b;">This code will expire in 10 minutes. If you did not request this email, please ignore it.</p>
        </div>
      `,
    };

    const mailer = getTransporter();
    const info = await mailer.sendMail(mailOptions);
    console.log(`[Mailer] Sent OTP to ${to}. MessageId: ${info.messageId}`);
    return true;
  } catch (err) {
    console.error("[Mailer] Failed to send OTP email:", err);
    return false;
  }
}
