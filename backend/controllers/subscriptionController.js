const Subscription = require('../models/Subscription');
const SkipMeal = require('../models/SkipMeal');

const getPlans = async (req, res) => {
  res.json([
    {
      id: 'weekly-veg',
      name: 'Weekly Veg',
      highlight: 'Best starter plan',
      meals: 'Breakfast + Lunch + Dinner',
      planType: 'weekly',
      mealPreference: 'veg',
      price: 1799,
      mealsIncluded: ['Breakfast', 'Lunch', 'Dinner'],
    },
    {
      id: 'monthly-both',
      name: 'Monthly Mixed',
      highlight: 'Most popular',
      meals: 'Full-month meal coverage',
      planType: 'monthly',
      mealPreference: 'both',
      price: 6499,
      mealsIncluded: ['Breakfast', 'Lunch', 'Dinner'],
    },
    {
      id: 'weekly-nonveg',
      name: 'Weekly Non-Veg',
      highlight: 'Protein focused',
      meals: 'Lunch + Dinner',
      planType: 'weekly',
      mealPreference: 'non-veg',
      price: 1999,
      mealsIncluded: ['Lunch', 'Dinner'],
    },
  ]);
};

const createSubscription = async (req, res, next) => {
  try {
    const { planType, mealPreference, mealsIncluded, startDate, endDate, pricePaid, creditBalance, notes } = req.body;
    const subscription = await Subscription.create({
      user: req.user._id,
      planType,
      mealPreference,
      mealsIncluded,
      startDate,
      endDate,
      pricePaid,
      creditBalance: creditBalance || 0,
      notes: notes || '',
    });

    res.status(201).json(subscription);
  } catch (error) {
    next(error);
  }
};

const getMySubscriptions = async (req, res, next) => {
  try {
    const subscriptions = await Subscription.find({ user: req.user._id }).sort({ createdAt: -1 });
    res.json(subscriptions);
  } catch (error) {
    next(error);
  }
};

const getActiveSubscription = async (req, res, next) => {
  try {
    const subscription = await Subscription.findOne({ user: req.user._id, status: 'active' }).sort({ createdAt: -1 });
    res.json(subscription || {});
  } catch (error) {
    next(error);
  }
};

const updateSubscriptionStatus = async (req, res, next) => {
  try {
    const subscription = await Subscription.findByIdAndUpdate(req.params.id, { status: req.body.status }, { new: true });
    if (!subscription) {
      res.status(404);
      throw new Error('Subscription not found');
    }
    res.json(subscription);
  } catch (error) {
    next(error);
  }
};

const skipMealToggle = async (req, res, next) => {
  try {
    const { date, mealType, subscriptionId } = req.body;
    const requestedDate = new Date(date);
    const today = new Date();

    const activeSubscriptionId = subscriptionId || (await Subscription.findOne({ user: req.user._id, status: 'active' }).sort({ createdAt: -1 }))?._id;

    if (requestedDate.toDateString() === today.toDateString() && today.getHours() >= 8) {
      res.status(400);
      throw new Error('Cutoff time passed for today');
    }

    const existing = await SkipMeal.findOne({
      user: req.user._id,
      date: requestedDate,
      mealType,
    });

    if (existing) {
      res.status(409);
      throw new Error('Meal already skipped');
    }

    const skipMeal = await SkipMeal.create({
      user: req.user._id,
      subscription: activeSubscriptionId,
      date: requestedDate,
      mealType,
      creditAmount: req.body.creditAmount || 0,
    });

    if (activeSubscriptionId) {
      await Subscription.findByIdAndUpdate(activeSubscriptionId, {
        $inc: { creditBalance: 1 },
      });
    }

    const updatedSubscription = activeSubscriptionId
      ? await Subscription.findById(activeSubscriptionId).lean()
      : null;

    res.status(201).json({
      message: 'Meal skipped',
      skipped: true,
      creditChange: 1,
      creditBalance: updatedSubscription?.creditBalance ?? null,
      data: skipMeal,
    });
  } catch (error) {
    next(error);
  }
};

const getSkipHistory = async (req, res, next) => {
  try {
    const history = await SkipMeal.find({ user: req.user._id }).sort({ date: -1 });
    res.json(history);
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getPlans,
  createSubscription,
  getMySubscriptions,
  getActiveSubscription,
  updateSubscriptionStatus,
  skipMealToggle,
  getSkipHistory,
};