const express = require('express');
const router = express.Router();
const redirectController = require('../controllers/redirectController');

// Redirect route - NMHieu's responsibility
router.get('/:short_code', redirectController.redirect);

module.exports = router;