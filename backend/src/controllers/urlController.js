const shortenerService = require("../services/shortenerService");
const analyticsService = require("../services/analyticsService");
const { asyncHandler } = require("../middlewares/errorHandler");

function isValidHttpUrl(value) {
  try {
    const url = new URL(value);
    return url.protocol === "http:" || url.protocol === "https:";
  } catch {
    return false;
  }
}

const shortenUrl = asyncHandler(async (req, res) => {
  const { originalUrl, title } = req.body;
  const userId = req.user?.userId || null;

  if (!originalUrl) {
    return res.status(400).json({ error: "originalUrl is required" });
  }

  let normUrl = originalUrl.trim();
  if (!/^https?:\/\//i.test(normUrl)) {
    normUrl = "https://" + normUrl;
  }
  if (!isValidHttpUrl(normUrl)) {
    return res.status(400).json({ error: "Invalid URL format" });
  }

  const result = await shortenerService.createShortUrl(normUrl, userId, title || null);

  return res.json({
    id: result.id,
    shortCode: result.shortCode,
    originalUrl: result.originalUrl,
    clickCount: result.clickCount,
    title: result.title
  });
});

const getHistory = asyncHandler(async (req, res) => {
  const userId = req.user?.userId;
  if (!userId) {
    return res.status(401).json({ error: "Unauthorized" });
  }

  const urls = await shortenerService.getHistory(userId);
  return res.json({ urls });
});

const getLinkById = asyncHandler(async (req, res) => {
  const userId = req.user?.userId;
  if (!userId) {
    return res.status(401).json({ error: "Unauthorized" });
  }

  const linkId = parseInt(req.params.id, 10);
  if (isNaN(linkId)) {
    return res.status(400).json({ error: "Invalid link ID" });
  }

  const link = await shortenerService.getLinkById(linkId, userId);

  if (!link) {
    return res.status(404).json({ error: "Link not found" });
  }

  return res.json({ link });
});

const deleteLink = asyncHandler(async (req, res) => {
  const userId = req.user?.userId;
  if (!userId) {
    return res.status(401).json({ error: "Unauthorized" });
  }

  const linkId = parseInt(req.params.id, 10);
  if (isNaN(linkId)) {
    return res.status(400).json({ error: "Invalid link ID" });
  }

  const deleted = await shortenerService.deleteLink(linkId, userId);

  if (!deleted) {
    return res.status(404).json({ error: "Link not found or not owned by you" });
  }

  return res.status(200).json({ message: "Link deleted successfully" });
});

const getStats = asyncHandler(async (req, res) => {
  const { short_code } = req.params;
  const stats = await analyticsService.getStats(short_code);

  if (!stats) {
    return res.status(404).json({ message: "Not found" });
  }

  return res.json(stats);
});

module.exports = {
  shortenUrl,
  getHistory,
  getLinkById,
  deleteLink,
  getStats,
};