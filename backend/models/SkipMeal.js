const mongoose = require('mongoose');

const skipMealSchema = mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    subscription: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Subscription',
    },
    date: { type: Date, required: true },
    mealType: {
      type: String,
      enum: ['Breakfast', 'Lunch', 'Dinner'],
      required: true,
    },
    status: {
      type: String,
      enum: ['pending', 'approved', 'rejected'],
      default: 'approved',
    },
    refundCredited: { type: Boolean, default: false },
    creditAmount: { type: Number, default: 0 },
  },
  { timestamps: true }
);

module.exports = mongoose.model('SkipMeal', skipMealSchema);