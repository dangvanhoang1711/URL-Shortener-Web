require("dotenv").config();

const { performance } = require("node:perf_hooks");

const { getUrlByShortCode, warmUrlCache } = require("../src/services/url-store.service");
const { prisma } = require("../src/utils/prisma");

async function measureLookup(shortCode, iterations) {
  const startedAt = performance.now();

  for (let index = 0; index < iterations; index += 1) {
    await getUrlByShortCode(shortCode);
  }

  const totalMs = performance.now() - startedAt;

  return {
    iterations,
    totalMs: Number(totalMs.toFixed(2)),
    averageMs: Number((totalMs / iterations).toFixed(2))
  };
}

async function main() {
  const url = await prisma.url.findFirst({
    orderBy: { createdAt: "asc" },
    select: { shortCode: true }
  });

  if (!url) {
    throw new Error("No URL records found. Run the seed script first.");
  }

  await warmUrlCache(20);

  const iterations = Number(process.argv[2] || 100);
  const result = await measureLookup(url.shortCode, iterations);

  console.log(JSON.stringify({ shortCode: url.shortCode, ...result }, null, 2));
}

main()
  .catch((error) => {
    console.error("Benchmark failed:", error.message);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
