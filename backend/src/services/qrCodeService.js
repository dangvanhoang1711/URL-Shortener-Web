const { generateQR } = require('../utils/qrCode');
const { getRedisClient } = require('../utils/redis');
const prisma = require('../config/prisma');

exports.generateQRForURL = async (urlId, urlToEncode, options = {}) => {
  const format = options.format || 'png';
  const size = options.size || 300;

  let qrData;
  if (format === 'svg') {
    qrData = await generateQR(urlToEncode, { format: 'image/svg+xml', size });
  } else {
    qrData = await generateQR(urlToEncode, { format: 'image/png', size });
  }

  const qrRecord = await prisma.qRCode.upsert({
    where: { urlId },
    update: {
      qrData,
      format,
      size: Number(size),
      updatedAt: new Date()
    },
    create: {
      urlId,
      qrData,
      format,
      size: Number(size)
    }
  });

  const redis = await getRedisClient();
  if (redis) {
    await redis.set(`qr:${urlId}:${format}`, qrData, { EX: 86400 });
  }

  return {
    id: qrRecord.id,
    urlId: qrRecord.urlId,
    qrData: qrRecord.qrData,
    format: qrRecord.format,
    size: qrRecord.size,
    createdAt: qrRecord.createdAt,
    updatedAt: qrRecord.updatedAt
  };
};

exports.getQRCode = async (urlId, format = 'png') => {
  const redis = await getRedisClient();
  if (redis) {
    const cached = await redis.get(`qr:${urlId}:${format}`);
    if (cached) {
      return { qrData: cached, format };
    }
  }

  const qrRecord = await prisma.qRCode.findUnique({
    where: { urlId }
  });

  if (!qrRecord) {
    return null;
  }

  return {
    id: qrRecord.id,
    urlId: qrRecord.urlId,
    qrData: qrRecord.qrData,
    format: qrRecord.format,
    size: qrRecord.size,
    createdAt: qrRecord.createdAt,
    updatedAt: qrRecord.updatedAt
  };
};