const express = require('express');
const { protect, authorize } = require('../middleware/authMiddleware');
const { getAdminAnalytics } = require('../controllers/dashboardController');

const router = express.Router();

router.get('/analytics', protect, authorize('admin'), getAdminAnalytics);

module.exports = router;