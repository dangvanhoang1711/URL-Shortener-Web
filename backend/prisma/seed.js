require("dotenv").config();

const { PrismaClient } = require("@prisma/client");

const prisma = new PrismaClient();

async function main() {
  const demoUser = await prisma.user.upsert({
    where: { email: "demo@example.com" },
    update: {},
    create: {
      email: "demo@example.com",
      password: "demo-password"
    }
  });

  const demoUrls = [
    {
      originalUrl: "https://www.google.com",
      shortCode: "ggl001",
      title: "Google"
    },
    {
      originalUrl: "https://github.com",
      shortCode: "git001",
      title: "GitHub"
    }
  ];

  for (const item of demoUrls) {
    await prisma.url.upsert({
      where: { shortCode: item.shortCode },
      update: {},
      create: {
        ...item,
        userId: demoUser.id
      }
    });
  }

  console.log("Seed completed successfully.");
}

main()
  .catch((error) => {
    console.error("Seed failed:", error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
