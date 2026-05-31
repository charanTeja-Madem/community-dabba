import { Link } from 'react-router-dom';
import { ArrowRight, Clock3, ShieldCheck, Sparkles, UtensilsCrossed } from 'lucide-react';

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_top,_rgba(249,115,22,0.16),_transparent_30%),linear-gradient(180deg,#fff7ed_0%,#ffffff_45%,#f8fafc_100%)]">
      <div className="mx-auto flex min-h-screen max-w-7xl flex-col px-4 py-6 sm:px-6 lg:px-8">
        <header className="flex items-center justify-between rounded-[2rem] border border-white/70 bg-white/75 px-5 py-4 shadow-lg shadow-orange-500/5 backdrop-blur-xl">
          <div className="flex items-center gap-3">
            <div className="rounded-2xl bg-gradient-to-br from-orange-500 to-orange-600 p-3 text-white shadow-lg shadow-orange-500/20">
              <UtensilsCrossed className="h-5 w-5" />
            </div>
            <div>
              <p className="text-xs uppercase tracking-[0.24em] text-orange-600">Community Dabba</p>
              <h1 className="text-lg font-semibold text-slate-950">Service Manager</h1>
            </div>
          </div>
          <Link
            to="/auth"
            className="inline-flex items-center gap-2 rounded-2xl bg-slate-950 px-4 py-3 text-sm font-medium text-white transition hover:bg-slate-800"
          >
            Open app
            <ArrowRight className="h-4 w-4" />
          </Link>
        </header>

        <main className="grid flex-1 items-center gap-10 py-12 lg:grid-cols-[1.15fr_0.85fr] lg:py-20">
          <section className="space-y-8">
            <div className="inline-flex items-center gap-2 rounded-full border border-orange-200 bg-orange-50 px-4 py-2 text-sm font-medium text-orange-700">
              <Sparkles className="h-4 w-4" />
              Home tiffin subscriptions made simple
            </div>
            <div className="space-y-5">
              <h2 className="max-w-3xl text-5xl font-black tracking-tight text-slate-950 sm:text-6xl">
                A modern meal service platform for customers, kitchens, and delivery teams.
              </h2>
              <p className="max-w-2xl text-lg leading-8 text-slate-600">
                Manage subscriptions, weekly menus, skip-meal credits, address books, payment records, and analytics from one clean dashboard.
              </p>
            </div>

            <div className="flex flex-wrap gap-3">
              <Link to="/auth" className="inline-flex items-center gap-2 rounded-2xl bg-orange-600 px-5 py-3 text-sm font-semibold text-white shadow-lg shadow-orange-500/20 transition hover:bg-orange-700">
                Start now
                <ArrowRight className="h-4 w-4" />
              </Link>
              <Link to="/dashboard" className="inline-flex items-center gap-2 rounded-2xl border border-slate-200 bg-white px-5 py-3 text-sm font-semibold text-slate-700 transition hover:border-orange-200 hover:text-orange-700">
                View dashboard
              </Link>
            </div>

            <div className="grid gap-4 sm:grid-cols-3">
              <FeatureCard icon={ShieldCheck} title="Secure JWT auth" text="Protected routes and role-aware access." />
              <FeatureCard icon={Clock3} title="Skip cutoffs" text="Meal changes respect daily cutoff rules." />
              <FeatureCard icon={UtensilsCrossed} title="Subscription tracking" text="Plans, meals, payments, and history in one place." />
            </div>
          </section>

          <section className="rounded-[2rem] border border-white/70 bg-white/80 p-6 shadow-2xl shadow-slate-200/50 backdrop-blur">
            <div className="rounded-[1.5rem] bg-slate-950 p-6 text-white">
              <p className="text-xs uppercase tracking-[0.24em] text-orange-200">Live snapshot</p>
              <h3 className="mt-2 text-2xl font-semibold">Today’s service overview</h3>
              <div className="mt-6 grid gap-3 sm:grid-cols-2">
                {[
                  ['Active subscribers', '1,240'],
                  ['Meals today', '3,860'],
                  ['Pending deliveries', '42'],
                  ['Revenue this week', '₹32,900'],
                ].map(([label, value]) => (
                  <div key={label} className="rounded-3xl border border-white/10 bg-white/5 p-4">
                    <p className="text-xs uppercase tracking-[0.2em] text-slate-300">{label}</p>
                    <p className="mt-2 text-2xl font-bold">{value}</p>
                  </div>
                ))}
              </div>
            </div>
          </section>
        </main>
      </div>
    </div>
  );
}

function FeatureCard({ icon: Icon, title, text }) {
  return (
    <div className="rounded-3xl border border-white/70 bg-white/80 p-5 shadow-lg shadow-slate-200/50 backdrop-blur">
      <Icon className="h-5 w-5 text-orange-600" />
      <h3 className="mt-4 text-base font-semibold text-slate-950">{title}</h3>
      <p className="mt-2 text-sm leading-6 text-slate-500">{text}</p>
    </div>
  );
}