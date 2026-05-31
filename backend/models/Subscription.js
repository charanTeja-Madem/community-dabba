const mongoose = require('mongoose');

const subscriptionSchema = mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    planType: {
      type: String,
      enum: ['weekly', 'monthly'],
      required: true,
    },
    mealPreference: {
      type: String,
      enum: ['veg', 'non-veg', 'both'],
      required: true,
    },
    mealsIncluded: [{ type: String, enum: ['Breakfast', 'Lunch', 'Dinner'] }],
    startDate: { type: Date, required: true },
    endDate: { type: Date, required: true },
    status: {
      type: String,
      enum: ['active', 'expired', 'cancelled'],
      default: 'active',
    },
    pricePaid: { type: Number, required: true },
    creditBalance: { type: Number, default: 0 },
    notes: { type: String, default: '' },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Subscription', subscriptionSchema);