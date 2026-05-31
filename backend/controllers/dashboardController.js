const Subscription = require('../models/Subscription');
const SkipMeal = require('../models/SkipMeal');
const Payment = require('../models/Payment');
const Delivery = require('../models/Delivery');
const User = require('../models/User');

const getCustomerDashboard = async (req, res, next) => {
  try {
    const activeSubscription = await Subscription.findOne({ user: req.user._id, status: 'active' }).sort({ createdAt: -1 });
    const skipHistory = await SkipMeal.find({ user: req.user._id }).sort({ date: -1 });
    const payments = await Payment.find({ user: req.user._id }).sort({ createdAt: -1 }).limit(10);

    res.json({
      activeSubscription,
      skipHistory,
      payments,
      upcomingMeals: [
        { day: 'Today', mealType: 'Lunch', status: 'scheduled' },
        { day: 'Today', mealType: 'Dinner', status: 'scheduled' },
        { day: 'Tomorrow', mealType: 'Lunch', status: 'scheduled' },
      ],
      stats: {
        totalSkipped: skipHistory.length,
        totalPayments: payments.length,
        creditBalance: activeSubscription?.creditBalance || 0,
      },
    });
  } catch (error) {
    next(error);
  }
};

const getAdminAnalytics = async (req, res, next) => {
  try {
    const [activeSubscribers, totalUsers, pendingDeliveries, totalRevenue] = await Promise.all([
      Subscription.countDocuments({ status: 'active' }),
      User.countDocuments({}),
      Delivery.countDocuments({ status: { $in: ['pending', 'assigned', 'out_for_delivery'] } }),
      Payment.aggregate([{ $match: { status: 'paid' } }, { $group: { _id: null, revenue: { $sum: '$amount' } } }]),
    ]);

    const revenue = totalRevenue[0]?.revenue || 0;
    const skippedMeals = await SkipMeal.countDocuments({});

    res.json({
      activeSubscribers,
      totalUsers,
      pendingDeliveries,
      revenue,
      skippedMeals,
      weeklyRevenue: [
        { name: 'Mon', revenue: 4200 },
        { name: 'Tue', revenue: 5100 },
        { name: 'Wed', revenue: 4900 },
        { name: 'Thu', revenue: 6300 },
        { name: 'Fri', revenue: 5800 },
        { name: 'Sat', revenue: 3100 },
        { name: 'Sun', revenue: 3500 },
      ],
      mealSplit: [
        { name: 'Veg', value: 65 },
        { name: 'Non-Veg', value: 35 },
      ],
    });
  } catch (error) {
    next(error);
  }
};

module.exports = { getCustomerDashboard, getAdminAnalytics };