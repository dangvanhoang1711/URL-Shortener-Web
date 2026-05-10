const prisma = require('../config/prisma');
const { encodeBase62 } = require('../utils/base62');

function normalizeUrl(input) {
  try {
    const parsed = new URL(input);
    parsed.hostname = parsed.hostname.toLowerCase();
    if (parsed.pathname.endsWith('/') && parsed.pathname !== '/') {
      parsed.pathname = parsed.pathname.slice(0, -1);
    }
    if (parsed.pathname === '' && parsed.searchParams.toString() === '' && !parsed.hash) {
      parsed.pathname = '/';
    }
    return parsed.toString();
  } catch {
    return input;
  }
}

async function createShortUrl(originalUrl, userId = null, title = null) {
  const normalizedUrl = normalizeUrl(originalUrl);

  if (userId) {
    const existing = await prisma.url.findFirst({
      where: {
        userId: userId,
        originalUrl: normalizedUrl,
      },
    });
    if (existing) {
      return existing;
    }
  }

  const newUrl = await prisma.url.create({
    data: {
      originalUrl: normalizedUrl,
      userId: userId,
      title: title || null,
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

async function getLinkById(linkId, userId) {
  return await prisma.url.findFirst({
    where: {
      id: linkId,
      userId: userId
    },
    include: {
      clicks: {
        orderBy: { clickedAt: 'desc' },
        take: 50
      }
    }
  });
}

async function deleteLink(linkId, userId) {
  const result = await prisma.url.deleteMany({
    where: {
      id: linkId,
      userId: userId
    }
  });
  return result.count > 0;
}

module.exports = {
  createShortUrl,
  getHistory,
  getLinkById,
  deleteLink,
};