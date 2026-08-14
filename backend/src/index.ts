import express, { Request, Response } from "express";
import cors from "cors";
import dotenv from "dotenv";
import { prisma } from "./db";
import {
  authService,
  hashPassword,
  comparePassword,
  generateToken,
  authenticateToken,
  requireAdmin,
  AuthRequest,
  AppRole,
} from "./auth";
import { sendOtpEmail } from "./mailer";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;
const allowedOrigins = process.env.FRONTEND_URL
  ? process.env.FRONTEND_URL.split(",").map((url) => url.trim())
  : ["http://localhost:3000", "http://localhost:5173", "http://localhost:5000", "https://stockerzro.vercel.app"];

app.use(
  cors({
    origin: (origin, callback) => {
      if (!origin || allowedOrigins.includes(origin) || allowedOrigins.includes("*")) {
        callback(null, origin || true);
      } else {
        callback(null, origin || true);
      }
    },
    credentials: true,
  })
);
app.use(express.json({ limit: "10mb" }));

// Health Check
app.get("/api/health", (req: Request, res: Response) => {
  res.json({ status: "ok", service: "STOCKERZ RO API", timestamp: new Date() });
});

// ==========================================
// AUTH & OTP ROUTES
// ==========================================

function formatApiError(err: any): string {
  const msg = err?.message || String(err);
  if (msg.includes("Can't reach database server") || msg.includes("P1001") || msg.includes("localhost:5432")) {
    return "Database connection failed. Please set a valid PostgreSQL DATABASE_URL in Render Environment settings.";
  }
  return msg || "An unexpected error occurred";
}

app.post("/api/auth/signup", async (req: Request, res: Response) => {
  try {
    const { email, password, shop } = req.body;
    if (!email || !password) {
      return res.status(400).json({ error: "Email and password are required" });
    }

    const result = await authService.register({ email, password, shop });
    return res.status(201).json(result);
  } catch (err: any) {
    console.error("Signup error:", err);
    return res.status(400).json({ error: formatApiError(err) });
  }
});

app.post("/api/auth/register", async (req: Request, res: Response) => {
  try {
    const { email, password, shop } = req.body;
    if (!email || !password) {
      return res.status(400).json({ error: "Email and password are required" });
    }

    const result = await authService.register({ email, password, shop });
    return res.status(201).json(result);
  } catch (err: any) {
    console.error("Register error:", err);
    return res.status(400).json({ error: formatApiError(err) });
  }
});

app.post("/api/auth/logout", (req: Request, res: Response) => {
  return res.json({ message: "Logged out successfully" });
});

app.post("/api/auth/login", async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ error: "Email and password are required" });
    }

    const result = await authService.login({ email, password });
    return res.json(result);
  } catch (err: any) {
    console.error("Login error:", err);
    return res.status(400).json({ error: formatApiError(err) });
  }
});

app.post("/api/auth/send-otp", async (req: Request, res: Response) => {
  try {
    const { email } = req.body;
    if (!email) return res.status(400).json({ error: "Email is required" });

    const cleanEmail = email.trim().toLowerCase();
    const code = Math.floor(100000 + Math.random() * 900000).toString();
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10 mins

    const user = await prisma.user.findUnique({ where: { email: cleanEmail } });

    await prisma.otpToken.create({
      data: {
        email: cleanEmail,
        userId: user?.id || null,
        code,
        expiresAt,
      },
    });

    await sendOtpEmail(cleanEmail, code);
    return res.json({ message: "OTP code sent to email successfully" });
  } catch (err: any) {
    console.error("Send OTP error:", err);
    return res.status(500).json({ error: formatApiError(err) });
  }
});

app.post("/api/auth/verify-otp", async (req: Request, res: Response) => {
  try {
    const { email, code } = req.body;
    if (!email || !code) return res.status(400).json({ error: "Email and code are required" });

    const result = await authService.verifyOtpToken(email, code);
    return res.json(result);
  } catch (err: any) {
    console.error("Verify OTP error:", err);
    return res.status(400).json({ error: formatApiError(err) });
  }
});

