const express = require("express");

const { prisma } = require("./utils/prisma");
const { getRedisClient } = require("./utils/redis");

const app = express();

app.use(express.json());

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

module.exports = app;
