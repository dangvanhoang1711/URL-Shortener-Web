const { prisma } = require('../utils/prisma');
const { hashPassword, comparePassword } = require('../utils/passwordHash');
const { generateToken, verifyToken } = require('../utils/jwtToken');
const {
  ValidationError,
  AuthenticationError,
  ConflictError,
  NotFoundError
} = require('../utils/customErrors');

class AuthService {
  /**
   * Đăng ký người dùng mới
   */
  static async registerUser(email, password, confirmPassword) {
    // Validate input
    if (!email || !password || !confirmPassword) {
      throw new ValidationError('Email, password, and confirmPassword are required');
    }

    // Kiểm tra password match
    if (password !== confirmPassword) {
      throw new ValidationError('Passwords do not match');
    }

    // Kiểm tra password strength (tối thiểu 6 ký tự)
    if (password.length < 6) {
      throw new ValidationError('Password must be at least 6 characters long');
    }

    // Validate email format đơn giản
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      throw new ValidationError('Invalid email format');
    }

    // Kiểm tra email đã tồn tại
    const existingUser = await prisma.user.findUnique({
      where: { email }
    });

    if (existingUser) {
      throw new ConflictError('This email is already registered');
    }

    // Hash password
    const hashedPassword = await hashPassword(password);

    // Tạo user mới
    try {
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
    } catch (error) {
      if (error.code === 'P2002') {
        throw new ConflictError('Email already exists');
      }
      throw error;
    }
  }

  /**
   * Đăng nhập
   */
  static async loginUser(email, password) {
    // Validate input
    if (!email || !password) {
      throw new ValidationError('Email and password are required');
    }

    // Tìm user theo email
    const user = await prisma.user.findUnique({
      where: { email }
    });

    if (!user) {
      throw new AuthenticationError('Invalid email or password');
    }

    // So sánh password
    const isPasswordMatch = await comparePassword(password, user.password);

    if (!isPasswordMatch) {
      throw new AuthenticationError('Invalid email or password');
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
      throw new ValidationError('User ID is required');
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
      throw new NotFoundError('User');
    }

    return user;
  }

  /**
   * Refresh JWT token
   */
  static async refreshUserToken(userId, email) {
    if (!userId || !email) {
      throw new ValidationError('User ID and email are required');
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
      throw new AuthenticationError(error.message || 'Invalid token');
    }
  }
}

module.exports = AuthService;
