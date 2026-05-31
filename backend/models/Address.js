const mongoose = require('mongoose');

const addressSchema = mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      ref: 'User',
    },
    label: {
      type: String,
      required: true,
      default: 'Home' // e.g., Home, Work
    },
    street: { type: String, required: true },
    city: { type: String, required: true },
    state: { type: String, required: true },
    postalCode: { type: String, required: true },
    country: { type: String, required: true, default: 'India' },
    landmark: { type: String, default: '' },
    latitude: { type: Number },
    longitude: { type: Number },
    isDefault: { type: Boolean, default: false }
  },
  {
    timestamps: true,
  }
);

const Address = mongoose.model('Address', addressSchema);
module.exports = Address;