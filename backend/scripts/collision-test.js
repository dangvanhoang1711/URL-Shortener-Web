const alphabet = "0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ";

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

const sampleSize = Number(process.argv[2] || 100000);
const result = runCollisionTest(sampleSize);

console.log(JSON.stringify(result, null, 2));
