const express = require('express');
const { protect, authorize } = require('../middleware/authMiddleware');
const { getMenus, getActiveMenu, createMenu, updateMenu, deleteMenu } = require('../controllers/menuController');

const router = express.Router();

router.get('/active', getActiveMenu);
router.route('/').get(getMenus).post(protect, authorize('admin'), createMenu);
router.route('/:id').put(protect, authorize('admin'), updateMenu).delete(protect, authorize('admin'), deleteMenu);

module.exports = router;