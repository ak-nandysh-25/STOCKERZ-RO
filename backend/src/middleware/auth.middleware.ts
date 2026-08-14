import { Request, Response, NextFunction } from "express";
import { verifyToken, AuthUserPayload, AppRole } from "../services/auth.service";
import { prisma } from "../db";

export interface AuthRequest extends Request {
  user?: AuthUserPayload;
}

export async function authenticateToken(req: AuthRequest, res: Response, next: NextFunction) {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res.status(401).json({ error: "Unauthorized: Missing token" });
  }

  const token = authHeader.split(" ")[1];
  const decoded = verifyToken(token);
  if (!decoded) {
    return res.status(401).json({ error: "Unauthorized: Invalid or expired token" });
  }

  // Always read fresh user role from database
  const dbUser = await prisma.user.findUnique({
    where: { id: decoded.id },
    select: { id: true, email: true, role: true },
  });

  if (!dbUser) {
    return res.status(401).json({ error: "Unauthorized: User no longer exists" });
  }

  const shop = await prisma.shop.findFirst({
    where: { ownerId: dbUser.id },
  });

  req.user = {
    id: dbUser.id,
    email: dbUser.email,
    role: dbUser.role as AppRole,
    shopId: shop?.id,
  };

  next();
}

export function requireAdmin(req: AuthRequest, res: Response, next: NextFunction) {
  if (!req.user || req.user.role !== AppRole.ADMIN) {
    return res.status(403).json({ error: "Forbidden: Admin access required" });
  }
  next();
}
