import { useEffect, useMemo, useState } from 'react';
import { CalendarDays, CheckCircle2, CreditCard, Loader2, Sparkles } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { api } from '../services/api';
import { subscriptionPlans } from '../data/mockData';
import { EmptyState, SectionCard } from '../components/ui';
import { getMealPreferenceLabel, groupMealsByDay } from '../utils/menu';

export default function SubscriptionPlansPage() {
  const navigate = useNavigate();
  const [plans, setPlans] = useState(subscriptionPlans);
  const [selectedPlan, setSelectedPlan] = useState(null);
  const [activeSubscription, setActiveSubscription] = useState(null);
  const [activeMenu, setActiveMenu] = useState(null);
  const [previewOpen, setPreviewOpen] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [loading, setLoading] = useState(true);

  const activeSelection = useMemo(() => selectedPlan || plans[0], [selectedPlan, plans]);
  const activeMealPreference = activeSelection?.mealPreference || 'both';
  const activeMealPreferenceLabel = getMealPreferenceLabel(activeMealPreference);
  const menuPreview = useMemo(() => groupMealsByDay(activeMenu, activeMealPreference), [activeMenu, activeMealPreference]);
  const activePlanLabel = activeSubscription
    ? [activeSubscription.planType, activeSubscription.mealPreference]
        .filter(Boolean)
        .map((value) => String(value).replace(/-/g, ' '))
        .join(' • ')
    : '';
  const benefits = [
    'Real-time availability',
    'Skip-meal credits supported',
    'Payment history tracked',
  ];

  useEffect(() => {
    const loadPlans = async () => {
      try {
        const [plansResponse, activeResponse] = await Promise.all([
          api.get('/subscriptions/plans'),
          api.get('/subscriptions/active').catch(() => ({ data: null })),
        ]);

        if (Array.isArray(plansResponse.data) && plansResponse.data.length > 0) {
          setPlans(plansResponse.data);
        }

        if (activeResponse?.data && Object.keys(activeResponse.data).length > 0) {
          setActiveSubscription(activeResponse.data);
        }
      } catch {
        setPlans(subscriptionPlans);
      } finally {
        setLoading(false);
      }
    };

    loadPlans();
  }, []);

  useEffect(() => {
    const loadMenuPreview = async () => {
      try {
        const mealPreference = activeSelection?.mealPreference || 'both';
        const { data } = await api.get(`/menus/active?mealPreference=${encodeURIComponent(mealPreference)}`);
        setActiveMenu(data || null);
      } catch {
        setActiveMenu(null);
      }
    };

    if (!loading) {
      loadMenuPreview();
    }
  }, [activeSelection, loading]);

  const handleChoosePlan = async (plan) => {
    setError('');
    setMessage('');
    setSelectedPlan(plan);

    const planName = plan.name || plan.title || plan.id || 'Selected plan';
    const planType = plan.planType || (planName.toLowerCase().includes('monthly') ? 'monthly' : 'weekly');
    const mealPreference = plan.mealPreference || (planName.toLowerCase().includes('mixed') ? 'both' : 'veg');

    const paymentPlan = {
      id: plan.id || plan._id || planName,
      name: planName,
      planType,
      mealPreference,
      mealsIncluded: plan.mealsIncluded || ['Breakfast', 'Lunch', 'Dinner'],
      price: plan.price,
      highlight: plan.highlight,
      meals: plan.meals || 'Flexible meal coverage',
      startDate: new Date().toISOString(),
      endDate: new Date(Date.now() + (planType === 'monthly' ? 30 : 7) * 24 * 60 * 60 * 1000).toISOString(),
    };

    sessionStorage.setItem('community-dabba-selected-plan', JSON.stringify(paymentPlan));
    navigate('/payment', { state: { plan: paymentPlan } });
  };

  const handleViewPlan = (plan) => {
    setError('');
    setMessage('');
    setSelectedPlan(plan);
    setPreviewOpen(true);
  };

  return (
    <SectionCard title="Subscription plans" subtitle="Flexible pricing with clear benefits and meal counts">
      <div className="mb-5 flex flex-wrap items-center justify-between gap-3 rounded-3xl border border-orange-100 bg-orange-50/70 px-4 py-3 text-sm text-orange-800">
        <div className="flex items-center gap-2 font-medium">
          <Sparkles className="h-4 w-4" />
          {activeSubscription ? 'You already have an active subscription. Choose a new plan to upgrade.' : 'Pick a plan to activate it immediately from this screen.'}
        </div>
        {message ? <span className="font-semibold text-emerald-700">{message}</span> : null}
        {error ? <span className="font-semibold text-rose-700">{error}</span> : null}
      </div>

      {activeSubscription ? (
        <div className="mb-6 rounded-[1.75rem] border border-emerald-200 bg-emerald-50 px-5 py-4 shadow-sm">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-emerald-700">Current subscription</p>
              <h3 className="mt-1 text-xl font-bold text-slate-950">{activePlanLabel || 'Active plan'}</h3>
              <p className="mt-1 text-sm text-slate-600">Status: {activeSubscription.status || 'active'}</p>
            </div>
            <span className="inline-flex w-fit items-center gap-2 rounded-full bg-white px-3 py-1 text-xs font-semibold text-emerald-700 shadow-sm">
              <CheckCircle2 className="h-4 w-4" />
              Upgrade available
            </span>
          </div>
        </div>
      ) : null}

      {loading ? (
        <div className="flex items-center gap-2 rounded-3xl border border-slate-200 bg-white p-5 text-sm text-slate-500">
          <Loader2 className="h-4 w-4 animate-spin text-orange-600" />
          Loading plans...
        </div>
      ) : null}

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {plans.map((plan, index) => {
          const planName = plan.name || plan.title || plan.id || `Plan ${index + 1}`;
          const isSelected = (activeSelection?.name || activeSelection?.title || activeSelection?.id) === (plan.name || plan.title || plan.id);
          const planKey = plan._id || plan.id || plan.name || plan.title || index;
          const isCurrentPlan = activeSubscription
            ? [activeSubscription.planType, activeSubscription.mealPreference]
                .filter(Boolean)
                .map((value) => String(value).replace(/-/g, ' '))
                .join(' • ')
                .toLowerCase() === `${plan.planType || ''} • ${plan.mealPreference || ''}`.toLowerCase()
            : false;

            return (
              <div key={planKey} className={`rounded-[1.75rem] border p-6 shadow-sm transition ${isSelected ? 'border-orange-300 bg-orange-50/60' : 'border-slate-200 bg-white'}`}>
                <button type="button" onClick={() => setSelectedPlan(plan)} className="block w-full text-left">
                  <div className="flex items-center justify-between gap-3">
                    <p className="text-sm font-semibold uppercase tracking-[0.2em] text-orange-600">{plan.highlight}</p>
                    {isCurrentPlan ? <span className="rounded-full bg-emerald-50 px-3 py-1 text-xs font-semibold text-emerald-700">Current plan</span> : null}
                  </div>
                  <h3 className="mt-3 text-2xl font-bold text-slate-950">{planName}</h3>
                  <p className="mt-2 text-sm text-slate-500">{plan.meals || 'Flexible meal coverage'}</p>
                  <p className="mt-6 text-4xl font-black text-slate-950">₹{plan.price}</p>
                  <div className="mt-6 space-y-3 text-sm text-slate-600">
                    {benefits.map((benefit) => (
                      <Benefit key={benefit} text={benefit} />
                    ))}
                  </div>
                </button>
                <div className="mt-5 rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-600">
                  Menu preview updates to {getMealPreferenceLabel(plan.mealPreference).toLowerCase()} meals.
                </div>
                <div className="mt-6 grid grid-cols-2 gap-3">
                  <button
                    type="button"
                    onClick={() => handleViewPlan(plan)}
                    className="inline-flex items-center justify-center gap-2 rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm font-semibold text-slate-700 transition hover:border-orange-200 hover:text-orange-700"
                  >
                    <CalendarDays className="h-4 w-4" />
                    View plan
                  </button>
                  <button
                    type="button"
                    disabled={submitting}
                    onClick={() => handleChoosePlan(plan)}
                    className="inline-flex items-center justify-center gap-2 rounded-2xl bg-slate-950 px-4 py-3 text-sm font-semibold text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    <CreditCard className="h-4 w-4" />
                    {activeSubscription ? 'Upgrade' : 'Subscribe'}
                  </button>
                </div>
              </div>
            );
          })}
      </div>

      {previewOpen ? (
        <div className="fixed inset-0 z-50 bg-slate-950/55 backdrop-blur-sm">
          <div className="flex h-full w-full flex-col overflow-hidden bg-white shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-200 px-6 py-4">
              <div>
                <h3 className="text-xl font-bold text-slate-950">{activeMealPreferenceLabel} menu preview</h3>
                <p className="text-sm text-slate-500">Preview only opens when you click View plan.</p>
              </div>
              <button
                type="button"
                onClick={() => setPreviewOpen(false)}
                className="rounded-2xl border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-700 transition hover:border-orange-200 hover:text-orange-700"
              >
                Close
              </button>
            </div>

            <div className="flex-1 overflow-auto px-6 py-6">
              <div className="mb-4 grid gap-3 md:grid-cols-3">
                <PreviewStat label="Selected plan" value={activeSelection?.name || 'Choose a plan'} />
                <PreviewStat label="Meal type" value={activeMealPreferenceLabel} />
                <PreviewStat label="Meals included" value={(activeSelection?.mealsIncluded || []).join(', ') || 'All meals'} />
              </div>

              {menuPreview.length > 0 ? (
                <div className="space-y-3">
                  {menuPreview.map((dayGroup) => (
                    <article key={dayGroup.day} className="rounded-3xl border border-slate-200 bg-slate-50 p-4">
                      <div className="flex items-center gap-2 text-sm font-semibold text-slate-950">
                        <CalendarDays className="h-4 w-4 text-orange-600" />
                        {dayGroup.day}
                      </div>
                      <div className="mt-3 grid gap-3">
                        {dayGroup.meals.map((meal) => (
                          <div key={`${dayGroup.day}-${meal.mealType}-${meal.name}`} className="rounded-2xl border border-white bg-white px-4 py-3 shadow-sm">
                            <div className="flex items-start justify-between gap-3">
                              <div>
                                <p className="text-sm font-semibold text-slate-950">{meal.mealType}</p>
                                <p className="text-sm text-slate-500">{meal.name}</p>
                              </div>
                              <span className={`rounded-full px-3 py-1 text-xs font-semibold ${meal.dietType === 'Veg' ? 'bg-emerald-50 text-emerald-700' : 'bg-orange-50 text-orange-700'}`}>
                                {meal.dietType}
                              </span>
                            </div>
                          </div>
                        ))}
                      </div>
                    </article>
                  ))}
                </div>
              ) : (
                <EmptyState title="No menu published yet" description="The admin has not published matching meals for this plan preference." />
              )}
            </div>
          </div>
        </div>
      ) : null}
    </SectionCard>
  );
}

function PreviewStat({ label, value }) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-4">
      <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-400">{label}</p>
      <p className="mt-2 text-sm font-semibold text-slate-950">{value}</p>
    </div>
  );
}

function Benefit({ text }) {
  return (
    <div className="flex items-center gap-2">
      <CheckCircle2 className="h-4 w-4 text-emerald-600" />
      <span>{text}</span>
    </div>
  );
}