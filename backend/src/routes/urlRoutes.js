const express = require("express");
const router = express.Router();
const urlController = require("../controllers/urlController");
const redirectController = require("../controllers/redirectController");

// Route tạo link rút gọn (Của nhánh feature/hmhieu-test)
router.post("/shorten", urlController.shortenUrl);

// Route chuyển hướng link - NMHieu's responsibility (Của nhánh MinhHieu)
router.get("/:short_code", redirectController.redirect);

module.exports = router;