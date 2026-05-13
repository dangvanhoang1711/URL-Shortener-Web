const shortenerService = require("../services/shortenerService");
const analyticsService = require("../services/analyticsService");
const { asyncHandler } = require("../middlewares/errorHandler");

function isValidHttpUrl(value) {
  try {
    const url = new URL(value);
    return url.protocol === "http:" || url.protocol === "https:";
  } catch {
    return false;
  }
}

function validateAndNormalizeUrl(input) {
  // Kiểm tra input có rỗng không
  if (!input || typeof input !== 'string') {
    throw new Error('URL is required');
  }

  // Trim whitespace
  let url = input.trim();

  // Kiểm tra độ dài
  if (url.length === 0) {
    throw new Error('URL cannot be empty');
  }

  if (url.length > 2048) {
    throw new Error('URL is too long (max 2048 characters)');
  }

  // Kiểm tra các ký tự không hợp lệ
  if (url.includes(' ')) {
    throw new Error('URL cannot contain spaces');
  }

  // Loại bỏ các protocol không hợp lệ
  const invalidProtocols = ['javascript:', 'data:', 'file:', 'ftp:', 'ftps:'];
  const lowerUrl = url.toLowerCase();
  for (const protocol of invalidProtocols) {
    if (lowerUrl.startsWith(protocol)) {
      throw new Error(`Protocol ${protocol} is not allowed`);
    }
  }

  // Thêm https:// nếu không có protocol
  if (!/^https?:\/\//i.test(url)) {
    url = "https://" + url;
  }

  // Validate URL format
  try {
    const parsed = new URL(url);
    
    // Chỉ cho phép http và https
    if (parsed.protocol !== "http:" && parsed.protocol !== "https:") {
      throw new Error('Only HTTP and HTTPS protocols are allowed');
    }

    // Kiểm tra hostname hợp lệ
    if (!parsed.hostname || parsed.hostname.length === 0) {
      throw new Error('Invalid hostname');
    }

    // Kiểm tra hostname phải có ít nhất 1 dấu chấm (domain.tld)
    // Trừ khi là localhost hoặc IP
    const isLocalhost = parsed.hostname === 'localhost' || parsed.hostname === '127.0.0.1';
    const isIP = /^(\d{1,3}\.){3}\d{1,3}$/.test(parsed.hostname);
    
    if (!isLocalhost && !isIP && !parsed.hostname.includes('.')) {
      throw new Error('Invalid domain. Please enter a valid domain (e.g., example.com)');
    }

    // Kiểm tra hostname không chỉ là TLD (.com, .org, etc)
    if (parsed.hostname.startsWith('.')) {
      throw new Error('Invalid domain format');
    }

    // Kiểm tra hostname có ít nhất 2 ký tự trước dấu chấm đầu tiên
    const parts = parsed.hostname.split('.');
    if (parts.length > 1 && parts[0].length < 2) {
      throw new Error('Domain name is too short. Please enter a valid domain (e.g., example.com)');
    }

    // Kiểm tra TLD (phần sau dấu chấm cuối) có ít nhất 2 ký tự
    if (parts.length > 1 && parts[parts.length - 1].length < 2) {
      throw new Error('Invalid top-level domain. Please enter a valid domain (e.g., example.com)');
    }

    // Kiểm tra hostname chỉ chứa ký tự hợp lệ (a-z, 0-9, -, .)
    if (!/^[a-z0-9.-]+$/i.test(parsed.hostname)) {
      throw new Error('Domain contains invalid characters');
    }

    // Kiểm tra không có dấu chấm liên tiếp
    if (parsed.hostname.includes('..')) {
      throw new Error('Invalid domain format');
    }

    // Kiểm tra không bắt đầu hoặc kết thúc bằng dấu gạch ngang
    if (parsed.hostname.startsWith('-') || parsed.hostname.endsWith('-')) {
      throw new Error('Invalid domain format');
    }

    return url;
  } catch (error) {
    if (error.message.includes('Invalid URL')) {
      throw new Error('Invalid URL format. Please enter a valid URL (e.g., https://example.com)');
    }
    throw error;
  }
}

