const shortenerService = require("../services/shortenerService");

async function shortenUrl(req, res) {
  try {
    const { originalUrl } = req.body;

    if (!originalUrl) {
      return res.status(400).json({ error: "originalUrl is required" });
    }

    const result = await shortenerService.createShortUrl(originalUrl);

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

module.exports = {
  shortenUrl,
};