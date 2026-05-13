function normalizeIterations(input) {
  const n = parseInt(input, 10);
  return Number.isFinite(n) && n > 0 ? n : 100;
}

async function measureLookup(label, iterations, lookupFn) {
  const start = Date.now();
  for (let i = 0; i < iterations; i++) {
    await lookupFn();
  }
  const totalMs = Date.now() - start;
  return { label, iterations, totalMs, averageMs: totalMs / iterations };
}

module.exports = { measureLookup, normalizeIterations };
