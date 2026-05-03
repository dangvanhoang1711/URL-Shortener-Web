const assert = require("node:assert/strict");
const test = require("node:test");

const {
  measureLookup,
  normalizeIterations
} = require("../scripts/lookup-benchmark");

test("measureLookup executes lookup function for every iteration", async () => {
  let callCount = 0;

  const result = await measureLookup("stubLookup", 5, async () => {
    callCount += 1;
    return { shortCode: "abc123" };
  });

  assert.equal(callCount, 5);
  assert.equal(result.label, "stubLookup");
  assert.equal(result.iterations, 5);
  assert.ok(result.totalMs >= 0);
  assert.ok(result.averageMs >= 0);
});

test("normalizeIterations falls back to default on invalid input", () => {
  assert.equal(normalizeIterations(undefined), 100);
  assert.equal(normalizeIterations("0"), 100);
  assert.equal(normalizeIterations("25"), 25);
});
