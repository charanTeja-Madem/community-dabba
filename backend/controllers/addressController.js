const Address = require('../models/Address');
const User = require('../models/User');

const requiredAddressFields = ['label', 'street', 'city', 'state', 'postalCode'];

const validateAddressPayload = (payload) => {
  const missingFields = requiredAddressFields.filter((field) => !String(payload[field] || '').trim());

  if (missingFields.length > 0) {
    return `Missing required address fields: ${missingFields.join(', ')}`;
  }

  return null;
};

const getMyAddresses = async (req, res, next) => {
  try {
    const addresses = await Address.find({ user: req.user._id }).sort({ isDefault: -1, createdAt: -1 });
    res.json(addresses);
  } catch (error) {
    next(error);
  }
};

const createAddress = async (req, res, next) => {
  try {
    const validationError = validateAddressPayload(req.body);
    if (validationError) {
      res.status(400);
      throw new Error(validationError);
    }

    const address = await Address.create({ ...req.body, user: req.user._id });

    const user = await User.findById(req.user._id);
    if (user) {
      user.addresses.push(address._id);
      if (req.body.isDefault) {
        user.defaultAddress = address._id;
      }
      await user.save();
    }

    res.status(201).json(address);
  } catch (error) {
    next(error);
  }
};

const updateAddress = async (req, res, next) => {
  try {
    const validationError = validateAddressPayload({
      label: req.body.label,
      street: req.body.street,
      city: req.body.city,
      state: req.body.state,
      postalCode: req.body.postalCode,
    });

    if (validationError) {
      res.status(400);
      throw new Error(validationError);
    }

    const address = await Address.findById(req.params.id);
    if (!address || String(address.user) !== String(req.user._id)) {
      res.status(404);
      throw new Error('Address not found');
    }

    Object.assign(address, req.body);
    const updated = await address.save();
    res.json(updated);
  } catch (error) {
    next(error);
  }
};

const deleteAddress = async (req, res, next) => {
  try {
    const address = await Address.findById(req.params.id);
    if (!address || String(address.user) !== String(req.user._id)) {
      res.status(404);
      throw new Error('Address not found');
    }

    await address.deleteOne();
    res.json({ message: 'Address deleted' });
  } catch (error) {
    next(error);
  }
};

const setDefaultAddress = async (req, res, next) => {
  try {
    const address = await Address.findById(req.params.id);
    if (!address || String(address.user) !== String(req.user._id)) {
      res.status(404);
      throw new Error('Address not found');
    }

    await Address.updateMany({ user: req.user._id }, { isDefault: false });
    address.isDefault = true;
    await address.save();

    await User.findByIdAndUpdate(req.user._id, { defaultAddress: address._id });
    res.json(address);
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getMyAddresses,
  createAddress,
  updateAddress,
  deleteAddress,
  setDefaultAddress,
};