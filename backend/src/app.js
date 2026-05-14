require("dotenv").config();
const express = require("express");
const path = require("path");
const fs = require("fs");
const helmet = require("helmet");
const rateLimit = require("express-rate-limit");
const prisma = require("./config/prisma");
const { getRedisClient } = require("./utils/redis");
const urlRoutes = require("./routes/urlRoutes");
const authRoutes = require("./routes/authRoutes");
const contactRoutes = require("./routes/contactRoutes");
const passwordResetRoutes = require("./routes/passwordResetRoutes");
const { errorHandler } = require("./middlewares/errorHandler");

const app = express();

app.set('trust proxy', 1);
app.use(helmet());
app.use(express.json({ limit: '10kb' }));

app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', process.env.CORS_ORIGIN || '*');
  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  if (req.method === 'OPTIONS') return res.sendStatus(200);
  next();
});

const frontendPath = fs.existsSync('/app/public')
  ? '/app/public'
  : path.join(__dirname, '../../frontend/dist');

app.use(rateLimit({ windowMs: 15 * 60 * 1000, max: 200, standardHeaders: true, legacyHeaders: false, message: { error: 'Too many requests' } }));
app.use("/api/auth", rateLimit({ windowMs: 15 * 60 * 1000, max: 20, standardHeaders: true, legacyHeaders: false, message: { error: 'Too many auth attempts' } }));
app.use("/api/urls/shorten", rateLimit({ windowMs: 60 * 1000, max: 30, standardHeaders: true, legacyHeaders: false, message: { error: 'Rate limit exceeded' } }));

app.get("/health", async (req, res) => {
  const result = { ok: true, database: "unknown", cache: "unknown", timestamp: new Date().toISOString() };
  try {
    await prisma.$queryRaw`SELECT 1`;
    result.database = "connected";
  } catch (e) {
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
  } catch (e) {
    result.cache = "unavailable";
  }
  res.status(result.ok ? 200 : 503).json(result);
});

app.use("/api/auth", authRoutes);
app.use("/api/urls", urlRoutes);
app.use("/api", contactRoutes);
app.use("/api", passwordResetRoutes);

app.use('/api', (req, res) => {
  res.status(404).json({
    error: 'NOT_FOUND',
    message: `API endpoint ${req.method} ${req.path} not found`
  });
});

if (fs.existsSync(frontendPath)) {
  app.use(express.static(frontendPath));
  app.get("*", (req, res) => {
    res.sendFile(path.join(frontendPath, "index.html"));
  });
}

app.use(errorHandler);

module.exports = app;