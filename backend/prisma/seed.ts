import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  console.log("Seeding database...");

  const adminEmail = "admin@stockerzro.com";
  const existingAdmin = await prisma.user.findUnique({
    where: { email: adminEmail },
  });

  if (!existingAdmin) {
    const passwordHash = await bcrypt.hash("AdminSecretPassword123!", 10);
    const admin = await prisma.user.create({
      data: {
        email: adminEmail,
        passwordHash,
        role: "ADMIN",
        shops: {
          create: {
            name: "ADMIN HEADQUARTERS",
            email: adminEmail,
            contact: "9999999999",
            address: "ADMINISTRATOR MAIN OFFICE",
          },
        },
      },
      include: { shops: true },
    });
    console.log(`Created default admin user: ${admin.email}`);
  } else {
    console.log("Default admin already exists.");
  }
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
