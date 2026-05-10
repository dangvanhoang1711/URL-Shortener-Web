const bcrypt = require('bcryptjs');

/**
 * Hash password với bcryptjs
 * @param {string} password - Mật khẩu plaintext
 * @param {number} rounds - Số vòng hash (mặc định 10)
 * @returns {Promise<string>} - Password đã hash
 */
async function hashPassword(password, rounds = parseInt(process.env.BCRYPT_ROUNDS || 10)) {
  try {
    const salt = await bcrypt.genSalt(rounds);
    const hashed = await bcrypt.hash(password, salt);
    return hashed;
  } catch (error) {
    throw new Error(`Error hashing password: ${error.message}`);
  }
}

/**
 * So sánh mật khẩu plaintext với mật khẩu đã hash
 * @param {string} password - Mật khẩu plaintext
 * @param {string} hashedPassword - Mật khẩu đã hash
 * @returns {Promise<boolean>} - True nếu match, False nếu không
 */
async function comparePassword(password, hashedPassword) {
  try {
    const isMatch = await bcrypt.compare(password, hashedPassword);
    return isMatch;
  } catch (error) {
    throw new Error(`Error comparing passwords: ${error.message}`);
  }
}

module.exports = {
  hashPassword,
  comparePassword
};
