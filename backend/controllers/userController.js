const User = require('../models/User');

const getUsers = async (req, res, next) => {
  try {
    const keyword = req.query.keyword
      ? { name: { $regex: req.query.keyword, $options: 'i' } }
      : {};

    const users = await User.find(keyword).select('-password').sort({ createdAt: -1 });
    res.json(users);
  } catch (error) {
    next(error);
  }
};

const getUserById = async (req, res, next) => {
  try {
    const user = await User.findById(req.params.id).select('-password');
    if (!user) {
      res.status(404);
      throw new Error('User not found');
    }
    res.json(user);
  } catch (error) {
    next(error);
  }
};

const updateUserStatus = async (req, res, next) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) {
      res.status(404);
      throw new Error('User not found');
    }

    if (typeof req.body.isActive === 'boolean') {
      user.isActive = req.body.isActive;
    }
    if (req.body.role) {
      user.role = req.body.role;
    }
    await user.save();

    const updated = await User.findById(req.params.id).select('-password');
    res.json(updated);
  } catch (error) {
    next(error);
  }
};

module.exports = { getUsers, getUserById, updateUserStatus };