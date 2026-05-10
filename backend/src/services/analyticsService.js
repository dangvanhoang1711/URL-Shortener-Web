const prisma = require("../config/prisma");
const { getRedisClient } = require("../utils/redis");

const SHORT_CODE_REGEX = /^[a-zA-Z0-9_-]+$/;

async function getOriginalUrl(code) {
  if (!SHORT_CODE_REGEX.test(code)) return null;

  const redis = await getRedisClient();
  if (redis) {
    const cached = await redis.get(`url:${code}`);
    if (cached) return cached;
  }

  const record = await prisma.url.findUnique({
    where: { shortCode: code }
  });

  if (!record) return null;

  if (redis) {
    await redis.set(`url:${code}`, record.originalUrl, { EX: 86400 });
  }

  return record.originalUrl;
}

async function trackClick(code, req) {
  if (!SHORT_CODE_REGEX.test(code)) return;

  const url = await prisma.url.update({
    where: { shortCode: code },
    data: {
      clickCount: { increment: 1 },
      lastClickedAt: new Date()
    }
  }).catch(() => null);

  if (!url) return;

  const redis = await getRedisClient();
  if (redis) {
    await redis.set(`url:${code}`, url.originalUrl, { EX: 86400 });
  }

  await prisma.click.create({
    data: {
      urlId: url.id,
      ipAddress: req.ip || req.headers["x-forwarded-for"] || null,
      userAgent: req.headers["user-agent"] || null
    }
  }).catch(() => {});
}

async function getStats(code) {
  if (!SHORT_CODE_REGEX.test(code)) return null;

  const url = await prisma.url.findUnique({
    where: { shortCode: code },
    select: {
      shortCode: true,
      clickCount: true,
      clicks: {
        orderBy: { clickedAt: "desc" },
        take: 100
      }
    }
  });

  if (!url) return null;

  const last7Days = [];
  const now = Date.now();
  for (let i = 6; i >= 0; i--) {
    const d = new Date(now);
    d.setDate(d.getDate() - i);
    last7Days.push(d.toISOString().split('T')[0]);
  }

  const dailyClicks = last7Days.map(date => {
    const count = url.clicks.filter(c => {
      const clickDate = new Date(c.clickedAt).toISOString().split('T')[0];
      return clickDate === date;
    }).length;
    return { date, clicks: count };
  });

  return {
    shortCode: url.shortCode,
    totalClicks: url.clickCount,
    dailyClicks,
    recentClicks: url.clicks.map(c => ({
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