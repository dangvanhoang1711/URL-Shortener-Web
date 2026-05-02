const prisma = require("../config/prisma");
const redis = require("../config/redis");

/**
 * GET ORIGINAL URL (Redis → DB)
 */
async function getOriginalUrl(code) {
  // 1. Redis cache
  const cached = await redis.get(code);
  if (cached) return cached;

  // 2. DB fallback
  const record = await prisma.url.findUnique({
    where: { short_code: code }
  });

  if (!record) return null;

  // 3. save cache
  await redis.set(code, record.original_url, {
    EX: 86400
  });

  return record.original_url;
}

/**
 * TRACK CLICK (optimized version)
 */
async function trackClick(code, req) {
  // chỉ query 1 lần
  const url = await prisma.url.findUnique({
    where: { short_code: code },
    select: { id: true }
  });

  if (!url) return;

  // 1. atomic increment (chuẩn hơn)
  await prisma.url.update({
    where: { short_code: code },
    data: {
      click_count: {
        increment: 1
      }
    }
  });

  // 2. log click (không block redirect)
  await prisma.click.create({
    data: {
      urlId: url.id,
      ip: req.ip || req.headers["x-forwarded-for"] || null,
      userAgent: req.headers["user-agent"] || null
    }
  });
}

/**
 * ANALYTICS API
 */
async function getStats(code) {
  const url = await prisma.url.findUnique({
    where: { short_code: code },
    include: {
      clicks: {
        orderBy: { clicked_at: "desc" },
        take: 50
      }
    }
  });

  if (!url) return null;

  return {
    short_code: code,
    total_clicks: url.click_count,
    clicks: url.clicks.map(c => ({
      time: c.clicked_at,
      ip: c.ip,
      user_agent: c.userAgent
    }))
  };
}

module.exports = {
  getOriginalUrl,
  trackClick,
  getStats
};