app.post("/api/auth/reset-password", async (req: Request, res: Response) => {
  try {
    const { email, code, newPassword } = req.body;
    if (!email || !newPassword) {
      return res.status(400).json({ error: "Email and new password are required" });
    }

    const cleanEmail = email.trim().toLowerCase();
    const user = await prisma.user.findUnique({ where: { email: cleanEmail } });
    if (!user) {
      return res.status(404).json({ error: "No user found with this email" });
    }

    if (code) {
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
        return res.status(400).json({ error: "Invalid or expired OTP code" });
      }

      await prisma.otpToken.update({ where: { id: otp.id }, data: { used: true } });
    }

    const passwordHash = await hashPassword(newPassword);
    await prisma.user.update({
      where: { id: user.id },
      data: { passwordHash },
    });

    return res.json({ message: "Password updated successfully" });
  } catch (err: any) {
    console.error("Reset password error:", err);
    return res.status(500).json({ error: formatApiError(err) });
  }
});

app.get("/api/auth/me", authenticateToken, async (req: AuthRequest, res: Response) => {
  try {
    const user = await prisma.user.findUnique({
      where: { id: req.user!.id },
      select: { id: true, email: true, role: true, createdAt: true },
    });
    const shop = await prisma.shop.findFirst({ where: { ownerId: req.user!.id } });
    return res.json({ user, shop });
  } catch (err: any) {
    return res.status(500).json({ error: err.message });
  }
});

// ==========================================
// SHOPS ROUTES
// ==========================================

app.get("/api/shops/current", authenticateToken, async (req: AuthRequest, res: Response) => {
  try {
    const shop = await prisma.shop.findFirst({ where: { ownerId: req.user!.id } });
    return res.json(shop);
  } catch (err: any) {
    return res.status(500).json({ error: err.message });
  }
});

app.put("/api/shops/current", authenticateToken, async (req: AuthRequest, res: Response) => {
  try {
    const { name, logoUrl, contact, email, gst, address } = req.body;
    let shop = await prisma.shop.findFirst({ where: { ownerId: req.user!.id } });

    if (!shop) {
      shop = await prisma.shop.create({
        data: {
          ownerId: req.user!.id,
          name: name?.trim().toUpperCase() || "MY SHOP",
          logoUrl,
          contact,
          email,
          gst: gst?.trim().toUpperCase() || null,
          address: address?.trim().toUpperCase() || null,
        },
      });
    } else {
      shop = await prisma.shop.update({
        where: { id: shop.id },
        data: {
          name: name !== undefined ? name.trim().toUpperCase() : shop.name,
          logoUrl: logoUrl !== undefined ? logoUrl : shop.logoUrl,
          contact: contact !== undefined ? contact : shop.contact,
          email: email !== undefined ? email : shop.email,
          gst: gst !== undefined ? (gst ? gst.trim().toUpperCase() : null) : shop.gst,
          address: address !== undefined ? (address ? address.trim().toUpperCase() : null) : shop.address,
        },
      });
    }

    return res.json(shop);
  } catch (err: any) {
    return res.status(500).json({ error: err.message });
  }
});

// ==========================================
// PRODUCTS (INVENTORY) ROUTES
// ==========================================

app.get("/api/products", authenticateToken, async (req: AuthRequest, res: Response) => {
  try {
    const shopId = req.user!.shopId;
    if (!shopId) return res.json([]);

    const products = await prisma.product.findMany({
      where: { shopId },
      orderBy: { createdAt: "desc" },
    });
    return res.json(products);
  } catch (err: any) {
    return res.status(500).json({ error: err.message });
  }
});

app.post("/api/products", authenticateToken, async (req: AuthRequest, res: Response) => {
  try {
    const shopId = req.user!.shopId;
    if (!shopId) return res.status(400).json({ error: "No shop associated with user" });

    const { model, category, productType, qty, price, lowStockThreshold } = req.body;
    const product = await prisma.product.create({
      data: {
        shopId,
        model,
        category,
        productType: productType || null,
        qty: Number(qty) || 0,
        price: Number(price) || 0,
        lowStockThreshold: Number(lowStockThreshold) || 5,
      },
    });

    return res.status(201).json(product);
  } catch (err: any) {
    return res.status(500).json({ error: err.message });
  }
});

