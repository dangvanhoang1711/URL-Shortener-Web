require("dotenv").config();

const { prisma } = require("../src/utils/prisma");

async function explainQuery(label, sql, params = []) {
  const plan = await prisma.$queryRawUnsafe(sql, ...params);

  return {
    label,
    sql,
    plan
  };
}

async function main() {
  const [url, user] = await Promise.all([
    prisma.url.findFirst({
      orderBy: { createdAt: "asc" },
      select: {
        id: true,
        shortCode: true,
        userId: true
      }
    }),
    prisma.user.findFirst({
      orderBy: { createdAt: "asc" },
      select: { id: true }
    })
  ]);

  const shortCode = url?.shortCode || "demo001";
  const urlId = url?.id || 1;
  const userId = user?.id || url?.userId || 1;

  const queries = [
    explainQuery(
      "Lookup by shortCode",
      "EXPLAIN SELECT `id`, `originalUrl`, `shortCode`, `clickCount`, `expiresAt` FROM `urls` WHERE `shortCode` = ? LIMIT 1",
      [shortCode]
    ),
    explainQuery(
      "Warm-cache candidate scan",
      "EXPLAIN SELECT `id`, `shortCode`, `clickCount`, `expiresAt` FROM `urls` ORDER BY `clickCount` DESC, `createdAt` DESC LIMIT 20"
    ),
    explainQuery(
      "User dashboard URLs",
      "EXPLAIN SELECT `id`, `shortCode`, `createdAt` FROM `urls` WHERE `userId` = ? ORDER BY `createdAt` DESC LIMIT 20",
      [userId]
    ),
    explainQuery(
      "QR lookup by urlId",
      "EXPLAIN SELECT `id`, `urlId`, `contentType` FROM `qr_codes` WHERE `urlId` = ? LIMIT 1",
      [urlId]
    )
  ];

  const result = await Promise.all(queries);

  console.log(
    JSON.stringify(
      {
        sampleValues: {
          shortCode,
          urlId,
          userId
        },
        result
      },
      null,
      2
    )
  );
}

main()
  .catch((error) => {
    console.error("Explain failed:", error.message);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
