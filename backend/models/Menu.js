const mongoose = require('mongoose');

const menuSchema = mongoose.Schema(
  {
    title: { type: String, required: true }, // e.g., "Week 1 Menu"
    startDate: { type: Date, required: true },
    endDate: { type: Date, required: true },
    description: { type: String, default: '' },
    isActive: { type: Boolean, default: true },
    meals: [
      {
        dayOfWeek: { type: String, enum: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'], required: true },
        mealType: { type: String, enum: ['Breakfast', 'Lunch', 'Dinner'], required: true },
        dietType: { type: String, enum: ['Veg', 'Non-veg'], required: true },
        name: { type: String, required: true },
        description: { type: String },
        imageUrl: { type: String },
        calories: { type: Number, default: 0 },
        protein: { type: Number, default: 0 },
        price: { type: Number, required: true }
      }
    ]
  },
  {
    timestamps: true,
  }
);

const Menu = mongoose.model('Menu', menuSchema);
module.exports = Menu;