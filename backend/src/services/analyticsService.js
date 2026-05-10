const prisma = require("../config/prisma");
const { getRedisClient } = require("../utils/redis");

async function getOriginalUrl(code) {
  const redis = await getRedisClient();
  if (redis) {
    const cached = await redis.get(code);
    if (cached) return cached;
  }

  const record = await prisma.url.findUnique({
    where: { shortCode: code }
  });

  if (!record) return null;

  if (redis) {
    await redis.set(code, record.originalUrl, { EX: 86400 });
  }

  return record.originalUrl;
}

async function trackClick(code, req) {
  const url = await prisma.url.findUnique({
    where: { shortCode: code },
    select: { id: true }
  });

  if (!url) return;

  await prisma.url.update({
    where: { shortCode: code },
    data: {
      clickCount: { increment: 1 }
    }
  });

  await prisma.click.create({
    data: {
      urlId: url.id,
      ipAddress: req.ip || req.headers["x-forwarded-for"] || null,
      userAgent: req.headers["user-agent"] || null
    }
  });
}

async function getStats(code) {
  const url = await prisma.url.findUnique({
    where: { shortCode: code },
    include: {
      clicks: {
        orderBy: { clickedAt: "desc" },
        take: 50
      }
    }
  });

  if (!url) return null;

  return {
    shortCode: code,
    totalClicks: url.clickCount,
    clicks: url.clicks.map(c => ({
      time: c.clickedAt,
      ip: c.ipAddress,
      userAgent: c.userAgent
    }))
  };
}

module.exports = {
  getOriginalUrl,
  trackClick,
  getStats
};