const shortenUrl = asyncHandler(async (req, res) => {
  const { originalUrl, title } = req.body;
  const userId = req.user?.userId || null;

  try {
    // Validate và normalize URL
    const normUrl = validateAndNormalizeUrl(originalUrl);

    // Validate title nếu có
    if (title && typeof title === 'string') {
      if (title.length > 191) {
        return res.status(400).json({ error: "Title is too long (max 191 characters)" });
      }
    }

    // Tạo short URL
    const result = await shortenerService.createShortUrl(normUrl, userId, title || null);

    return res.json({
      shortCode: result.shortCode,
      shortUrl: `${req.protocol}://${req.get('host')}/${result.shortCode}`,
      clickCount: result.clickCount,
      title: result.title
    });
  } catch (error) {
    // Handle các loại errors khác nhau
    if (error.message === 'Cannot shorten a URL that is already shortened') {
      return res.status(400).json({ error: "Cannot shorten a URL that is already shortened" });
    }
    
    if (error.message === 'Failed to generate unique short code') {
      return res.status(500).json({ error: "Failed to generate short code. Please try again." });
    }

    // Validation errors - check for common validation keywords
    if (error.message.includes('URL') || 
        error.message.includes('Protocol') || 
        error.message.includes('hostname') ||
        error.message.includes('domain') ||
        error.message.includes('Domain') ||
        error.message.includes('Title') ||
        error.message.includes('Invalid') ||
        error.message.includes('too short') ||
        error.message.includes('too long') ||
        error.message.includes('cannot') ||
        error.message.includes('required')) {
      return res.status(400).json({ error: error.message });
    }

    // Unknown errors
    console.error('Unhandled error in shortenUrl:', error);
    throw error;
  }
});

const getHistory = asyncHandler(async (req, res) => {
  const userId = req.user?.userId;
  if (!userId) {
    return res.status(401).json({ error: "Unauthorized" });
  }

  const urls = await shortenerService.getHistory(userId);
  
  // Chỉ trả về thông tin cần thiết, không lộ id và originalUrl đầy đủ
  const sanitizedUrls = urls.map(url => ({
    shortCode: url.shortCode,
    shortUrl: `${req.protocol}://${req.get('host')}/${url.shortCode}`,
    clickCount: url.clickCount,
    createdAt: url.createdAt,
    title: url.title,
    // Chỉ hiển thị domain của originalUrl, không hiển thị full URL
    originalDomain: url.originalUrl ? new URL(url.originalUrl).hostname : null
  }));
  
  return res.json({ urls: sanitizedUrls });
});

const getLinkByShortCode = asyncHandler(async (req, res) => {
  const userId = req.user?.userId;
  if (!userId) {
    return res.status(401).json({ error: "Unauthorized" });
  }

  const { shortCode } = req.params;
  if (!shortCode) {
    return res.status(400).json({ error: "Invalid short code" });
  }

  const link = await shortenerService.getLinkByShortCode(shortCode, userId);

  if (!link) {
    return res.status(404).json({ error: "Link not found" });
  }

  // Giới hạn thông tin trả về, không lộ userId và các thông tin nhạy cảm
  const sanitizedLink = {
    shortCode: link.shortCode,
    shortUrl: `${req.protocol}://${req.get('host')}/${link.shortCode}`,
    clickCount: link.clickCount,
    createdAt: link.createdAt,
    title: link.title,
    clicks: link.clicks ? link.clicks.map(click => ({
      clickedAt: click.clickedAt,
      country: click.country,
      // Không lộ IP address và các thông tin nhạy cảm khác
    })) : []
  };

  return res.json({ link: sanitizedLink });
});

const deleteLink = asyncHandler(async (req, res) => {
  const userId = req.user?.userId;
  if (!userId) {
    return res.status(401).json({ error: "Unauthorized" });
  }

  const { shortCode } = req.params;
  if (!shortCode) {
    return res.status(400).json({ error: "Invalid short code" });
  }

  const deleted = await shortenerService.deleteLink(shortCode, userId);

  if (!deleted) {
    return res.status(404).json({ error: "Link not found or not owned by you" });
  }

  return res.status(200).json({ message: "Link deleted successfully" });
});

const getStats = asyncHandler(async (req, res) => {
  const { short_code } = req.params;
  const stats = await analyticsService.getStats(short_code);

  if (!stats) {
    return res.status(404).json({ message: "Not found" });
  }

  // Trả về stats với thông tin đã được sanitize từ service
  // Service đã loại bỏ IP address và user agent
  return res.json({
    shortCode: stats.shortCode,
    totalClicks: stats.totalClicks,
    dailyClicks: stats.dailyClicks,
    recentClicks: stats.recentClicks
  });
});

module.exports = {
  shortenUrl,
  getHistory,
  getLinkByShortCode,
  deleteLink,
  getStats,
};