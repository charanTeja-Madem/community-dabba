import { useEffect, useMemo, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { ArrowLeft, CheckCircle2, CreditCard, Loader2, ShieldCheck } from 'lucide-react';
import { api } from '../services/api';
import { SectionCard } from '../components/ui';

const RAZORPAY_SCRIPT_ID = 'razorpay-checkout-script';

const loadRazorpayScript = () =>
  new Promise((resolve) => {
    if (document.getElementById(RAZORPAY_SCRIPT_ID)) {
      resolve(true);
      return;
    }

    const script = document.createElement('script');
    script.id = RAZORPAY_SCRIPT_ID;
    script.src = 'https://checkout.razorpay.com/v1/checkout.js';
    script.async = true;
    script.onload = () => resolve(true);
    script.onerror = () => resolve(false);
    document.body.appendChild(script);
  });

export default function PaymentPage() {
  const location = useLocation();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');

  const plan = useMemo(() => {
    const routePlan = location.state?.plan;
    if (routePlan) return routePlan;

    const storedPlan = sessionStorage.getItem('community-dabba-selected-plan');
    return storedPlan ? JSON.parse(storedPlan) : null;
  }, [location.state]);

  useEffect(() => {
    if (!plan) {
      navigate('/subscriptions', { replace: true });
    }
  }, [navigate, plan]);

  const startPayment = async () => {
    if (!plan) return;

    try {
      setError('');
      setMessage('');
      setLoading(true);

      const scriptLoaded = await loadRazorpayScript();
      if (!scriptLoaded) {
        throw new Error('Razorpay checkout could not be loaded');
      }

      const { data: orderData } = await api.post('/payments/razorpay/order', {
        amount: plan.price,
        currency: 'INR',
        planName: plan.name,
        planType: plan.planType,
        mealPreference: plan.mealPreference,
        mealsIncluded: plan.mealsIncluded,
        startDate: plan.startDate,
        endDate: plan.endDate,
      });

      const checkoutPayload = {
        key: orderData.keyId,
        amount: orderData.order.amount,
        currency: orderData.order.currency,
        name: 'Community Dabba',
        description: plan.name,
        order_id: orderData.order.id,
        handler: async (response) => {
          await api.post('/payments/razorpay/verify', {
            ...response,
            amount: plan.price,
            plan,
          });

          sessionStorage.removeItem('community-dabba-selected-plan');
          setMessage(`${plan.name} paid successfully via Razorpay.`);
          navigate('/dashboard', { replace: true });
        },
        prefill: {
          name: 'Community Dabba Customer',
          email: 'customer@example.com',
          contact: '9999999999',
        },
        theme: { color: '#ea580c' },
        modal: {
          ondismiss: () => {
            setMessage('Payment was cancelled before completion.');
          },
        },
      };

      if (orderData.fallback || !window.Razorpay) {
        await api.post('/payments/razorpay/verify', {
          razorpay_order_id: orderData.order.id,
          razorpay_payment_id: `pay_demo_${Date.now()}`,
          razorpay_signature: 'demo_signature',
          amount: plan.price,
          plan,
        });
        sessionStorage.removeItem('community-dabba-selected-plan');
        setMessage(`${plan.name} paid successfully via Razorpay.`);
        navigate('/dashboard', { replace: true });
        return;
      }

      const razorpay = new window.Razorpay(checkoutPayload);
      razorpay.open();
    } catch (err) {
      setError(err?.response?.data?.message || err.message || 'Could not start payment.');
    } finally {
      setLoading(false);
    }
  };

  if (!plan) {
    return null;
  }

  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_top,rgba(249,115,22,0.15),transparent_30%),linear-gradient(180deg,#fff7ed_0%,#ffffff_44%,#f8fafc_100%)] px-4 py-8">
      <div className="mx-auto max-w-4xl space-y-6">
        <button
          onClick={() => navigate('/subscriptions')}
          className="inline-flex items-center gap-2 rounded-2xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 shadow-sm transition hover:border-orange-200 hover:text-orange-700"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to plans
        </button>

        <SectionCard title="Complete payment" subtitle="You’re one step away from activating your subscription.">
          <div className="grid gap-6 lg:grid-cols-[1.1fr_0.9fr]">
            <div className="rounded-[1.75rem] border border-slate-200 bg-white p-6 shadow-sm">
              <p className="text-sm font-semibold uppercase tracking-[0.2em] text-orange-600">Selected plan</p>
              <h2 className="mt-3 text-3xl font-black text-slate-950">{plan.name}</h2>
              <p className="mt-2 text-sm text-slate-500">{plan.meals}</p>

              <div className="mt-6 grid gap-3 sm:grid-cols-2">
                <InfoCard label="Plan type" value={plan.planType} />
                <InfoCard label="Meal preference" value={plan.mealPreference} />
                <InfoCard label="Meals included" value={Array.isArray(plan.mealsIncluded) ? plan.mealsIncluded.join(', ') : 'All meals'} />
                <InfoCard label="Amount" value={`₹${plan.price}`} />
              </div>

              {message ? <div className="mt-4 rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm font-medium text-emerald-700">{message}</div> : null}
              {error ? <div className="mt-4 rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm font-medium text-rose-700">{error}</div> : null}

              <button
                onClick={startPayment}
                disabled={loading}
                className="mt-6 inline-flex w-full items-center justify-center gap-2 rounded-2xl bg-slate-950 px-5 py-3 text-sm font-semibold text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <CreditCard className="h-4 w-4" />}
                Pay with Razorpay
              </button>
            </div>

            <div className="rounded-[1.75rem] border border-slate-200 bg-slate-50 p-6 shadow-sm">
              <div className="flex items-center gap-2 text-sm font-semibold text-slate-900">
                <ShieldCheck className="h-4 w-4 text-emerald-600" />
                Secure checkout
              </div>
              <p className="mt-3 text-sm leading-6 text-slate-600">
                This page redirects you to Razorpay checkout after creating an order on the backend. If your Razorpay keys are not configured, the demo fallback will still complete the flow.
              </p>
              <div className="mt-6 space-y-3 text-sm text-slate-600">
                <div className="rounded-2xl bg-white p-4 shadow-sm">1. Review plan details</div>
                <div className="rounded-2xl bg-white p-4 shadow-sm">2. Click Pay with Razorpay</div>
                <div className="rounded-2xl bg-white p-4 shadow-sm">3. Confirm payment and activate subscription</div>
              </div>
            </div>
          </div>
        </SectionCard>
      </div>
    </div>
  );
}

function InfoCard({ label, value }) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
      <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">{label}</p>
      <p className="mt-2 text-sm font-semibold text-slate-950">{value || 'N/A'}</p>
    </div>
  );
}