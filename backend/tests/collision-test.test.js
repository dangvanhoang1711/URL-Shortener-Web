const assert = require("node:assert/strict");
const test = require("node:test");

const {
  encodeBase62,
  normalizeSampleSize,
  runCollisionTest
} = require("../scripts/collision-test");

test("encodeBase62 converts known values", () => {
  assert.equal(encodeBase62(0), "0");
  assert.equal(encodeBase62(61), "Z");
  assert.equal(encodeBase62(62), "10");
  assert.equal(encodeBase62(3843), "ZZ");
});

test("runCollisionTest keeps codes unique for sequential ids", () => {
  const result = runCollisionTest(5000);

  assert.equal(result.collision, false);
  assert.equal(result.uniqueCodes, 5000);
});

test("normalizeSampleSize falls back to default on invalid input", () => {
  assert.equal(normalizeSampleSize(undefined), 100000);
  assert.equal(normalizeSampleSize("0"), 100000);
  assert.equal(normalizeSampleSize("250"), 250);
});
