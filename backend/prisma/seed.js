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

  const qrPlaceholder = "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVQIHWP4////fwAJ+wP9KobjigAAAABJRU5ErkJggg==";

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

  const createdUrls = [];

  for (const item of demoUrls) {
    const url = await prisma.url.upsert({
      where: { shortCode: item.shortCode },
      update: {},
      create: {
        ...item,
        userId: demoUser.id
      }
    });

    createdUrls.push(url);
  }

  if (createdUrls[0]) {
    await prisma.qrCode.upsert({
      where: { urlId: createdUrls[0].id },
      update: {},
      create: {
        urlId: createdUrls[0].id,
        imageData: qrPlaceholder
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
