const shortenerService = require("../services/shortenerService");

async function shortenUrl(req, res) {
  try {
    const { url } = req.body;

    if (!url) {
      return res.status(400).json({ error: "URL is required" });
    }

    const result = await shortenerService.createShortUrl(url);

    return res.json({
      short_url: `http://localhost:3001/${result.shortCode}`,
      original_url: result.originalUrl,
    });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: "Server error" });
  }
}

module.exports = {
  shortenUrl,
};