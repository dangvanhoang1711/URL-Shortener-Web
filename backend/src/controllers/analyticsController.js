const analyticsService = require("../services/analyticsService");
const { asyncHandler } = require("../middlewares/errorHandler");

exports.getStats = asyncHandler(async (req, res) => {
  const { short_code } = req.params;
  const stats = await analyticsService.getStats(short_code);

  if (!stats) {
    return res.status(404).json({ message: "Not found" });
  }

  return res.json(stats);
});