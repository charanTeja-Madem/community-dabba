const mongoose = require('mongoose');

const deliverySchema = mongoose.Schema(
  {
    subscription: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Subscription',
      required: true,
    },
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    deliveryStaff: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
    mealType: {
      type: String,
      enum: ['Breakfast', 'Lunch', 'Dinner'],
      required: true,
    },
    status: {
      type: String,
      enum: ['pending', 'assigned', 'out_for_delivery', 'delivered', 'skipped'],
      default: 'pending',
    },
    deliveryDate: { type: Date, required: true },
    address: { type: String, required: true },
    notes: { type: String, default: '' },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Delivery', deliverySchema);