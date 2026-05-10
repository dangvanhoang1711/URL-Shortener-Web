const express = require("express");
const router = express.Router();
const urlController = require("../controllers/urlController");
const redirectController = require("../controllers/redirectController");
const qrController = require("../controllers/qrCodeController");

// Route tạo link rút gọn (Của nhánh feature/hmhieu-test)
router.post("/shorten", urlController.shortenUrl);

// Route chuyển hướng link - NMHieu's responsibility (Của nhánh MinhHieu)
router.get("/:short_code", redirectController.redirect);

// QR Code routes - NMHieu's responsibility
router.post("/urls/:short_code/qr-code", qrController.generateQRCode);
router.get("/urls/:short_code/qr-code", qrController.getQRCode);
router.get("/urls/:short_code/qr-code/download", qrController.downloadQRCode);

module.exports = router;