const alphabet = "0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ";

function normalizeSampleSize(value) {
  const parsedValue = Number.parseInt(value, 10);

  if (!Number.isFinite(parsedValue) || parsedValue <= 0) {
    return 100000;
  }

  return parsedValue;
}

function encodeBase62(value) {
  if (value === 0) {
    return alphabet[0];
  }

  let number = value;
  let output = "";

  while (number > 0) {
    output = alphabet[number % 62] + output;
    number = Math.floor(number / 62);
  }

  return output;
}

function runCollisionTest(sampleSize) {
  const seen = new Set();

  for (let id = 1; id <= sampleSize; id += 1) {
    const shortCode = encodeBase62(id);
    if (seen.has(shortCode)) {
      return {
        sampleSize,
        collision: true,
        shortCode,
        id
      };
    }

    seen.add(shortCode);
  }

  return {
    sampleSize,
    collision: false,
    uniqueCodes: seen.size
  };
}

if (require.main === module) {
  const sampleSize = normalizeSampleSize(process.argv[2]);
  const result = runCollisionTest(sampleSize);

  console.log(JSON.stringify(result, null, 2));
}

module.exports = {
  alphabet,
  encodeBase62,
  normalizeSampleSize,
  runCollisionTest
};
