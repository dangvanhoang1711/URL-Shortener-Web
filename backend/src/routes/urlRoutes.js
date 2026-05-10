const express = require("express");
const router = express.Router();
const urlController = require("../controllers/urlController");
const redirectController = require("../controllers/redirectController");
const qrController = require("../controllers/qrCodeController");
const { authMiddleware } = require("../middlewares/authMiddleware");

router.post("/shorten", authMiddleware, urlController.shortenUrl);
router.get("/history", authMiddleware, urlController.getHistory);

router.get("/links", authMiddleware, urlController.getHistory);
router.get("/links/:id", authMiddleware, urlController.getLinkById);
router.delete("/links/:id", authMiddleware, urlController.deleteLink);

router.post("/:short_code/qr-code", qrController.generateQRCode);
router.get("/:short_code/qr-code", qrController.getQRCode);
router.get("/:short_code/qr-code/download", qrController.downloadQRCode);

router.get("/:short_code/stats", urlController.getStats);

router.get("/:short_code", redirectController.redirect);

module.exports = router;
