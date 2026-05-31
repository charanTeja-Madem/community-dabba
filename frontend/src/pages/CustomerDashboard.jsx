import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { Bell, CalendarDays, CircleDollarSign, PackageCheck, UtensilsCrossed } from 'lucide-react';
import { api } from '../services/api';
import { EmptyState, SectionCard, StatCard } from '../components/ui';
import { getMealPreferenceLabel, groupMealsByDay } from '../utils/menu';

const preferenceTone = {
  veg: 'emerald',
  'non-veg': 'orange',
  both: 'blue',
};

export default function CustomerDashboard() {
  const [activeSubscription, setActiveSubscription] = useState(null);
  const [activeMenu, setActiveMenu] = useState(null);
  const [dashboard, setDashboard] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const loadDashboard = async () => {
      try {
        const [{ data: dashboardData }, { data: subscription }] = await Promise.all([
          api.get('/users/dashboard'),
          api.get('/subscriptions/active'),
        ]);

        const mealPreference = subscription?.mealPreference || 'both';
        const { data: menu } = await api.get(`/menus/active?mealPreference=${encodeURIComponent(mealPreference)}`);

        setDashboard(dashboardData);
        setActiveSubscription(subscription);
        setActiveMenu(menu);
      } catch (err) {
        setError(err?.response?.data?.message || 'Unable to load your dashboard right now.');
      } finally {
        setLoading(false);
      }
    };

    loadDashboard();
  }, []);

  const mealPreference = activeSubscription?.mealPreference || 'both';
  const preferenceLabel = getMealPreferenceLabel(mealPreference);
  const groupedMeals = useMemo(() => groupMealsByDay(activeMenu, mealPreference), [activeMenu, mealPreference]);
  const dashboardStats = useMemo(() => {
    const planLabel = activeSubscription
      ? [activeSubscription.planType, activeSubscription.mealPreference].filter(Boolean).map((value) => String(value).replace(/-/g, ' ')).join(' • ')
      : 'No active plan';

    return [
      {
        label: 'Active Subscription',
        value: planLabel,
        hint: activeSubscription ? `Valid through ${formatDate(activeSubscription.endDate)}` : 'Choose a plan to start',
        tone: 'orange',
      },
      {
        label: 'Skipped Meals',
        value: `${dashboard?.stats?.totalSkipped ?? dashboard?.skipHistory?.length ?? 0}`,
        hint: 'Credits tracked automatically',
        tone: 'emerald',
      },
      {
        label: 'Upcoming Meals',
        value: `${dashboard?.upcomingMeals?.length ?? 0}`,
        hint: 'Next days forecast',
        tone: 'blue',
      },
      {
        label: 'Payments',
        value: `${dashboard?.stats?.totalPayments ?? dashboard?.payments?.length ?? 0}`,
        hint: 'All time transactions',
        tone: 'slate',
      },
    ];
  }, [activeSubscription, dashboard]);

  return (
    <div className="space-y-6">
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <StatCard icon={CircleDollarSign} label={dashboardStats[0].label} value={dashboardStats[0].value} hint={dashboardStats[0].hint} tone={dashboardStats[0].tone} />
        <StatCard icon={PackageCheck} label={dashboardStats[1].label} value={dashboardStats[1].value} hint={dashboardStats[1].hint} tone={dashboardStats[1].tone} />
        <StatCard icon={CalendarDays} label={dashboardStats[2].label} value={dashboardStats[2].value} hint={dashboardStats[2].hint} tone={dashboardStats[2].tone} />
        <StatCard icon={Bell} label={dashboardStats[3].label} value={dashboardStats[3].value} hint={dashboardStats[3].hint} tone={dashboardStats[3].tone} />
      </div>

      <SectionCard
        title={activeSubscription ? `${activeSubscription.planType} plan active` : 'No active subscription'}
        subtitle={activeSubscription ? `Showing the ${preferenceLabel.toLowerCase()} menu for your current plan.` : 'Choose a plan to unlock your live menu view.'}
        action={!activeSubscription ? <Link to="/subscriptions" className="rounded-2xl bg-orange-600 px-4 py-2 text-sm font-semibold text-white">View plans</Link> : null}
      >
        <div className="grid gap-4 md:grid-cols-3">
          <InfoTile label="Plan type" value={activeSubscription?.planType || 'None'} />
          <InfoTile label="Meal preference" value={preferenceLabel} tone={preferenceTone[mealPreference] || 'slate'} />
          <InfoTile label="Skip credits" value={`${activeSubscription?.creditBalance || 0}`} tone="emerald" />
        </div>
      </SectionCard>

      <div className="grid gap-6 xl:grid-cols-[1.15fr_0.85fr]">
        <SectionCard title="Today’s menu" subtitle={activeMenu?.title || 'Live menu from admin'} action={<span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-600">{loading ? 'Loading...' : `${groupedMeals.length} day groups`}</span>}>
          {error ? <EmptyState title="Menu unavailable" description={error} /> : null}
          {!error && !loading && groupedMeals.length === 0 ? (
            <EmptyState
              title="No meals matched this plan"
              description="The active menu does not currently have meals for this preference. Ask the admin to publish matching entries."
            />
          ) : null}
          {!error && groupedMeals.length > 0 ? (
            <div className="grid gap-4 lg:grid-cols-2">
              {groupedMeals.map((dayGroup) => (
                <article key={dayGroup.day} className="rounded-3xl border border-slate-200 bg-slate-50 p-5">
                  <div className="flex items-center justify-between gap-4">
                    <h3 className="text-lg font-semibold text-slate-950">{dayGroup.day}</h3>
                    <span className="inline-flex items-center gap-2 rounded-full bg-white px-3 py-1 text-xs font-semibold text-slate-600 shadow-sm">
                      <UtensilsCrossed className="h-4 w-4 text-orange-600" />
                      {preferenceLabel}
                    </span>
                  </div>

                  <div className="mt-4 space-y-3">
                    {dayGroup.meals.map((meal) => (
                      <div key={`${meal.dayOfWeek}-${meal.mealType}-${meal.name}`} className="rounded-3xl border border-white bg-white p-4 shadow-sm">
                        <div className="flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
                          <div>
                            <p className="text-sm font-semibold text-slate-950">{meal.mealType}</p>
                            <p className="text-sm text-slate-500">{meal.name}</p>
                          </div>
                          <span className={`inline-flex w-fit rounded-full px-3 py-1 text-xs font-semibold ${meal.dietType === 'Veg' ? 'bg-emerald-50 text-emerald-700' : 'bg-orange-50 text-orange-700'}`}>
                            {meal.dietType}
                          </span>
                        </div>
                        <p className="mt-3 text-sm leading-6 text-slate-500">{meal.description || 'Prepared fresh for this meal slot.'}</p>
                      </div>
                    ))}
                  </div>
                </article>
              ))}
            </div>
          ) : null}
        </SectionCard>

        <SectionCard title="Subscription progress" subtitle="Simple status for every customer">
          <div className="space-y-4">
            <Progress label="Plan usage" value={72} />
            <Progress label="Meals served" value={86} />
            <Progress label="Credits used" value={28} />
          </div>
        </SectionCard>
      </div>
    </div>
  );
}

function formatDate(value) {
  if (!value) return 'N/A';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return 'N/A';
  return date.toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' });
}

function InfoTile({ label, value, tone = 'orange' }) {
  const tones = {
    orange: 'bg-orange-50 text-orange-700',
    emerald: 'bg-emerald-50 text-emerald-700',
    blue: 'bg-blue-50 text-blue-700',
    slate: 'bg-slate-100 text-slate-700',
  };

  return (
    <div className="rounded-3xl border border-slate-200 bg-white p-4">
      <p className="text-xs font-semibold uppercase tracking-[0.22em] text-slate-400">{label}</p>
      <div className={`mt-3 inline-flex rounded-full px-3 py-1 text-sm font-semibold ${tones[tone]}`}>{value}</div>
    </div>
  );
}

function Progress({ label, value }) {
  return (
    <div>
      <div className="mb-2 flex items-center justify-between text-sm">
        <span className="font-medium text-slate-700">{label}</span>
        <span className="font-semibold text-slate-950">{value}%</span>
      </div>
      <div className="h-3 overflow-hidden rounded-full bg-slate-100">
        <div className="h-full rounded-full bg-linear-to-r from-orange-500 to-orange-600" style={{ width: `${value}%` }} />
      </div>
    </div>
  );
}