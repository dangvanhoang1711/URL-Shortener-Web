const jwt = require('jsonwebtoken');

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';
const JWT_EXPIRE = process.env.JWT_EXPIRE || '7d';

/**
 * Tạo JWT token
 * @param {object} payload - Dữ liệu để encode vào token (ví dụ: {userId, email})
 * @param {string} expiresIn - Thời gian hết hạn (mặc định: 7d)
 * @returns {string} - JWT token
 */
function generateToken(payload, expiresIn = JWT_EXPIRE) {
  try {
    const token = jwt.sign(payload, JWT_SECRET, { expiresIn });
    return token;
  } catch (error) {
    throw new Error(`Error generating token: ${error.message}`);
  }
}

/**
 * Verify và giải mã JWT token
 * @param {string} token - JWT token cần verify
 * @returns {object} - Payload nếu token hợp lệ
 */
function verifyToken(token) {
  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    return decoded;
  } catch (error) {
    if (error.name === 'TokenExpiredError') {
      throw new Error('Token has expired');
    } else if (error.name === 'JsonWebTokenError') {
      throw new Error('Invalid token');
    } else {
      throw new Error(`Error verifying token: ${error.message}`);
    }
  }
}

/**
 * Decode token mà không verify signature (chỉ để lấy payload)
 * @param {string} token - JWT token
 * @returns {object} - Decoded payload
 */
function decodeToken(token) {
  try {
    const decoded = jwt.decode(token);
    return decoded;
  } catch (error) {
    throw new Error(`Error decoding token: ${error.message}`);
  }
}

module.exports = {
  generateToken,
  verifyToken,
  decodeToken
};
