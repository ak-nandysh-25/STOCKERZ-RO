import { prisma } from "../db";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

export type AppRole = "ADMIN" | "USER";
export const AppRole = {
  ADMIN: "ADMIN" as const,
  USER: "USER" as const,
};

const JWT_SECRET = process.env.JWT_SECRET || "stockerz-ro-jwt-secret-key-2026-secure";

export interface AuthUserPayload {
  id: string;
  email: string;
  role: AppRole;
  shopId?: string;
}

export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, 10);
}

export async function comparePassword(password: string, hash: string): Promise<boolean> {
  return bcrypt.compare(password, hash);
}

export function generateToken(payload: AuthUserPayload): string {
  return jwt.sign(payload, JWT_SECRET, { expiresIn: "30d" });
}

export function verifyToken(token: string): AuthUserPayload | null {
  try {
    return jwt.verify(token, JWT_SECRET) as AuthUserPayload;
  } catch {
    return null;
  }
}

export const authService = {
  async register(data: { email: string; password: string; shop?: any }) {
    const cleanEmail = data.email.trim().toLowerCase();
    const existing = await prisma.user.findUnique({ where: { email: cleanEmail } });
    if (existing) {
      throw new Error("User already exists with this email");
    }

    const passwordHash = await hashPassword(data.password);
    const user = await prisma.user.create({
      data: {
        email: cleanEmail,
        passwordHash,
        role: AppRole.USER,
        shops: {
          create: {
            name: data.shop?.name?.trim().toUpperCase() || "MY SHOP",
            contact: data.shop?.contact?.trim() || null,
            email: cleanEmail,
            gst: data.shop?.gst?.trim().toUpperCase() || null,
            address: data.shop?.address?.trim().toUpperCase() || null,
          },
        },
      },
      include: { shops: true },
    });

    const userShop = user.shops[0];
    const token = generateToken({
      id: user.id,
      email: user.email,
      role: user.role,
      shopId: userShop?.id,
    });

    return {
      user: { id: user.id, email: user.email, role: user.role, createdAt: user.createdAt },
      shop: userShop,
      token,
    };
  },

  async login(data: { email: string; password: string }) {
    const cleanEmail = data.email.trim().toLowerCase();
    const user = await prisma.user.findUnique({
      where: { email: cleanEmail },
      include: { shops: true },
    });

    if (!user) {
      throw new Error("Invalid email or password");
    }

    const isValid = await comparePassword(data.password, user.passwordHash);
    if (!isValid) {
      throw new Error("Invalid email or password");
    }

    let userShop = user.shops[0];
    if (!userShop) {
      userShop = await prisma.shop.create({
        data: {
          ownerId: user.id,
          name: "MY SHOP",
          email: cleanEmail,
        },
      });
    }

    const token = generateToken({
      id: user.id,
      email: user.email,
      role: user.role,
      shopId: userShop.id,
    });

    return {
      user: { id: user.id, email: user.email, role: user.role, createdAt: user.createdAt },
      shop: userShop,
      token,
    };
  },

  async getCurrentUser(userId: string) {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { id: true, email: true, role: true, createdAt: true },
    });
    if (!user) throw new Error("User not found");
    const shop = await prisma.shop.findFirst({ where: { ownerId: userId } });
    return { user, shop };
  },

  async createOtpToken(email: string, code: string, expiresAt: Date, userId?: string) {
    return prisma.otpToken.create({
      data: {
        email: email.trim().toLowerCase(),
        code: code.trim(),
        expiresAt,
        userId: userId || null,
      },
    });
  },

  async verifyOtpToken(email: string, code: string) {
    const cleanEmail = email.trim().toLowerCase();
    const otp = await prisma.otpToken.findFirst({
      where: {
        email: cleanEmail,
        code: code.trim(),
        used: false,
        expiresAt: { gt: new Date() },
      },
      orderBy: { createdAt: "desc" },
    });

    if (!otp) {
      throw new Error("Invalid or expired OTP code");
    }

    await prisma.otpToken.update({
      where: { id: otp.id },
      data: { used: true },
    });

    return { valid: true };
  },

  async resetPassword(email: string, newPassword: string, code?: string) {
    const cleanEmail = email.trim().toLowerCase();
    const user = await prisma.user.findUnique({ where: { email: cleanEmail } });
    if (!user) {
      throw new Error("No user found with this email");
    }

    if (code) {
      await this.verifyOtpToken(cleanEmail, code);
    }

    const passwordHash = await hashPassword(newPassword);
    await prisma.user.update({
      where: { id: user.id },
      data: { passwordHash },
    });

    return { message: "Password updated successfully" };
  },
};
