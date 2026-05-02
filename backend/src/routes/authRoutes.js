const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const { authMiddleware } = require('../middlewares/authMiddleware');

/**
 * Public routes (không cần token)
 */

// POST /api/auth/register - Đăng ký người dùng mới
router.post('/register', authController.register);

// POST /api/auth/login - Đăng nhập
router.post('/login', authController.login);

// POST /api/auth/logout - Logout (client-side xoá token)
router.post('/logout', authController.logout);

/**
 * Protected routes (cần token)
 */

// GET /api/auth/me - Lấy thông tin user hiện tại
router.get('/me', authMiddleware, authController.getCurrentUser);

// POST /api/auth/refresh - Refresh JWT token
router.post('/refresh', authMiddleware, authController.refreshToken);

module.exports = router;
