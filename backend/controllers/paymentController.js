const crypto = require('crypto');
const Payment = require('../models/Payment');
const Subscription = require('../models/Subscription');

let RazorpayClient = null;
try {
  RazorpayClient = require('razorpay');
} catch (error) {
  RazorpayClient = null;
}

const hasRazorpayConfig = Boolean(process.env.RAZORPAY_KEY_ID && process.env.RAZORPAY_KEY_SECRET && RazorpayClient);

const razorpay = hasRazorpayConfig
  ? new RazorpayClient({
      key_id: process.env.RAZORPAY_KEY_ID,
      key_secret: process.env.RAZORPAY_KEY_SECRET,
    })
  : null;

const normalizeAmount = (amount) => Math.round(Number(amount || 0) * 100);

const buildSubscriptionPayload = (reqBody, userId) => ({
  user: userId,
  planType: reqBody.planType,
  mealPreference: reqBody.mealPreference,
  mealsIncluded: reqBody.mealsIncluded,
  startDate: reqBody.startDate,
  endDate: reqBody.endDate,
  pricePaid: reqBody.amount,
});

const createPayment = async (req, res, next) => {
  try {
    const payment = await Payment.create({
      user: req.user._id,
      subscription: req.body.subscriptionId,
      provider: req.body.provider || 'razorpay',
      amount: req.body.amount,
      currency: req.body.currency || 'INR',
      status: req.body.status || 'created',
      receiptId: req.body.receiptId || '',
      transactionId: req.body.transactionId || '',
      paidAt: req.body.paidAt || undefined,
    });

    res.status(201).json(payment);
  } catch (error) {
    next(error);
  }
};

const getMyPayments = async (req, res, next) => {
  try {
    const payments = await Payment.find({ user: req.user._id }).sort({ createdAt: -1 });
    res.json(payments);
  } catch (error) {
    next(error);
  }
};

const createRazorpayOrder = async (req, res, next) => {
  try {
    const amount = normalizeAmount(req.body.amount);
    const currency = req.body.currency || 'INR';
    const planName = req.body.planName || req.body.planType || 'Subscription Plan';
    const receipt = `rcpt_${Date.now()}`;

    if (amount <= 0) {
      res.status(400);
      throw new Error('Amount must be greater than zero');
    }

    if (!razorpay) {
      return res.status(200).json({
        keyId: process.env.RAZORPAY_KEY_ID || 'rzp_test_demo',
        order: {
          id: `order_demo_${Date.now()}`,
          amount,
          currency,
          receipt,
          status: 'created',
          notes: {
            planName,
            planType: req.body.planType,
            mealPreference: req.body.mealPreference,
          },
        },
        fallback: true,
      });
    }

    const order = await razorpay.orders.create({
      amount,
      currency,
      receipt,
      payment_capture: 1,
      notes: {
        userId: String(req.user._id),
        planName,
        planType: req.body.planType,
        mealPreference: req.body.mealPreference,
        mealsIncluded: JSON.stringify(req.body.mealsIncluded || []),
      },
    });

    res.json({
      keyId: process.env.RAZORPAY_KEY_ID,
      order,
      fallback: false,
    });
  } catch (error) {
    next(error);
  }
};

const verifyRazorpayPayment = async (req, res, next) => {
  try {
    const {
      razorpay_order_id: razorpayOrderId,
      razorpay_payment_id: razorpayPaymentId,
      razorpay_signature: razorpaySignature,
      plan,
    } = req.body;

    const paymentPayload = {
      user: req.user._id,
      subscription: null,
      provider: 'razorpay',
      amount: plan?.price || req.body.amount,
      currency: 'INR',
      status: 'paid',
      receiptId: razorpayOrderId,
      transactionId: razorpayPaymentId,
      paidAt: new Date(),
    };

    const razorpaySecret = process.env.RAZORPAY_KEY_SECRET;

    if (razorpay && razorpaySecret) {
      const generatedSignature = crypto
        .createHmac('sha256', razorpaySecret)
        .update(`${razorpayOrderId}|${razorpayPaymentId}`)
        .digest('hex');

      if (generatedSignature !== razorpaySignature) {
        res.status(400);
        throw new Error('Payment verification failed');
      }
    }

    const subscription = await Subscription.create(buildSubscriptionPayload({ ...plan, amount: plan?.price || req.body.amount }, req.user._id));
    paymentPayload.subscription = subscription._id;

    const payment = await Payment.create(paymentPayload);

    res.status(201).json({
      message: 'Payment verified and subscription activated',
      payment,
      subscription,
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  createPayment,
  getMyPayments,
  createRazorpayOrder,
  verifyRazorpayPayment,
};