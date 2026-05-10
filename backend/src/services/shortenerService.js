const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();
const { encodeBase62 } = require("../utils/base62");

async function createShortUrl(originalUrl, userId = null) {
  const newUrl = await prisma.url.create({
    data: {
      originalUrl: originalUrl,
      userId: userId,
    },
  });

  const shortCode = encodeBase62(newUrl.id);

  const updatedUrl = await prisma.url.update({
    where: { id: newUrl.id },
    data: {
      shortCode: shortCode
    },
  });

  return updatedUrl;
}

async function getHistory(userId) {
  return await prisma.url.findMany({
    where: { userId: userId },
    orderBy: { createdAt: 'desc' },
    select: {
      id: true,
      originalUrl: true,
      shortCode: true,
      clickCount: true,
      createdAt: true,
      title: true,
    },
  });
}

module.exports = {
  createShortUrl,
  getHistory,
};