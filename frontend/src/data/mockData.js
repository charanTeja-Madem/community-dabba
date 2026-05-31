export const dashboardStats = [
  { label: 'Active Subscription', value: 'Premium Monthly', hint: 'Valid through 24 Jun 2026' },
  { label: 'Skipped Meals', value: '12', hint: 'Credits tracked automatically' },
  { label: 'Upcoming Meals', value: '24', hint: 'Next 7 days forecast' },
  { label: 'Payments', value: '8', hint: 'All time transactions' },
];

export const weeklyMenu = [
  { day: 'Monday', breakfast: 'Poha, fruit, tea', lunch: 'Paneer butter masala, roti, dal', dinner: 'Kadhi, rice, salad' },
  { day: 'Tuesday', breakfast: 'Idli, sambar, chutney', lunch: 'Rajma chawal, curd', dinner: 'Aloo gobhi, roti, dal tadka' },
  { day: 'Wednesday', breakfast: 'Upma, banana, tea', lunch: 'Chole, rice, salad', dinner: 'Paneer bhurji, roti, sabzi' },
  { day: 'Thursday', breakfast: 'Aloo paratha, curd', lunch: 'Veg pulao, raita', dinner: 'Mixed veg, dal, roti' },
  { day: 'Friday', breakfast: 'Thepla, pickle, tea', lunch: 'Dal makhani, rice, salad', dinner: 'Bhindi fry, roti, dal' },
  { day: 'Saturday', breakfast: 'Dosa, chutney, fruit', lunch: 'Veg biryani, raita', dinner: 'Khichdi, papad, ghee' },
];

export const subscriptionPlans = [
  { name: 'Weekly Veg', price: 1799, meals: 'Breakfast + Lunch + Dinner', highlight: 'Best for first-time users' },
  { name: 'Monthly Veg', price: 6499, meals: 'Daily meals for 30 days', highlight: 'Most popular' },
  { name: 'Monthly Mixed', price: 7499, meals: 'Veg and non-veg meals', highlight: 'Flexible preference' },
];

export const addresses = [
  { label: 'Home', line1: 'Tower C, 402', line2: 'Tech Park Residency', city: 'Bengaluru', default: true },
  { label: 'Office', line1: 'Block A, 3rd Floor', line2: 'WorkHub Plaza', city: 'Bengaluru', default: false },
];

export const notifications = [
  { id: 1, title: 'Subscription renewed', message: 'Your plan is active until 24 Jun 2026.', type: 'success' },
  { id: 2, title: 'Skip confirmed', message: 'Lunch on Thursday has been skipped.', type: 'info' },
  { id: 3, title: 'Menu updated', message: 'This week’s menu has been published.', type: 'warning' },
];