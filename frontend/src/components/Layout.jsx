import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import { BarChart3, Bell, Home, LogOut, MenuSquare, MapPinned, LayoutDashboard, UserCircle2, UtensilsCrossed } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const navLinkClass = ({ isActive }) =>
  `flex items-center gap-3 rounded-2xl px-4 py-3 text-sm font-medium transition ${
    isActive ? 'bg-orange-50 text-orange-700 shadow-sm' : 'text-slate-600 hover:bg-slate-100'
  }`;

export function DashboardShell() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const items = [
    { to: '/dashboard', label: 'Dashboard', icon: LayoutDashboard, roles: ['customer'] },
    { to: '/menu', label: 'Weekly Menu', icon: MenuSquare, roles: ['customer'] },
    { to: '/subscriptions', label: 'Plans', icon: UtensilsCrossed, roles: ['customer'] },
    { to: '/addresses', label: 'Addresses', icon: MapPinned, roles: ['customer'] },
    { to: '/notifications', label: 'Notifications', icon: Bell, roles: ['customer', 'admin', 'delivery'] },
    { to: '/admin', label: 'Admin Dashboard', icon: BarChart3, roles: ['admin'] },
    { to: '/analytics', label: 'Analytics', icon: BarChart3, roles: ['admin'] },
    { to: '/profile', label: 'Profile', icon: UserCircle2, roles: ['customer', 'admin', 'delivery'] },
  ];

  const filteredItems = items.filter((item) => item.roles.includes(user?.role || 'customer'));

  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_top,_rgba(249,115,22,0.12),_transparent_30%),linear-gradient(180deg,#fff7ed_0%,#ffffff_32%,#f8fafc_100%)] text-slate-900">
      <div className="mx-auto flex min-h-screen max-w-[1600px]">
        <aside className="hidden w-80 border-r border-white/70 bg-white/70 px-5 py-6 backdrop-blur-xl lg:flex lg:flex-col">
          <div className="mb-8 flex items-center gap-3 rounded-3xl bg-slate-950 px-4 py-4 text-white shadow-lg shadow-orange-500/10">
            <div className="rounded-2xl bg-gradient-to-br from-orange-400 to-orange-600 p-3 text-white">
              <Home className="h-5 w-5" />
            </div>
            <div>
              <p className="text-xs uppercase tracking-[0.24em] text-orange-200">Community Dabba</p>
              <h1 className="text-lg font-semibold">Service Manager</h1>
            </div>
          </div>

          <nav className="flex flex-1 flex-col gap-2">
            {filteredItems.map((item) => {
              const Icon = item.icon;
              return (
                <NavLink key={item.to} to={item.to} className={navLinkClass}>
                  <Icon className="h-4 w-4" />
                  {item.label}
                </NavLink>
              );
            })}
          </nav>

          <button
            onClick={() => {
              logout();
              navigate('/');
            }}
            className="mt-6 inline-flex items-center justify-center gap-2 rounded-2xl border border-slate-200 px-4 py-3 text-sm font-medium text-slate-700 transition hover:border-orange-200 hover:bg-orange-50 hover:text-orange-700"
          >
            <LogOut className="h-4 w-4" />
            Sign out
          </button>
        </aside>

        <main className="flex-1 px-4 py-4 sm:px-6 lg:px-8 lg:py-6">
          <header className="mb-6 rounded-[2rem] border border-white/70 bg-white/75 px-5 py-4 shadow-lg shadow-orange-500/5 backdrop-blur-xl">
            <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.3em] text-orange-600">Dashboard</p>
                <h2 className="mt-1 text-2xl font-bold text-slate-950">Welcome back, {user?.name || 'Member'}</h2>
                <p className="text-sm text-slate-500 capitalize">{user?.role || 'customer'} account</p>
              </div>
              <div className="flex flex-wrap gap-2">
                <span className="rounded-full bg-orange-50 px-3 py-1 text-xs font-semibold text-orange-700">Mobile ready</span>
                <span className="rounded-full bg-emerald-50 px-3 py-1 text-xs font-semibold text-emerald-700">API connected</span>
              </div>
            </div>
          </header>

          <Outlet />
        </main>
      </div>
    </div>
  );
}