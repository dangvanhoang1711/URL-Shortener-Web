const { prisma } = require('../utils/prisma');
const { hashPassword, comparePassword } = require('../utils/passwordHash');
const { generateToken, verifyToken } = require('../utils/jwtToken');

class AuthService {
  /**
   * Đăng ký người dùng mới
   */
  static async registerUser(email, password, confirmPassword) {
    // Validate input
    if (!email || !password || !confirmPassword) {
      throw new Error('Email, password, and confirmPassword are required');
    }

    // Kiểm tra password match
    if (password !== confirmPassword) {
      throw new Error('Passwords do not match');
    }

    // Kiểm tra password strength (tối thiểu 6 ký tự)
    if (password.length < 6) {
      throw new Error('Password must be at least 6 characters long');
    }

    // Validate email format đơn giản
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      throw new Error('Invalid email format');
    }

    // Kiểm tra email đã tồn tại
    const existingUser = await prisma.user.findUnique({
      where: { email }
    });

    if (existingUser) {
      throw new Error('This email is already registered');
    }

    // Hash password
    const hashedPassword = await hashPassword(password);

    // Tạo user mới
    const user = await prisma.user.create({
      data: {
        email,
        password: hashedPassword
      },
      select: {
        id: true,
        email: true,
        createdAt: true
      }
    });

    return user;
  }

  /**
   * Đăng nhập
   */
  static async loginUser(email, password) {
    // Validate input
    if (!email || !password) {
      throw new Error('Email and password are required');
    }

    // Tìm user theo email
    const user = await prisma.user.findUnique({
      where: { email }
    });

    if (!user) {
      throw new Error('Invalid email or password');
    }

    // So sánh password
    const isPasswordMatch = await comparePassword(password, user.password);

    if (!isPasswordMatch) {
      throw new Error('Invalid email or password');
    }

    // Generate JWT token
    const token = generateToken({
      userId: user.id,
      email: user.email
    });

    return {
      token,
      user: {
        id: user.id,
        email: user.email,
        createdAt: user.createdAt
      }
    };
  }

  /**
   * Lấy thông tin user theo ID
   */
  static async getUserById(userId) {
    if (!userId) {
      throw new Error('User ID is required');
    }

    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        email: true,
        createdAt: true,
        updatedAt: true
      }
    });

    if (!user) {
      throw new Error('User does not exist');
    }

    return user;
  }

  /**
   * Refresh JWT token
   */
  static async refreshUserToken(userId, email) {
    if (!userId || !email) {
      throw new Error('User ID and email are required');
    }

    const newToken = generateToken({
      userId,
      email
    });

    return { token: newToken };
  }

  /**
   * Verify token
   */
  static async verifyUserToken(token) {
    try {
      const decoded = verifyToken(token);
      return decoded;
    } catch (error) {
      throw new Error(error.message || 'Invalid token');
    }
  }
}

module.exports = AuthService;
