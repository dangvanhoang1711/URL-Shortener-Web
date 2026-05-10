const AuthService = require('../services/authService');
const {
  asyncHandler,
  ValidationError,
  AuthenticationError,
  NotFoundError,
  ConflictError
} = require('../middlewares/errorHandler');

/**
 * Đăng ký người dùng mới
 * POST /api/auth/register
 * Body: { email, password, confirmPassword }
 */
exports.register = asyncHandler(async (req, res) => {
  try {
    const { email, password, confirmPassword } = req.body;

    const user = await AuthService.registerUser(email, password, confirmPassword);

    return res.status(201).json({
      message: 'User registered successfully',
      user
    });
  } catch (error) {
    if (error.message.includes('Email') || error.message.includes('email')) {
      throw new ConflictError(error.message);
    }
    if (error.message.includes('password') || error.message.includes('Password')) {
      throw new ValidationError(error.message);
    }
    if (error.message.includes('format')) {
      throw new ValidationError(error.message);
    }
    throw error;
  }
});

/**
 * Đăng nhập
 * POST /api/auth/login
 * Body: { email, password }
 */
exports.login = asyncHandler(async (req, res) => {
  try {
    const { email, password } = req.body;

    const result = await AuthService.loginUser(email, password);

    return res.status(200).json({
      message: 'Login successful',
      token: result.token,
      user: result.user
    });
  } catch (error) {
    throw new AuthenticationError(error.message || 'Invalid credentials');
  }
});

/**
 * Lấy thông tin user hiện tại (Protected route)
 * GET /api/auth/me
 * Headers: Authorization: Bearer <token>
 */
exports.getCurrentUser = asyncHandler(async (req, res) => {
  if (!req.user) {
    throw new AuthenticationError('No user information available');
  }

  try {
    const user = await AuthService.getUserById(req.user.userId);

    return res.status(200).json({
      message: 'User information retrieved successfully',
      user
    });
  } catch (error) {
    throw new NotFoundError('User', req.user.userId);
  }
});

/**
 * Refresh JWT token (Protected)
 * POST /api/auth/refresh
 * Headers: Authorization: Bearer <token>
 */
exports.refreshToken = asyncHandler(async (req, res) => {
  if (!req.user) {
    throw new AuthenticationError('No user information available');
  }

  const result = await AuthService.refreshUserToken(req.user.userId, req.user.email);

  return res.status(200).json({
    message: 'Token refreshed successfully',
    token: result.token
  });
});

/**
 * Logout (Client-side - xoá token từ localStorage)
 * POST /api/auth/logout
 */
exports.logout = asyncHandler(async (req, res) => {
  return res.status(200).json({
    message: 'Logout successful. Please remove the token from your client.'
  });
});

