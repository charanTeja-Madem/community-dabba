const Menu = require('../models/Menu');

const normalizeMealPreference = (value) => {
  const preference = String(value || 'both').toLowerCase();
  if (preference === 'veg') return 'veg';
  if (preference === 'non-veg' || preference === 'nonveg') return 'non-veg';
  return 'both';
};

const filterMealsByPreference = (meals = [], mealPreference = 'both') => {
  const preference = normalizeMealPreference(mealPreference);

  if (preference === 'veg') {
    return meals.filter((meal) => meal.dietType === 'Veg');
  }

  if (preference === 'non-veg') {
    return meals.filter((meal) => meal.dietType === 'Non-veg');
  }

  return meals;
};

const getMenus = async (req, res, next) => {
  try {
    const menus = await Menu.find({}).sort({ startDate: -1 });
    res.json(menus);
  } catch (error) {
    next(error);
  }
};

const getActiveMenu = async (req, res, next) => {
  try {
    const menu = await Menu.findOne({ isActive: true }).sort({ startDate: -1 });
    if (!menu) {
      return res.json({});
    }

    const mealPreference = normalizeMealPreference(req.query.mealPreference);
    const menuObject = menu.toObject();

    res.json({
      ...menuObject,
      mealPreference,
      meals: filterMealsByPreference(menuObject.meals, mealPreference),
    });
  } catch (error) {
    next(error);
  }
};

const createMenu = async (req, res, next) => {
  try {
    const menu = await Menu.create(req.body);
    res.status(201).json(menu);
  } catch (error) {
    next(error);
  }
};

const updateMenu = async (req, res, next) => {
  try {
    const menu = await Menu.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!menu) {
      res.status(404);
      throw new Error('Menu not found');
    }
    res.json(menu);
  } catch (error) {
    next(error);
  }
};

const deleteMenu = async (req, res, next) => {
  try {
    const menu = await Menu.findById(req.params.id);
    if (!menu) {
      res.status(404);
      throw new Error('Menu not found');
    }
    await menu.deleteOne();
    res.json({ message: 'Menu deleted' });
  } catch (error) {
    next(error);
  }
};

module.exports = { getMenus, getActiveMenu, createMenu, updateMenu, deleteMenu };