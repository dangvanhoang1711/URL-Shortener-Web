require("dotenv").config();

const { performance } = require("node:perf_hooks");

const {
  findUrlByShortCode,
  getUrlByShortCode,
  warmUrlCache
} = require("../src/services/url-store.service");
const { prisma } = require("../src/utils/prisma");

function normalizeIterations(value) {
  const parsedValue = Number.parseInt(value, 10);

  if (!Number.isFinite(parsedValue) || parsedValue <= 0) {
    return 100;
  }

  return parsedValue;
}

async function measureLookup(label, iterations, lookupFn) {
  const startedAt = performance.now();

  for (let index = 0; index < iterations; index += 1) {
    await lookupFn();
  }

  const totalMs = performance.now() - startedAt;

  return {
    label,
    iterations,
    totalMs: Number(totalMs.toFixed(2)),
    averageMs: Number((totalMs / iterations).toFixed(2))
  };
}

async function runBenchmark(shortCode, iterations) {
  const databaseOnly = await measureLookup("databaseOnly", iterations, () => findUrlByShortCode(shortCode));

  await warmUrlCache(20);

  const serviceLookup = await measureLookup("serviceLookup", iterations, () => getUrlByShortCode(shortCode));

  return {
    shortCode,
    cacheEnabled: Boolean(process.env.REDIS_URL),
    databaseOnly,
    serviceLookup
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

  const iterations = normalizeIterations(process.argv[2]);
  const result = await runBenchmark(url.shortCode, iterations);

  console.log(JSON.stringify(result, null, 2));
}

if (require.main === module) {
  main()
    .catch((error) => {
      console.error("Benchmark failed:", error.message);
      process.exitCode = 1;
    })
    .finally(async () => {
      await prisma.$disconnect();
    });
}

module.exports = {
  measureLookup,
  normalizeIterations,
  runBenchmark
};
