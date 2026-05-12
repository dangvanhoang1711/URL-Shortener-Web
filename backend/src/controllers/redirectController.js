const analyticsService = require("../services/analyticsService");
const { asyncHandler } = require("../middlewares/errorHandler");

exports.redirect = asyncHandler(async (req, res) => {
  const { short_code } = req.params;

  const url = await analyticsService.getOriginalUrl(short_code);

  if (!url) {
    return res.status(404).json({ message: "Not found" });
  }

  analyticsService.trackClick(short_code, req).catch(console.error);

  return res.redirect(302, url);
});