const mongoose = require('mongoose');

const mealSchema = mongoose.Schema(
  {
    menu: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Menu',
      required: true,
    },
    dayOfWeek: {
      type: String,
      required: true,
    },
    mealType: {
      type: String,
      enum: ['Breakfast', 'Lunch', 'Dinner'],
      required: true,
    },
    name: { type: String, required: true },
    dietType: { type: String, enum: ['Veg', 'Non-veg'], required: true },
    description: { type: String, default: '' },
    imageUrl: { type: String, default: '' },
    calories: { type: Number, default: 0 },
    protein: { type: Number, default: 0 },
    price: { type: Number, required: true },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Meal', mealSchema);