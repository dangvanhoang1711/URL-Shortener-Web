const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();
const { encodeBase62 } = require("../utils/base62");

async function createShortUrl(originalUrl) {
  const newUrl = await prisma.url.create({
    data: {
      originalUrl: originalUrl, 
    },
  });

  // 2. Encode ID → shortCode
  const shortCode = encodeBase62(newUrl.id);

  // 3. Update lại record 
  const updatedUrl = await prisma.url.update({
    where: { id: newUrl.id },
    data: { 
      shortCode: shortCode 
    },
  });

  return updatedUrl;
}

module.exports = {
  createShortUrl,
};