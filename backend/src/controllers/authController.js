const AuthService = require('../services/authService');

/**
 * Đăng ký người dùng mới
 * POST /api/auth/register
 * Body: { email, password, confirmPassword }
 */
exports.register = async (req, res) => {
  try {
    const { email, password, confirmPassword } = req.body;

    const user = await AuthService.registerUser(email, password, confirmPassword);

    return res.status(201).json({
      message: 'User registered successfully',
      user
    });
  } catch (error) {
    console.error('Register error:', error);
    return res.status(400).json({
      error: 'Registration Failed',
      message: error.message || 'An error occurred during registration'
    });
  }
};

/**
 * Đăng nhập
 * POST /api/auth/login
 * Body: { email, password }
 */
exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;

    const result = await AuthService.loginUser(email, password);

    return res.status(200).json({
      message: 'Login successful',
      token: result.token,
      user: result.user
    });
  } catch (error) {
    console.error('Login error:', error);
    return res.status(401).json({
      error: 'Authentication Failed',
      message: error.message || 'Invalid credentials'
    });
  }
};

/**
 * Lấy thông tin user hiện tại (Protected route)
 * GET /api/auth/me
 * Headers: Authorization: Bearer <token>
 */
exports.getCurrentUser = async (req, res) => {
  try {
    if (!req.user) {
      return res.status(401).json({
        error: 'Unauthorized',
        message: 'No user information available'
      });
    }

    const user = await AuthService.getUserById(req.user.userId);

    return res.status(200).json({
      message: 'User information retrieved successfully',
      user
    });
  } catch (error) {
    console.error('Get current user error:', error);
    return res.status(404).json({
      error: 'User Not Found',
      message: error.message || 'The user does not exist'
    });
  }
};

/**
 * Refresh JWT token (Optional)
 * POST /api/auth/refresh
 * Headers: Authorization: Bearer <token>
 */
exports.refreshToken = async (req, res) => {
  try {
    if (!req.user) {
      return res.status(401).json({
        error: 'Unauthorized',
        message: 'No user information available'
      });
    }

    const result = await AuthService.refreshUserToken(req.user.userId, req.user.email);

    return res.status(200).json({
      message: 'Token refreshed successfully',
      token: result.token
    });
  } catch (error) {
    console.error('Refresh token error:', error);
    return res.status(500).json({
      error: 'Server Error',
      message: error.message || 'An error occurred while refreshing token'
    });
  }
};

/**
 * Logout (Client-side - xoá token từ localStorage)
 * POST /api/auth/logout
 */
exports.logout = async (req, res) => {
  try {
    return res.status(200).json({
      message: 'Logout successful. Please remove the token from your client.'
    });
  } catch (error) {
    return res.status(500).json({
      error: 'Server Error',
      message: error.message || 'An error occurred during logout'
    });
  }
};

