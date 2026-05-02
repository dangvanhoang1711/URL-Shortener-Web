const express = require("express");
const { prisma } = require("./utils/prisma");
const { getRedisClient } = require("./utils/redis");
const urlRoutes = require("./routes/urlRoutes");

const app = express();

// Middleware để đọc dữ liệu JSON từ request body
app.use(express.json());

/**
 * Route: Kiểm tra sức khỏe hệ thống (Health Check)
 */
app.get("/health", async (req, res) => {
  const result = {
    ok: true,
    database: "unknown",
    cache: "unknown"
  };

  try {
    await prisma.$queryRaw`SELECT 1`;
    result.database = "connected";
  } catch (error) {
    result.ok = false;
    result.database = "disconnected";
  }

  try {
    const redis = await getRedisClient();
    if (redis) {
      await redis.ping();
      result.cache = "connected";
    } else {
      result.cache = "disabled";
    }
  } catch (error) {
    result.ok = false;
    result.cache = "disconnected";
  }

  res.status(result.ok ? 200 : 503).json(result);
});

/**
 * Các Routes logic chính của ứng dụng
 * Mình giữ /api để đồng nhất với cấu trúc cũ của bạn
 */
app.use("/api", urlRoutes);

module.exports = app;