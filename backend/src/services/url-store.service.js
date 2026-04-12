const { prisma } = require("../utils/prisma");
const { getRedisClient } = require("../utils/redis");

const cachePrefix = "short-url:";
const cacheTtlSeconds = Number(process.env.CACHE_TTL_SECONDS || 3600);

function getCacheKey(shortCode) {
  return `${cachePrefix}${shortCode}`;
}

async function saveUrl(data) {
  return prisma.url.create({
    data,
    select: {
      id: true,
      originalUrl: true,
      shortCode: true,
      clickCount: true,
      createdAt: true
    }
  });
}

async function getUrlByShortCode(shortCode) {
  const redis = await getRedisClient();

  if (redis) {
    const cachedUrl = await redis.get(getCacheKey(shortCode));
    if (cachedUrl) {
      return JSON.parse(cachedUrl);
    }
  }

  const url = await prisma.url.findUnique({
    where: { shortCode },
    select: {
      id: true,
      originalUrl: true,
      shortCode: true,
      clickCount: true,
      expiresAt: true
    }
  });

  if (url && redis) {
    await redis.set(getCacheKey(shortCode), JSON.stringify(url), {
      EX: cacheTtlSeconds
    });
  }

  return url;
}

async function recordClick(urlId, metadata = {}) {
  return prisma.$transaction([
    prisma.url.update({
      where: { id: urlId },
      data: {
        clickCount: { increment: 1 },
        lastClickedAt: new Date()
      }
    }),
    prisma.click.create({
      data: {
        urlId,
        ipAddress: metadata.ipAddress || null,
        userAgent: metadata.userAgent || null,
        referer: metadata.referer || null,
        countryCode: metadata.countryCode || null
      }
    })
  ]);
}

async function warmUrlCache(limit = 100) {
  const redis = await getRedisClient();
  if (!redis) {
    return 0;
  }

  const urls = await prisma.url.findMany({
    orderBy: [
      { clickCount: "desc" },
      { createdAt: "desc" }
    ],
    take: limit,
    select: {
      id: true,
      originalUrl: true,
      shortCode: true,
      clickCount: true,
      expiresAt: true
    }
  });

  for (const url of urls) {
    await redis.set(getCacheKey(url.shortCode), JSON.stringify(url), {
      EX: cacheTtlSeconds
    });
  }

  return urls.length;
}

module.exports = {
  saveUrl,
  getUrlByShortCode,
  recordClick,
  warmUrlCache
};