app.put("/api/products/:id", authenticateToken, async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params as { id: string };
    const shopId = req.user!.shopId;
    const { model, category, productType, qty, price, lowStockThreshold } = req.body;

    await prisma.product.updateMany({
      where: { id, shopId },
      data: {
        ...(model !== undefined && { model }),
        ...(category !== undefined && { category }),
        ...(productType !== undefined && { productType }),
        ...(qty !== undefined && { qty: Number(qty) }),
        ...(price !== undefined && { price: Number(price) }),
        ...(lowStockThreshold !== undefined && { lowStockThreshold: Number(lowStockThreshold) }),
      },
    });

    const product = await prisma.product.findUnique({ where: { id } });
    return res.json(product);
  } catch (err: any) {
    return res.status(500).json({ error: err.message });
  }
});

app.delete("/api/products/:id", authenticateToken, async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params as { id: string };
    const shopId = req.user!.shopId;

    await prisma.product.deleteMany({ where: { id, shopId } });
    return res.json({ success: true });
  } catch (err: any) {
    return res.status(500).json({ error: err.message });
  }
});

// ==========================================
// TECHNICIANS ROUTES
// ==========================================

app.get("/api/technicians", authenticateToken, async (req: AuthRequest, res: Response) => {
  try {
    const shopId = req.user!.shopId;
    if (!shopId) return res.json([]);

    const technicians = await prisma.technician.findMany({
      where: { shopId },
      orderBy: { createdAt: "desc" },
    });
    return res.json(technicians);
  } catch (err: any) {
    return res.status(500).json({ error: err.message });
  }
});

app.post("/api/technicians", authenticateToken, async (req: AuthRequest, res: Response) => {
  try {
    const shopId = req.user!.shopId;
    if (!shopId) return res.status(400).json({ error: "No shop associated with user" });

    const { name, phone, specialization } = req.body;
    const tech = await prisma.technician.create({
      data: {
        shopId,
        name,
        phone: phone || null,
        specialization: specialization || null,
      },
    });

    return res.status(201).json(tech);
  } catch (err: any) {
    return res.status(500).json({ error: err.message });
  }
});

app.put("/api/technicians/:id", authenticateToken, async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params as { id: string };
    const shopId = req.user!.shopId;
    const { name, phone, specialization } = req.body;

    await prisma.technician.updateMany({
      where: { id, shopId },
      data: {
        ...(name !== undefined && { name }),
        ...(phone !== undefined && { phone }),
        ...(specialization !== undefined && { specialization }),
      },
    });

    const tech = await prisma.technician.findUnique({ where: { id } });
    return res.json(tech);
  } catch (err: any) {
    return res.status(500).json({ error: err.message });
  }
});

app.delete("/api/technicians/:id", authenticateToken, async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params as { id: string };
    const shopId = req.user!.shopId;

    await prisma.technician.deleteMany({ where: { id, shopId } });
    return res.json({ success: true });
  } catch (err: any) {
    return res.status(500).json({ error: err.message });
  }
});

// ==========================================
// SALES ROUTES
// ==========================================

app.get("/api/sales", authenticateToken, async (req: AuthRequest, res: Response) => {
  try {
    const shopId = req.user!.shopId;
    if (!shopId) return res.json([]);

    const sales = await prisma.sale.findMany({
      where: { shopId },
      orderBy: { createdAt: "desc" },
      include: { product: true },
    });
    return res.json(sales);
  } catch (err: any) {
    return res.status(500).json({ error: err.message });
  }
});

