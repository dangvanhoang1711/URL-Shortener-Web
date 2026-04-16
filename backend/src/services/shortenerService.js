const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();
const { encodeBase62 } = require("../utils/base62");

async function createShortUrl(originalUrl) {
  // 1. Insert trước để lấy ID
  const newUrl = await prisma.url.create({
    data: {
      original_url: originalUrl,
    },
  });

  // 2. Encode ID → short_code
  const shortCode = encodeBase62(newUrl.id);

  // 3. Update lại record
  const updatedUrl = await prisma.url.update({
    where: { id: newUrl.id },
    data: { short_code: shortCode },
  });

  return updatedUrl;
}

module.exports = {
  createShortUrl,
};