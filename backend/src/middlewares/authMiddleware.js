const { verifyToken } = require('../utils/jwtToken');

/**
 * Middleware để verify JWT token từ Authorization header
 * Nếu token hợp lệ, thêm user info vào req.user
 * Nếu token không hợp lệ hoặc không có, trả về 401
 */
function authMiddleware(req, res, next) {
  try {
    const authHeader = req.headers.authorization;
    
    if (!authHeader) {
      return res.status(401).json({
        error: 'Unauthorized',
        message: 'No authorization header provided'
      });
    }

    // Authorization header format: "Bearer <token>"
    const parts = authHeader.split(' ');
    if (parts.length !== 2 || parts[0] !== 'Bearer') {
      return res.status(401).json({
        error: 'Unauthorized',
        message: 'Invalid authorization header format. Expected: Bearer <token>'
      });
    }

    const token = parts[1];
    
    // Verify token
    const decoded = verifyToken(token);
    
    // Thêm user info vào request object
    req.user = decoded;
    
    next();
  } catch (error) {
    return res.status(401).json({
      error: 'Unauthorized',
      message: error.message || 'Invalid or expired token'
    });
  }
}

/**
 * Middleware tùy chọn - không bắt buộc phải có token
 * Nếu có token hợp lệ, thêm vào req.user
 * Nếu không có token, tiếp tục mà không error
 */
function optionalAuthMiddleware(req, res, next) {
  try {
    const authHeader = req.headers.authorization;
    
    if (!authHeader) {
      return next(); // Không có token, tiếp tục
    }

    const parts = authHeader.split(' ');
    if (parts.length !== 2 || parts[0] !== 'Bearer') {
      return next(); // Token format không đúng, tiếp tục
    }

    const token = parts[1];
    
    try {
      const decoded = verifyToken(token);
      req.user = decoded;
    } catch (err) {
      // Token không hợp lệ, tiếp tục mà không lỗi
    }
    
    next();
  } catch (error) {
    next();
  }
}

module.exports = {
  authMiddleware,
  optionalAuthMiddleware
};
