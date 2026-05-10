const shortenerService = require("../services/shortenerService");
const analyticsService = require("../services/analyticsService");

async function shortenUrl(req, res) {
  try {
    const { originalUrl } = req.body;
    const userId = req.user?.userId || null;

    if (!originalUrl) {
      return res.status(400).json({ error: "originalUrl is required" });
    }

    const result = await shortenerService.createShortUrl(originalUrl, userId);

    return res.json({
      id: result.id,
      shortCode: result.shortCode,
      originalUrl: result.originalUrl,
      clickCount: result.clickCount
    });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: "Server error" });
  }
}

async function getHistory(req, res) {
  try {
    const userId = req.user?.userId;
    if (!userId) {
      return res.status(401).json({ error: "Unauthorized" });
    }

    const urls = await shortenerService.getHistory(userId);
    return res.json({ urls });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: "Server error" });
  }
}

async function getStats(req, res) {
  try {
    const { short_code } = req.params;
    const stats = await analyticsService.getStats(short_code);

    if (!stats) {
      return res.status(404).json({ message: "Not found" });
    }

    return res.json(stats);
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: "Server error" });
  }
}

module.exports = {
  shortenUrl,
  getHistory,
  getStats,
};