app.post("/api/sales", authenticateToken, async (req: AuthRequest, res: Response) => {
  try {
    const shopId = req.user!.shopId;
    if (!shopId) return res.status(400).json({ error: "No shop associated with user" });

    const {
      source,
      productId,
      productName,
      productType,
      qty,
      price,
      customerName,
      phone,
      address,
      saleDate,
    } = req.body;

    const saleQty = Number(qty) || 1;

    // Transaction to create sale and decrement stock if source is 'stock'
    const result = await prisma.$transaction(async (tx: any) => {
      if (source === "stock" && productId) {
        const prod = await tx.product.findUnique({ where: { id: productId } });
        if (prod) {
          const newQty = Math.max(0, prod.qty - saleQty);
          await tx.product.update({
            where: { id: productId },
            data: { qty: newQty },
          });
        }
      }

      return tx.sale.create({
        data: {
          shopId,
          source,
          productId: productId || null,
          productName,
          productType: productType || null,
          qty: saleQty,
          price: Number(price) || 0,
          customerName: customerName || null,
          phone: phone || null,
          address: address || null,
          saleDate: saleDate ? new Date(saleDate) : new Date(),
        },
      });
    });

    return res.status(201).json(result);
  } catch (err: any) {
    return res.status(500).json({ error: err.message });
  }
});

app.delete("/api/sales/:id", authenticateToken, async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params as { id: string };
    const shopId = req.user!.shopId;

    await prisma.sale.deleteMany({ where: { id, shopId } });
    return res.json({ success: true });
  } catch (err: any) {
    return res.status(500).json({ error: err.message });
  }
});

// ==========================================
// SERVICES & SERVICE ITEMS ROUTES
// ==========================================

app.get("/api/services", authenticateToken, async (req: AuthRequest, res: Response) => {
  try {
    const shopId = req.user!.shopId;
    if (!shopId) return res.json([]);

    const services = await prisma.service.findMany({
      where: { shopId },
      orderBy: { createdAt: "desc" },
      include: {
        technician: true,
        serviceItems: true,
      },
    });
    return res.json(services);
  } catch (err: any) {
    return res.status(500).json({ error: err.message });
  }
});

app.post("/api/services", authenticateToken, async (req: AuthRequest, res: Response) => {
  try {
    const shopId = req.user!.shopId;
    if (!shopId) return res.status(400).json({ error: "No shop associated with user" });

    const {
      customerName,
      phone,
      serviceType,
      technicianId,
      address,
      isFilterChange,
      serviceDate,
      nextServiceDate,
      items,
    } = req.body;

    const sDate = serviceDate ? new Date(serviceDate) : new Date();
    let nDate = nextServiceDate ? new Date(nextServiceDate) : null;

    if (isFilterChange && !nDate) {
      nDate = new Date(sDate);
      nDate.setMonth(nDate.getMonth() + 3); // 90 days / 3 months
    }

    const service = await prisma.service.create({
      data: {
        shopId,
        customerName,
        phone: phone || null,
        serviceType,
        technicianId: technicianId || null,
        address: address || null,
        isFilterChange: Boolean(isFilterChange),
        serviceDate: sDate,
        nextServiceDate: nDate,
        ...(Array.isArray(items) && items.length > 0
          ? {
              serviceItems: {
                create: items.map((it: any) => ({
                  shopId,
                  productName: it.productName,
                  price: Number(it.price) || 0,
                })),
              },
            }
          : {}),
      },
      include: {
        technician: true,
        serviceItems: true,
      },
    });

    return res.status(201).json(service);
  } catch (err: any) {
    return res.status(500).json({ error: err.message });
  }
});

app.put("/api/services/:id", authenticateToken, async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params as { id: string };
    const shopId = req.user!.shopId;
    const {
      customerName,
      phone,
      serviceType,
      technicianId,
      address,
      isFilterChange,
      serviceDate,
      nextServiceDate,
    } = req.body;

    await prisma.service.updateMany({
      where: { id, shopId },
      data: {
        ...(customerName !== undefined && { customerName }),
        ...(phone !== undefined && { phone }),
        ...(serviceType !== undefined && { serviceType }),
        ...(technicianId !== undefined && { technicianId }),
        ...(address !== undefined && { address }),
        ...(isFilterChange !== undefined && { isFilterChange: Boolean(isFilterChange) }),
        ...(serviceDate !== undefined && { serviceDate: new Date(serviceDate) }),
        ...(nextServiceDate !== undefined && { nextServiceDate: nextServiceDate ? new Date(nextServiceDate) : null }),
      },
    });

    const updated = await prisma.service.findUnique({
      where: { id },
      include: { technician: true, serviceItems: true },
    });
    return res.json(updated);
  } catch (err: any) {
    return res.status(500).json({ error: err.message });
  }
});

