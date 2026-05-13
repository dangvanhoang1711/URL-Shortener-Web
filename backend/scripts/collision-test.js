const { encodeBase62 } = require("../src/utils/base62");

function normalizeSampleSize(input) {
  const n = parseInt(input, 10);
  return Number.isFinite(n) && n > 0 ? n : 100000;
}

function runCollisionTest(sampleSize) {
  const seen = new Set();
  for (let i = 0; i < sampleSize; i++) {
    seen.add(encodeBase62(i));
  }
  return { collision: seen.size !== sampleSize, uniqueCodes: seen.size };
}

module.exports = { encodeBase62, normalizeSampleSize, runCollisionTest };
