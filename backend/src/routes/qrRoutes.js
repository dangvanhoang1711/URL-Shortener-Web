const express = require("express");
const router = express.Router();
const qrController = require("../controllers/qrCodeController");

// Generate QR code for a short URL
// POST /api/urls/:short_code/qr-code
router.post("/urls/:short_code/qr-code", qrController.generateQRCode);

// Get QR code (as data URL or SVG) for a short URL
// GET /api/urls/:short_code/qr-code
router.get("/urls/:short_code/qr-code", qrController.getQRCode);

// Download QR code as file (PNG/SVG)
// GET /api/urls/:short_code/qr-code/download?format=png&size=300
router.get("/urls/:short_code/qr-code/download", qrController.downloadQRCode);

module.exports = router;