app.delete("/api/services/:id", authenticateToken, async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params as { id: string };
    const shopId = req.user!.shopId;

    await prisma.service.deleteMany({ where: { id, shopId } });
    return res.json({ success: true });
  } catch (err: any) {
    return res.status(500).json({ error: err.message });
  }
});

// ==========================================
// EMI PLANS ROUTES
// ==========================================

app.get("/api/emi", authenticateToken, async (req: AuthRequest, res: Response) => {
  try {
    const shopId = req.user!.shopId;
    if (!shopId) return res.json([]);

    const plans = await prisma.emiPlan.findMany({
      where: { shopId },
      orderBy: { createdAt: "desc" },
    });
    return res.json(plans);
  } catch (err: any) {
    return res.status(500).json({ error: err.message });
  }
});

app.post("/api/emi", authenticateToken, async (req: AuthRequest, res: Response) => {
  try {
    const shopId = req.user!.shopId;
    if (!shopId) return res.status(400).json({ error: "No shop associated with user" });

    const { customerName, phone, model, totalAmount, downPayment, tenureMonths, startDate } = req.body;

    const plan = await prisma.emiPlan.create({
      data: {
        shopId,
        customerName,
        phone: phone || null,
        model,
        totalAmount: Number(totalAmount) || 0,
        downPayment: Number(downPayment) || 0,
        tenureMonths: Number(tenureMonths) || 1,
        startDate: startDate ? new Date(startDate) : new Date(),
      },
    });

    return res.status(201).json(plan);
  } catch (err: any) {
    return res.status(500).json({ error: err.message });
  }
});

app.delete("/api/emi/:id", authenticateToken, async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params as { id: string };
    const shopId = req.user!.shopId;

    await prisma.emiPlan.deleteMany({ where: { id, shopId } });
    return res.json({ success: true });
  } catch (err: any) {
    return res.status(500).json({ error: err.message });
  }
});

// ==========================================
// ADMIN ROUTES
// ==========================================

app.get("/api/admin/users", authenticateToken, requireAdmin, async (req: AuthRequest, res: Response) => {
  try {
    const users = await prisma.user.findMany({
      select: {
        id: true,
        email: true,
        role: true,
        createdAt: true,
        shops: true,
      },
      orderBy: { createdAt: "desc" },
    });
    return res.json(users);
  } catch (err: any) {
    return res.status(500).json({ error: err.message });
  }
});

app.get("/api/admin/shops", authenticateToken, requireAdmin, async (req: AuthRequest, res: Response) => {
  try {
    const shops = await prisma.shop.findMany({
      include: {
        owner: { select: { id: true, email: true, role: true } },
        _count: {
          select: {
            products: true,
            sales: true,
            services: true,
            technicians: true,
            emiPlans: true,
          },
        },
      },
      orderBy: { createdAt: "desc" },
    });
    return res.json(shops);
  } catch (err: any) {
    return res.status(500).json({ error: err.message });
  }
});

// Static Asset & SPA Frontend Fallback
import path from "path";
import { fileURLToPath } from "url";
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const publicPath = path.join(__dirname, "../../.output/public");
app.use(express.static(publicPath));

app.use((req: Request, res: Response, next) => {
  if (req.path.startsWith("/api")) return next();
  res.sendFile(path.join(publicPath, "index.html"), (err) => {
    if (err) next();
  });
});

app.listen(PORT, () => {
  console.log(`[STOCKERZ RO API Server] Running on http://localhost:${PORT}`);
});

export default app;
