import { useEffect, useMemo, useState } from 'react';
import { CalendarDays, CheckCircle2, Leaf, Loader2, MoonStar, SunMedium } from 'lucide-react';
import { Link } from 'react-router-dom';
import { api } from '../services/api';
import { SectionCard, EmptyState } from '../components/ui';
import { getMealPreferenceLabel, groupMealsByDay } from '../utils/menu';

export default function WeeklyMenuPage() {
  const [activeSubscription, setActiveSubscription] = useState(null);
  const [activeMenu, setActiveMenu] = useState(null);
  const [skipHistory, setSkipHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [skipLoadingKey, setSkipLoadingKey] = useState('');
  const [actionMessage, setActionMessage] = useState('');

  useEffect(() => {
    const loadMenu = async () => {
      try {
        const { data: subscription } = await api.get('/subscriptions/active');
        const mealPreference = subscription?.mealPreference || 'both';
        const [{ data: menu }, { data: history }] = await Promise.all([
          api.get(`/menus/active?mealPreference=${encodeURIComponent(mealPreference)}`),
          api.get('/subscriptions/skip/history').catch(() => ({ data: [] })),
        ]);

        setActiveSubscription(subscription);
        setActiveMenu(menu);
        setSkipHistory(Array.isArray(history) ? history : []);
      } catch (err) {
        setError(err?.response?.data?.message || 'Unable to load the active weekly menu.');
      } finally {
        setLoading(false);
      }
    };

    loadMenu();
  }, []);

  const mealPreference = activeSubscription?.mealPreference || 'both';
  const preferenceLabel = getMealPreferenceLabel(mealPreference);
  const groupedMeals = useMemo(() => groupMealsByDay(activeMenu, mealPreference), [activeMenu, mealPreference]);
  const creditBalance = activeSubscription?.creditBalance || 0;
  const skippedMealKeys = useMemo(
    () => new Set(skipHistory.map((item) => `${formatDateKey(item.date)}-${item.mealType}`)),
    [skipHistory]
  );

  const handleSkipMeal = async (meal, dayGroupDay) => {
    try {
      setError('');
      setActionMessage('');
      const mealDate = getUpcomingDateForDay(dayGroupDay).toISOString();
      const skipKey = `${dayGroupDay}-${meal.mealType}-${meal.name}`;
      setSkipLoadingKey(skipKey);

      const { data } = await api.post('/subscriptions/skip', {
        date: mealDate,
        mealType: meal.mealType,
        subscriptionId: activeSubscription?._id,
        creditAmount: 1,
      });

      setActiveSubscription((current) => ({
        ...current,
        creditBalance: data?.creditBalance ?? (current?.creditBalance || 0) + (data?.creditChange || 0),
      }));
      setSkipHistory((current) => [
        ...current,
        {
          date: mealDate,
          mealType: meal.mealType,
        },
      ]);
      setActionMessage(data?.message || 'Meal skipped successfully.');
    } catch (err) {
      setError(err?.response?.data?.message || 'Unable to skip the meal right now.');
    } finally {
      setSkipLoadingKey('');
    }
  };

  return (
    <SectionCard
      title="Weekly menu"
      subtitle={`Card-based menu view for the ${preferenceLabel.toLowerCase()} plan`}
      action={!activeSubscription ? <Link to="/subscriptions" className="rounded-2xl bg-orange-600 px-4 py-2 text-sm font-semibold text-white">Choose a plan</Link> : null}
    >
      {error ? <EmptyState title="Menu unavailable" description={error} /> : null}
      {actionMessage ? (
        <div className="mb-4 rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm font-medium text-emerald-700">
          <CheckCircle2 className="mr-2 inline-block h-4 w-4" />
          {actionMessage} Current credit balance: {creditBalance}.
        </div>
      ) : null}
      {!error && !loading && groupedMeals.length === 0 ? (
        <EmptyState title="No meals found" description="Ask the admin to publish menu entries for this plan preference." />
      ) : null}
      {!error && groupedMeals.length > 0 ? (
        <div className="grid gap-4 lg:grid-cols-2">
          {groupedMeals.map((dayGroup) => (
            <article key={dayGroup.day} className="rounded-3xl border border-slate-200 bg-slate-50 p-5">
              <div className="flex items-center justify-between gap-4">
                <h3 className="text-lg font-semibold text-slate-950">{dayGroup.day}</h3>
                <span className="inline-flex items-center gap-2 rounded-full bg-white px-3 py-1 text-xs font-semibold text-slate-600 shadow-sm">
                  <CalendarDays className="h-4 w-4 text-orange-600" />
                  {preferenceLabel}
                </span>
              </div>

              <div className="mt-4 grid gap-3 sm:grid-cols-3">
                {dayGroup.meals.map((meal) => (
                      <MealBadge
                        key={`${meal.dayOfWeek}-${meal.mealType}-${meal.name}`}
                        icon={meal.mealType === 'Breakfast' ? SunMedium : meal.mealType === 'Lunch' ? Leaf : MoonStar}
                        title={meal.mealType}
                        text={meal.name}
                        dietType={meal.dietType}
                        onSkip={activeSubscription ? () => handleSkipMeal(meal, dayGroup.day) : null}
                        skipLoading={skipLoadingKey === `${dayGroup.day}-${meal.mealType}-${meal.name}`}
                        skipped={skippedMealKeys.has(`${formatDateKey(getUpcomingDateForDay(dayGroup.day))}-${meal.mealType}`)}
                      />
                ))}
              </div>
            </article>
          ))}
        </div>
      ) : null}
    </SectionCard>
  );
}

function MealBadge({ icon: Icon, title, text, dietType, onSkip, skipLoading, skipped }) {
  return (
    <div className="rounded-3xl border border-white bg-white p-4 shadow-sm">
      <div className="flex items-center gap-2 text-sm font-semibold text-slate-950">
        <Icon className="h-4 w-4 text-orange-600" />
        {title}
      </div>
      <p className="mt-3 text-sm leading-6 text-slate-500">{text}</p>
      <p className="mt-3 inline-flex rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-600">{dietType}</p>
      {onSkip ? (
        <button
          type="button"
          onClick={onSkip}
          disabled={skipLoading || skipped}
          className="mt-4 inline-flex w-full items-center justify-center gap-2 rounded-2xl border border-orange-200 bg-orange-50 px-3 py-2 text-sm font-semibold text-orange-700 transition hover:bg-orange-100 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {skipLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
          {skipped ? 'Skipped' : 'Skip meal'}
        </button>
      ) : null}
    </div>
  );
}

function getUpcomingDateForDay(dayName) {
  const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
  const today = new Date();
  const currentDayIndex = today.getDay();
  const targetDayIndex = days.indexOf(dayName);
  const offset = (targetDayIndex - currentDayIndex + 7) % 7;
  const result = new Date(today);
  result.setDate(today.getDate() + offset);
  result.setHours(12, 0, 0, 0);
  return result;
}

function formatDateKey(value) {
  const date = value instanceof Date ? value : new Date(value);
  if (Number.isNaN(date.getTime())) return '';
  return date.toISOString().slice(0, 10);
}