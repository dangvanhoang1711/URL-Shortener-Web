const shortenerService = require("../services/shortenerService");
const analyticsService = require("../services/analyticsService");

const URL_REGEX = /^(https?:\/\/)?([\da-z.-]+)\.([a-z.]{2,6})([\/\w .-]*)*\/?$/i;

async function shortenUrl(req, res) {
  try {
    const { originalUrl, title } = req.body;
    const userId = req.user?.userId || null;

    if (!originalUrl) {
      return res.status(400).json({ error: "originalUrl is required" });
    }

    if (!URL_REGEX.test(originalUrl)) {
      return res.status(400).json({ error: "Invalid URL format" });
    }

    const result = await shortenerService.createShortUrl(originalUrl, userId, title || null);

    return res.json({
      id: result.id,
      shortCode: result.shortCode,
      originalUrl: result.originalUrl,
      clickCount: result.clickCount,
      title: result.title
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

async function getLinkById(req, res) {
  try {
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
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: "Server error" });
  }
}

async function deleteLink(req, res) {
  try {
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
  getLinkById,
  deleteLink,
  getStats,
};