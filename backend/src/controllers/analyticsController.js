const analyticsService = require("../services/analyticsService");

exports.getStats = async (req, res) => {
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
};