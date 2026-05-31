import { useState } from 'react';
import { Navigate, useLocation, useNavigate } from 'react-router-dom';
import { Mail, Lock, UserPlus, ShieldCheck, ArrowRight } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export default function AuthPage() {
  const { user, login, register } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [mode, setMode] = useState('login');
  const [role, setRole] = useState('customer');
  const [form, setForm] = useState({ name: '', email: '', phone: '', password: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  if (user) {
    return <Navigate to={location.state?.from?.pathname || '/dashboard'} replace />;
  }

  const submit = async (event) => {
    event.preventDefault();
    setError('');
    setLoading(true);
    try {
      const payload = { ...form, role };
      const data = mode === 'login' ? await login(payload) : await register(payload);
      navigate(data.role === 'admin' ? '/admin' : '/dashboard', { replace: true });
    } catch (err) {
      setError(err?.response?.data?.message || err.message || 'Authentication failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_top,_rgba(249,115,22,0.15),_transparent_30%),linear-gradient(180deg,#fff7ed_0%,#ffffff_44%,#f8fafc_100%)] px-4 py-8">
      <div className="mx-auto grid min-h-[calc(100vh-4rem)] max-w-6xl gap-8 lg:grid-cols-[0.95fr_1.05fr]">
        <section className="flex flex-col justify-between rounded-[2rem] bg-slate-950 p-8 text-white shadow-2xl shadow-slate-950/20 lg:p-10">
          <div>
            <p className="text-xs uppercase tracking-[0.28em] text-orange-200">Community Dabba</p>
            <h1 className="mt-3 max-w-lg text-4xl font-black tracking-tight">One account for meal plans, skips, and delivery tracking.</h1>
            <p className="mt-4 max-w-md text-sm leading-7 text-slate-300">
              Built for customers, kitchen admins, and delivery staff with a simple role-based experience.
            </p>
          </div>
          <div className="mt-8 grid gap-4 sm:grid-cols-2">
            {[
              ['Secure login', 'JWT backed sessions and route protection.'],
              ['Fast planning', 'Weekly menus, plans, payments, and history.'],
              ['Clear operations', 'Skip cutoffs and delivery states at a glance.'],
              ['Mobile-first', 'Readable layouts for all age groups.'],
            ].map(([title, text]) => (
              <div key={title} className="rounded-3xl border border-white/10 bg-white/5 p-4">
                <ShieldCheck className="h-5 w-5 text-orange-300" />
                <h3 className="mt-3 text-sm font-semibold">{title}</h3>
                <p className="mt-1 text-xs leading-6 text-slate-300">{text}</p>
              </div>
            ))}
          </div>
        </section>

        <section className="flex items-center justify-center rounded-[2rem] border border-white/70 bg-white/80 p-6 shadow-2xl shadow-slate-200/60 backdrop-blur lg:p-10">
          <div className="w-full max-w-md">
            <div className="mb-6 flex rounded-2xl bg-slate-100 p-1">
              <button type="button" onClick={() => setMode('login')} className={`flex-1 rounded-xl px-4 py-3 text-sm font-semibold ${mode === 'login' ? 'bg-white text-slate-950 shadow-sm' : 'text-slate-500'}`}>
                Login
              </button>
              <button type="button" onClick={() => setMode('register')} className={`flex-1 rounded-xl px-4 py-3 text-sm font-semibold ${mode === 'register' ? 'bg-white text-slate-950 shadow-sm' : 'text-slate-500'}`}>
                Register
              </button>
            </div>

            <div className="mb-6 space-y-2">
              <h2 className="text-3xl font-bold text-slate-950">{mode === 'login' ? 'Welcome back' : 'Create your account'}</h2>
              <p className="text-sm text-slate-500">Use a real account or the demo flow to explore the app.</p>
            </div>

            {error ? <div className="mb-4 rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">{error}</div> : null}

            <form className="space-y-4" onSubmit={submit}>
              {mode === 'register' ? (
                <Field label="Full name" icon={UserPlus} value={form.name} onChange={(name) => setForm({ ...form, name })} placeholder="Amit Sharma" />
              ) : null}
              <Field label="Email" icon={Mail} value={form.email} onChange={(email) => setForm({ ...form, email })} placeholder="name@example.com" />
              {mode === 'register' ? <Field label="Phone" icon={Mail} value={form.phone} onChange={(phone) => setForm({ ...form, phone })} placeholder="9876543210" /> : null}
              <Field label="Password" icon={Lock} type="password" value={form.password} onChange={(password) => setForm({ ...form, password })} placeholder="••••••••" />

              <div className="grid grid-cols-3 gap-2 rounded-2xl bg-slate-100 p-1">
                {['customer', 'admin', 'delivery'].map((option) => (
                  <button
                    key={option}
                    type="button"
                    onClick={() => setRole(option)}
                    className={`rounded-xl px-3 py-2 text-xs font-semibold capitalize ${role === option ? 'bg-white text-orange-700 shadow-sm' : 'text-slate-500'}`}
                  >
                    {option}
                  </button>
                ))}
              </div>

              <button
                type="submit"
                disabled={loading}
                className="inline-flex w-full items-center justify-center gap-2 rounded-2xl bg-slate-950 px-5 py-3 text-sm font-semibold text-white transition hover:bg-slate-800 disabled:opacity-60"
              >
                {loading ? 'Please wait...' : mode === 'login' ? 'Login securely' : 'Create account'}
                <ArrowRight className="h-4 w-4" />
              </button>
            </form>
          </div>
        </section>
      </div>
    </div>
  );
}

function Field({ label, icon: Icon, value, onChange, placeholder, type = 'text' }) {
  return (
    <label className="block">
      <span className="mb-2 block text-sm font-medium text-slate-700">{label}</span>
      <div className="relative">
        <Icon className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
        <input
          type={type}
          value={value}
          onChange={(event) => onChange(event.target.value)}
          placeholder={placeholder}
          className="w-full rounded-2xl border border-slate-200 bg-white px-11 py-3 text-sm text-slate-900 outline-none transition focus:border-orange-400 focus:ring-4 focus:ring-orange-100"
        />
      </div>
    </label>
  );
}