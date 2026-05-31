const express = require('express');
const { protect } = require('../middleware/authMiddleware');
const { getPlans, createSubscription, getMySubscriptions, getActiveSubscription, updateSubscriptionStatus, skipMealToggle, getSkipHistory } = require('../controllers/subscriptionController');

const router = express.Router();

router.get('/plans', getPlans);
router.route('/').get(protect, getMySubscriptions).post(protect, createSubscription);
router.get('/active', protect, getActiveSubscription);
router.put('/:id/status', protect, updateSubscriptionStatus);
router.post('/skip', protect, skipMealToggle);
router.get('/skip/history', protect, getSkipHistory);

module.exports = router;