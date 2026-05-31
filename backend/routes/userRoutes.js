const express = require('express');
const { protect, authorize } = require('../middleware/authMiddleware');
const { getUsers, getUserById, updateUserStatus } = require('../controllers/userController');
const { getCustomerDashboard } = require('../controllers/dashboardController');

const router = express.Router();

router.get('/dashboard', protect, getCustomerDashboard);
router.get('/', protect, authorize('admin'), getUsers);
router.get('/:id', protect, authorize('admin'), getUserById);
router.put('/:id/status', protect, authorize('admin'), updateUserStatus);

module.exports = router;