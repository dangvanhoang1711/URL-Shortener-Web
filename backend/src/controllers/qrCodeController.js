const { generateQRForURL, getQRCode } = require("../services/qrCodeService");
const { prisma } = require("../utils/prisma");

/**
 * Generate QR code for a short URL
 * POST /api/urls/:short_code/qr-code
 */
exports.generateQRCode = async (req, res) => {
  try {
    const { short_code } = req.params;
    const { format = 'png', size = 300 } = req.query;

    // Find the URL record by short_code
    const urlRecord = await prisma.url.findUnique({
      where: { short_code }
    });

    if (!urlRecord) {
      return res.status(404).json({ error: "URL not found" });
    }

    // Generate QR code for the short URL (e.g., http://localhost:3000/abc123)
    // In production, we might want to use the actual base URL.
    // For now, we'll construct the short URL from the request header or use a default.
    const baseUrl = `${req.protocol}://${req.get('host')}`;
    const shortUrl = `${baseUrl}/${short_code}`;

    const qrData = await generateQRForURL(urlRecord.id, shortUrl, { format, size });

    // Return the QR code data
    res.json({
      success: true,
      data: {
        id: qrData.id,
        urlId: qrData.urlId,
        qrData: qrData.qrData,
        format: qrData.format,
        size: qrData.size,
        createdAt: qrData.createdAt,
        updatedAt: qrData.updatedAt
      }
    });
  } catch (error) {
    console.error("Error generating QR code:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

/**
 * Get QR code for a short URL (as data URL or SVG)
 * GET /api/urls/:short_code/qr-code
 */
exports.getQRCode = async (req, res) => {
  try {
    const { short_code } = req.params;
    const { format = 'png' } = req.query;

    // Find the URL record by short_code
    const urlRecord = await prisma.url.findUnique({
      where: { short_code }
    });

    if (!urlRecord) {
      return res.status(404).json({ error: "URL not found" });
    }

    // Get QR code data (from cache or DB)
    const qrData = await getQRCode(urlRecord.id, format);

    if (!qrData) {
      return res.status(404).json({ error: "QR code not found" });
    }

    // If it's from cache, we only have qrData and format (and fromCache flag)
    // If it's from DB, we have more fields.
    // We'll return the data in a consistent format.
    let responseData = {
      qrData: qrData.qrData,
      format: qrData.format
    };

    // If we have size from DB, include it
    if (qrData.size !== undefined) {
      responseData.size = qrData.size;
    }

    res.json({
      success: true,
      data: responseData
    });
  } catch (error) {
    console.error("Error getting QR code:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

/**
 * Download QR code as file (PNG/SVG)
 * GET /api/urls/:short_code/qr-code/download
 */
exports.downloadQRCode = async (req, res) => {
  try {
    const { short_code } = req.params;
    const { format = 'png', size = 300 } = req.query;

    // Find the URL record by short_code
    const urlRecord = await prisma.url.findUnique({
      where: { short_code }
    });

    if (!urlRecord) {
      return res.status(404).json({ error: "URL not found" });
    }

    // Get QR code data
    const qrData = await getQRCode(urlRecord.id, format);

    if (!qrData) {
      return res.status(404).json({ error: "QR code not found" });
    }

    // Determine content type and file extension
    let contentType;
    let extension;
    if (format === 'svg') {
      contentType = 'image/svg+xml';
      extension = 'svg';
    } else {
      contentType = 'image/png';
      extension = 'png';
    }

    // Set headers for file download
    res.setHeader('Content-Type', contentType);
    res.setHeader('Content-Disposition', `attachment; filename="qr-code-${short_code}.${extension}"`);

    // Send the QR code data
    // If it's a data URL (from PNG generation), we need to extract the base64 data
    if (qrData.qrData.startsWith('data:')) {
      // Remove the data URL prefix (e.g., "data:image/png;base64,")
      const matches = qrData.qrData.match(/^data:([^,]+),(.+)$/);
      if (matches && matches.length === 3) {
        const base64Data = matches[2];
        res.send(Buffer.from(base64Data, 'base64'));
      } else {
        // If it's not a data URL, send as is (should be SVG string)
        res.send(qrData.qrData);
      }
    } else {
      // It's already an SVG string or plain text
      res.send(qrData.qrData);
    }
  } catch (error) {
    console.error("Error downloading QR code:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};