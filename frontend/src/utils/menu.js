export const DAY_ORDER = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

export const MEAL_PREFERENCE_LABELS = {
  veg: 'Veg',
  'non-veg': 'Non-Veg',
  both: 'Mixed',
};

export const DIET_TYPE_OPTIONS = ['Veg', 'Non-veg'];
export const MEAL_TYPE_OPTIONS = ['Breakfast', 'Lunch', 'Dinner'];

export function normalizeMealPreference(value) {
  const preference = String(value || 'both').toLowerCase();
  if (preference === 'veg') return 'veg';
  if (preference === 'non-veg' || preference === 'nonveg') return 'non-veg';
  return 'both';
}

export function getMealPreferenceLabel(value) {
  return MEAL_PREFERENCE_LABELS[normalizeMealPreference(value)] || 'Mixed';
}

export function groupMealsByDay(menu, mealPreference = 'both') {
  const preference = normalizeMealPreference(mealPreference);
  const meals = Array.isArray(menu?.meals) ? menu.meals : [];

  const filteredMeals = meals.filter((meal) => {
    if (preference === 'veg') return meal.dietType === 'Veg';
    if (preference === 'non-veg') return meal.dietType === 'Non-veg';
    return true;
  });

  return DAY_ORDER.map((day) => ({
    day,
    meals: filteredMeals.filter((meal) => meal.dayOfWeek === day),
  })).filter((dayGroup) => dayGroup.meals.length > 0);
}

export function createEmptyMealRow(dayOfWeek = 'Monday') {
  return {
    dayOfWeek,
    mealType: 'Breakfast',
    dietType: 'Veg',
    name: '',
    description: '',
    price: 0,
    calories: 0,
    protein: 0,
    imageUrl: '',
  };
}