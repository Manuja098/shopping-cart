import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  console.log("Seeding database...");

  const categories = [
    { name: "Vegetables", slug: "vegetables" },
    { name: "Fruits", slug: "fruits" },
    { name: "Cakes", slug: "cakes" },
    { name: "Biscuits", slug: "biscuits" },
  ];

  for (const cat of categories) {
    await prisma.category.upsert({
      where: { slug: cat.slug },
      update: {},
      create: cat,
    });
  }
  console.log("Categories seeded!");

  const passwordHash = await bcrypt.hash("Admin@123456", 12);
  await prisma.user.upsert({
    where: { email: "admin@shop.com" },
    update: {},
    create: {
      name: "Admin",
      email: "admin@shop.com",
      passwordHash,
      authProvider: "local",
      role: "admin",
    },
  });
  console.log("Admin seeded! Email: admin@shop.com | Password: Admin@123456");
}

main()
  .catch((e) => { console.error(e); process.exit(1); })
  .finally(async () => { await prisma.$disconnect(); });