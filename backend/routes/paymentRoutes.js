const express = require('express');
const { protect } = require('../middleware/authMiddleware');
const { createPayment, getMyPayments, createRazorpayOrder, verifyRazorpayPayment } = require('../controllers/paymentController');

const router = express.Router();

router.route('/').get(protect, getMyPayments).post(protect, createPayment);
router.post('/razorpay/order', protect, createRazorpayOrder);
router.post('/razorpay/verify', protect, verifyRazorpayPayment);

module.exports = router;