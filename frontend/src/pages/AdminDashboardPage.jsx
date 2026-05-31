import { useEffect, useMemo, useState } from 'react';
import { AlertCircle, Plus, Save, Trash2, Users, ClipboardList, TrendingUp } from 'lucide-react';
import { Bar, BarChart, CartesianGrid, Cell, Pie, PieChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import { api } from '../services/api';
import { SectionCard, StatCard } from '../components/ui';
import { createEmptyMealRow, DAY_ORDER, DIET_TYPE_OPTIONS, MEAL_TYPE_OPTIONS } from '../utils/menu';

const revenueData = [
  { name: 'Mon', revenue: 4200 },
  { name: 'Tue', revenue: 5100 },
  { name: 'Wed', revenue: 4900 },
  { name: 'Thu', revenue: 6300 },
  { name: 'Fri', revenue: 5800 },
  { name: 'Sat', revenue: 3100 },
  { name: 'Sun', revenue: 3500 },
];

const pieData = [
  { name: 'Veg', value: 68 },
  { name: 'Non-Veg', value: 32 },
];

const colors = ['#ea580c', '#0f172a'];

export default function AdminDashboardPage() {
  const [menuId, setMenuId] = useState('');
  const [menuForm, setMenuForm] = useState(() => getDefaultMenuForm());
  const [loadingMenu, setLoadingMenu] = useState(true);
  const [savingMenu, setSavingMenu] = useState(false);
  const [menuMessage, setMenuMessage] = useState('');

  useEffect(() => {
    const loadMenu = async () => {
      try {
        const { data } = await api.get('/menus/active');
        if (data?._id) {
          setMenuId(data._id);
          setMenuForm(mapMenuToForm(data));
        }
      } catch (error) {
        setMenuMessage(error?.response?.data?.message || 'Unable to load the active menu.');
      } finally {
        setLoadingMenu(false);
      }
    };

    loadMenu();
  }, []);

  const mealSummary = useMemo(() => {
    const counts = { Veg: 0, 'Non-veg': 0 };
    menuForm.meals.forEach((meal) => {
      if (meal.dietType === 'Veg') counts.Veg += 1;
      if (meal.dietType === 'Non-veg') counts['Non-veg'] += 1;
    });
    return counts;
  }, [menuForm.meals]);

  const updateMenuField = (field, value) => {
    setMenuForm((current) => ({ ...current, [field]: value }));
  };

  const updateMealRow = (index, field, value) => {
    setMenuForm((current) => ({
      ...current,
      meals: current.meals.map((meal, mealIndex) => (mealIndex === index ? { ...meal, [field]: value } : meal)),
    }));
  };

  const addMealRow = () => {
    setMenuForm((current) => ({
      ...current,
      meals: [...current.meals, createEmptyMealRow()],
    }));
  };

  const removeMealRow = (index) => {
    setMenuForm((current) => ({
      ...current,
      meals: current.meals.filter((_, mealIndex) => mealIndex !== index),
    }));
  };

  const saveMenu = async () => {
    setSavingMenu(true);
    setMenuMessage('');

    try {
      const payload = {
        ...menuForm,
        meals: menuForm.meals.map((meal) => ({
          ...meal,
          price: Number(meal.price) || 0,
          calories: Number(meal.calories) || 0,
          protein: Number(meal.protein) || 0,
        })),
      };

      const { data } = menuId ? await api.put(`/menus/${menuId}`, payload) : await api.post('/menus', payload);
      setMenuId(data._id);
      setMenuForm(mapMenuToForm(data));
      setMenuMessage('Menu saved and published successfully.');
    } catch (error) {
      setMenuMessage(error?.response?.data?.message || 'Unable to save the menu.');
    } finally {
      setSavingMenu(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <StatCard icon={Users} label="Active subscribers" value="1,240" hint="Across all live plans" tone="orange" />
        <StatCard icon={ClipboardList} label="Today meal count" value="3,860" hint="Breakfast, lunch, and dinner" tone="blue" />
        <StatCard icon={TrendingUp} label="Weekly revenue" value="₹32,900" hint="Net collected amount" tone="emerald" />
        <StatCard icon={AlertCircle} label="Pending deliveries" value="42" hint="Assigned and waiting" tone="slate" />
      </div>

      <SectionCard
        title="Active menu editor"
        subtitle="Update the weekly menu once and the customer dashboard will show the matching veg, non-veg, or mixed meals."
        action={<button type="button" onClick={saveMenu} disabled={savingMenu || loadingMenu} className="inline-flex items-center gap-2 rounded-2xl bg-slate-950 px-4 py-2 text-sm font-semibold text-white disabled:opacity-60"><Save className="h-4 w-4" />{savingMenu ? 'Saving...' : 'Save menu'}</button>}
      >
        {menuMessage ? <div className="mb-4 rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-700">{menuMessage}</div> : null}
        <div className="grid gap-4 lg:grid-cols-[0.9fr_1.1fr]">
          <div className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2">
              <Field label="Title" value={menuForm.title} onChange={(value) => updateMenuField('title', value)} placeholder="Week 1 Menu" />
              <Field label="Description" value={menuForm.description} onChange={(value) => updateMenuField('description', value)} placeholder="Fresh menu for this week" />
              <Field label="Start date" type="date" value={menuForm.startDate} onChange={(value) => updateMenuField('startDate', value)} />
              <Field label="End date" type="date" value={menuForm.endDate} onChange={(value) => updateMenuField('endDate', value)} />
            </div>

            <label className="flex items-center gap-3 rounded-3xl border border-slate-200 bg-white px-4 py-3">
              <input type="checkbox" checked={menuForm.isActive} onChange={(event) => updateMenuField('isActive', event.target.checked)} className="h-4 w-4 rounded border-slate-300 text-orange-600" />
              <span className="text-sm font-medium text-slate-700">Make this the active customer menu</span>
            </label>

            <div className="grid gap-3 md:grid-cols-2">
              <InfoCard label="Veg meals" value={mealSummary.Veg} tone="emerald" />
              <InfoCard label="Non-veg meals" value={mealSummary['Non-veg']} tone="orange" />
            </div>
          </div>

          <div className="rounded-[2rem] border border-slate-200 bg-slate-50 p-4">
            <div className="mb-4 flex items-center justify-between gap-3">
              <div>
                <p className="text-sm font-semibold text-slate-950">Meal rows</p>
                <p className="text-xs text-slate-500">Add or edit rows for any day and meal type.</p>
              </div>
              <button type="button" onClick={addMealRow} className="inline-flex items-center gap-2 rounded-2xl bg-white px-3 py-2 text-sm font-semibold text-slate-700 shadow-sm">
                <Plus className="h-4 w-4" /> Add row
              </button>
            </div>

            <div className="max-h-[620px] space-y-3 overflow-auto pr-1">
              {menuForm.meals.map((meal, index) => (
                <div key={`${meal.dayOfWeek}-${meal.mealType}-${index}`} className="rounded-3xl border border-white bg-white p-4 shadow-sm">
                  <div className="mb-3 flex items-center justify-between gap-3">
                    <p className="text-sm font-semibold text-slate-950">Row {index + 1}</p>
                    <button type="button" onClick={() => removeMealRow(index)} className="inline-flex items-center gap-1 rounded-full bg-red-50 px-3 py-1 text-xs font-semibold text-red-700">
                      <Trash2 className="h-3.5 w-3.5" /> Remove
                    </button>
                  </div>

                  <div className="grid gap-3 md:grid-cols-2">
                    <Select label="Day" value={meal.dayOfWeek} options={DAY_ORDER} onChange={(value) => updateMealRow(index, 'dayOfWeek', value)} />
                    <Select label="Meal type" value={meal.mealType} options={MEAL_TYPE_OPTIONS} onChange={(value) => updateMealRow(index, 'mealType', value)} />
                    <Select label="Diet type" value={meal.dietType} options={DIET_TYPE_OPTIONS} onChange={(value) => updateMealRow(index, 'dietType', value)} />
                    <Field label="Meal name" value={meal.name} onChange={(value) => updateMealRow(index, 'name', value)} placeholder="Paneer butter masala" />
                    <Field label="Description" value={meal.description} onChange={(value) => updateMealRow(index, 'description', value)} placeholder="Fresh home-style lunch" />
                    <Field label="Price" type="number" value={meal.price} onChange={(value) => updateMealRow(index, 'price', value)} placeholder="199" />
                    <Field label="Calories" type="number" value={meal.calories} onChange={(value) => updateMealRow(index, 'calories', value)} placeholder="480" />
                    <Field label="Protein" type="number" value={meal.protein} onChange={(value) => updateMealRow(index, 'protein', value)} placeholder="18" />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </SectionCard>

      <div className="grid gap-6 xl:grid-cols-[1.3fr_0.7fr]">
        <SectionCard title="Revenue trends" subtitle="Weekly performance and collection pattern">
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={revenueData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                <XAxis dataKey="name" stroke="#94a3b8" />
                <YAxis stroke="#94a3b8" />
                <Tooltip />
                <Bar dataKey="revenue" fill="#ea580c" radius={[10, 10, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </SectionCard>

        <SectionCard title="Meal split" subtitle="Preference mix across the system">
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={pieData} dataKey="value" innerRadius={70} outerRadius={100} paddingAngle={4}>
                  {pieData.map((entry, index) => (
                    <Cell key={entry.name} fill={colors[index]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </SectionCard>
      </div>
    </div>
  );
}

function getDefaultMenuForm() {
  const startDate = new Date();
  const endDate = new Date();
  endDate.setDate(endDate.getDate() + 6);

  return {
    title: 'Week 1 Menu',
    description: 'Fresh weekly menu published by the kitchen admin.',
    startDate: toDateInputValue(startDate),
    endDate: toDateInputValue(endDate),
    isActive: true,
    meals: [
      { ...createEmptyMealRow('Monday'), mealType: 'Breakfast', name: 'Poha, fruit, tea', description: 'Light breakfast to start the day', price: 99 },
      { ...createEmptyMealRow('Monday'), mealType: 'Lunch', name: 'Paneer butter masala, roti', description: 'Rich veg lunch', dietType: 'Veg', price: 199 },
      { ...createEmptyMealRow('Monday'), mealType: 'Dinner', name: 'Chicken curry, rice', description: 'Protein rich dinner', dietType: 'Non-veg', price: 229 },
    ],
  };
}

function mapMenuToForm(menu) {
  return {
    title: menu.title || 'Week 1 Menu',
    description: menu.description || '',
    startDate: toDateInputValue(menu.startDate),
    endDate: toDateInputValue(menu.endDate),
    isActive: Boolean(menu.isActive),
    meals: Array.isArray(menu.meals) && menu.meals.length > 0 ? menu.meals.map((meal) => ({
      dayOfWeek: meal.dayOfWeek || 'Monday',
      mealType: meal.mealType || 'Breakfast',
      dietType: meal.dietType || 'Veg',
      name: meal.name || '',
      description: meal.description || '',
      price: meal.price || 0,
      calories: meal.calories || 0,
      protein: meal.protein || 0,
      imageUrl: meal.imageUrl || '',
    })) : [createEmptyMealRow('Monday')],
  };
}

function toDateInputValue(value) {
  if (!value) return '';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return '';
  return date.toISOString().slice(0, 10);
}

function Field({ label, value, onChange, placeholder, type = 'text' }) {
  return (
    <label className="block">
      <span className="mb-2 block text-sm font-medium text-slate-700">{label}</span>
      <input
        type={type}
        value={value}
        onChange={(event) => onChange(event.target.value)}
        placeholder={placeholder}
        className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-orange-400 focus:ring-4 focus:ring-orange-100"
      />
    </label>
  );
}

function Select({ label, value, options, onChange }) {
  return (
    <label className="block">
      <span className="mb-2 block text-sm font-medium text-slate-700">{label}</span>
      <select
        value={value}
        onChange={(event) => onChange(event.target.value)}
        className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-orange-400 focus:ring-4 focus:ring-orange-100"
      >
        {options.map((option) => (
          <option key={option} value={option}>{option}</option>
        ))}
      </select>
    </label>
  );
}

function InfoCard({ label, value, tone }) {
  const classes = tone === 'emerald' ? 'bg-emerald-50 text-emerald-700' : 'bg-orange-50 text-orange-700';

  return (
    <div className="rounded-3xl border border-slate-200 bg-white p-4">
      <p className="text-xs font-semibold uppercase tracking-[0.22em] text-slate-400">{label}</p>
      <div className={`mt-3 inline-flex rounded-full px-3 py-1 text-sm font-semibold ${classes}`}>{value}</div>
    </div>
  );
}