const express = require("express");
const path = require("path");
const { prisma } = require("./utils/prisma");
const { getRedisClient } = require("./utils/redis");
const urlRoutes = require("./routes/urlRoutes");
const authRoutes = require("./routes/authRoutes");
const { errorHandler, notFoundHandler } = require("./middlewares/errorHandler");

const app = express();

// Middleware để đọc dữ liệu JSON từ request body
app.use(express.json());

// CORS Configuration
app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  
  if (req.method === 'OPTIONS') {
    return res.sendStatus(200);
  }
  next();
});

// Serve static frontend files from dist folder
const frontendPath = path.resolve("/app/frontend/dist");
app.use(express.static(frontendPath));

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
app.use("/api/auth", authRoutes);
app.use("/api", urlRoutes);

/**
 * Fallback route để phục vụ React SPA
 * Tất cả routes không khớp với /api sẽ được redirect tới index.html
 */
app.get("*", (req, res) => {
  res.sendFile(path.join(frontendPath, "index.html"));
});

/**
 * Error Handling Middleware
 * PHẢI được gọi sau tất cả các routes
 */
app.use(notFoundHandler);
app.use(errorHandler);

module.exports = app;