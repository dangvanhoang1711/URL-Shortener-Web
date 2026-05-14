const { generateQRForURL, getQRCode } = require("../services/qrCodeService");
const prisma = require("../config/prisma");
const { asyncHandler } = require("../middlewares/errorHandler");

exports.generateQRCode = asyncHandler(async (req, res) => {
  const { short_code } = req.params;
  const { format = 'png', size = 300 } = req.query;

  const urlRecord = await prisma.url.findUnique({
    where: { shortCode: short_code }
  });

  if (!urlRecord) {
    return res.status(404).json({ error: "URL not found" });
  }

  // Sử dụng originalUrl thay vì shortUrl để QR code chứa link gốc
  const originalUrl = urlRecord.originalUrl;

  const qrData = await generateQRForURL(urlRecord.id, originalUrl, { format, size });

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
});

exports.getQRCode = asyncHandler(async (req, res) => {
  const { short_code } = req.params;
  const { format = 'png' } = req.query;

  const urlRecord = await prisma.url.findUnique({
    where: { shortCode: short_code }
  });

  if (!urlRecord) {
    return res.status(404).json({ error: "URL not found" });
  }

  const qrData = await getQRCode(urlRecord.id, format);

  if (!qrData) {
    return res.status(404).json({ error: "QR code not found" });
  }

  let responseData = {
    qrData: qrData.qrData,
    format: qrData.format
  };

  if (qrData.size !== undefined) {
    responseData.size = qrData.size;
  }

  res.json({
    success: true,
    data: responseData
  });
});

exports.downloadQRCode = asyncHandler(async (req, res) => {
  const { short_code } = req.params;
  const { format = 'png', size = 300 } = req.query;

  const urlRecord = await prisma.url.findUnique({
    where: { shortCode: short_code }
  });

  if (!urlRecord) {
    return res.status(404).json({ error: "URL not found" });
  }

  const qrData = await getQRCode(urlRecord.id, format);

  if (!qrData) {
    return res.status(404).json({ error: "QR code not found" });
  }

  let contentType;
  let extension;
  if (format === 'svg') {
    contentType = 'image/svg+xml';
    extension = 'svg';
  } else {
    contentType = 'image/png';
    extension = 'png';
  }

  res.setHeader('Content-Type', contentType);
  res.setHeader('Content-Disposition', `attachment; filename="qr-code-${short_code}.${extension}"`);

  if (qrData.qrData.startsWith('data:')) {
    const matches = qrData.qrData.match(/^data:([^,]+),(.+)$/);
    if (matches && matches.length === 3) {
      const base64Data = matches[2];
      res.send(Buffer.from(base64Data, 'base64'));
    } else {
      res.send(qrData.qrData);
    }
  } else {
    res.send(qrData.qrData);
  }
});