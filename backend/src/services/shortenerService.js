const prisma = require('../config/prisma');
const { customAlphabet } = require('nanoid');

// Tạo custom alphabet cho nanoid: chỉ dùng chữ và số, tránh ký tự đặc biệt
// Alphabet: a-z, A-Z, 0-9 (62 ký tự)
const nanoid = customAlphabet('0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz', 7);

function normalizeUrl(input) {
  try {
    const parsed = new URL(input);
    parsed.hostname = parsed.hostname.toLowerCase();
    if (parsed.pathname.endsWith('/') && parsed.pathname !== '/') {
      parsed.pathname = parsed.pathname.slice(0, -1);
    }
    if (parsed.pathname === '' && parsed.searchParams.toString() === '' && !parsed.hash) {
      parsed.pathname = '/';
    }
    return parsed.toString();
  } catch {
    return input;
  }
}

function isShortUrl(url) {
  try {
    const parsed = new URL(url);
    const hostname = parsed.hostname.toLowerCase();
    const pathParts = parsed.pathname.split('/').filter(p => p);
    
    // Kiểm tra nếu là short URL của chính hệ thống này
    // Pattern: http://localhost:3000/abc123 hoặc http://yourdomain.com/abc123
    // Short URL có đặc điểm: chỉ có 1 path segment và độ dài 7 ký tự
    if (pathParts.length === 1 && pathParts[0].length === 7) {
      // Kiểm tra xem path có phải là alphanumeric không
      const shortCode = pathParts[0];
      const isAlphanumeric = /^[0-9A-Za-z]+$/.test(shortCode);
      return isAlphanumeric;
    }
    
    return false;
  } catch {
    return false;
  }
}

async function createShortUrl(originalUrl, userId = null, title = null) {
  const normalizedUrl = normalizeUrl(originalUrl);

  // Kiểm tra nếu URL đã là short URL → không cho phép shorten
  const isAlreadyShortened = isShortUrl(normalizedUrl);
  if (isAlreadyShortened) {
    throw new Error('Cannot shorten a URL that is already shortened');
  }
  
  // Kiểm tra xem user đã shorten URL này chưa
  if (userId) {
    try {
      const existing = await prisma.url.findFirst({
        where: {
          userId: userId,
          originalUrl: normalizedUrl,
        },
      });
      if (existing) {
        // Trả về short URL đã tồn tại, không tạo mới
        return existing;
      }
    } catch (error) {
      console.error('Error checking existing URL:', error);
      // Continue to create new URL if check fails
    }
  }

  // Tạo shortCode random với nanoid (7 ký tự)
  // Retry nếu bị collision (rất hiếm)
  let shortCode;
  let attempts = 0;
  const maxAttempts = 5;

  while (attempts < maxAttempts) {
    try {
      shortCode = nanoid();
      
      // Kiểm tra xem shortCode đã tồn tại chưa
      const existing = await prisma.url.findUnique({
        where: { shortCode }
      });
      
      if (!existing) {
        break; // shortCode unique, thoát loop
      }
      
      attempts++;
    } catch (error) {
      console.error('Error checking shortCode collision:', error);
      attempts++;
    }
  }

  if (attempts >= maxAttempts) {
    throw new Error('Failed to generate unique short code');
  }

  // Tạo URL với shortCode random
  try {
    const url = await prisma.url.create({
      data: {
        originalUrl: normalizedUrl,
        shortCode: shortCode,
        userId: userId,
        title: title || null,
      },
    });

    return url;
  } catch (error) {
    // Handle Prisma errors
    if (error.code === 'P2002') {
      // Unique constraint violation - shortCode collision
      throw new Error('Failed to generate unique short code');
    }
    
    if (error.code === 'P2003') {
      // Foreign key constraint - invalid userId
      throw new Error('Invalid user ID');
    }

    // Re-throw unknown errors
    throw error;
  }
}

async function getHistory(userId) {
  return await prisma.url.findMany({
    where: { userId: userId },
    orderBy: { createdAt: 'desc' },
    select: {
      id: true,
      originalUrl: true,
      shortCode: true,
      clickCount: true,
      createdAt: true,
      title: true,
    },
  });
}

async function getLinkById(linkId, userId) {
  return await prisma.url.findFirst({
    where: {
      id: linkId,
      userId: userId
    },
    include: {
      clicks: {
        orderBy: { clickedAt: 'desc' },
        take: 50
      }
    }
  });
}

async function getLinkByShortCode(shortCode, userId) {
  return await prisma.url.findFirst({
    where: {
      shortCode: shortCode,
      userId: userId
    },
    include: {
      clicks: {
        orderBy: { clickedAt: 'desc' },
        take: 50
      }
    }
  });
}

async function deleteLink(shortCodeOrId, userId) {
  // Hỗ trợ cả shortCode và id để backward compatibility
  const isNumeric = !isNaN(shortCodeOrId);
  
  const result = await prisma.url.deleteMany({
    where: {
      ...(isNumeric ? { id: parseInt(shortCodeOrId) } : { shortCode: shortCodeOrId }),
      userId: userId
    }
  });
  return result.count > 0;
}

module.exports = {
  createShortUrl,
  getHistory,
  getLinkById,
  getLinkByShortCode,
  deleteLink,
};