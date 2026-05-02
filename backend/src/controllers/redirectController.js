const analyticsService = require("../services/analyticsService");

exports.redirect = async (req, res) => {
  try {
    const { short_code } = req.params;

    const url = await analyticsService.getOriginalUrl(short_code);

    if (!url) {
      return res.status(404).json({ message: "Not found" });
    }

    // fire-and-forget tracking (không delay redirect)
    analyticsService.trackClick(short_code, req).catch(console.error);

    return res.redirect(302, url);
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: "Server error" });
  }
};