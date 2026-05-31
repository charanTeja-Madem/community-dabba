import { BrowserRouter, Navigate, Outlet, Route, Routes, Link, useLocation } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import LandingPage from './pages/LandingPage';
import AuthPage from './pages/AuthPage';
import CustomerDashboard from './pages/CustomerDashboard';
import WeeklyMenuPage from './pages/WeeklyMenuPage';
import SubscriptionPlansPage from './pages/SubscriptionPlansPage';
import PaymentPage from './pages/PaymentPage';
import AddressManagementPage from './pages/AddressManagementPage';
import AdminDashboardPage from './pages/AdminDashboardPage';
import AnalyticsPage from './pages/AnalyticsPage';
import ProfileSettingsPage from './pages/ProfileSettingsPage';
import NotificationsPage from './pages/NotificationsPage';
import { DashboardShell } from './components/Layout';

function ProtectedRoute({ allowRoles }) {
  const { user, loading } = useAuth();
  const location = useLocation();

  if (loading) return null;
  if (!user) return <Navigate to="/auth" replace state={{ from: location }} />;
  if (allowRoles && !allowRoles.includes(user.role)) return <Navigate to="/dashboard" replace />;
  return <Outlet />;
}

function AppRoutes() {
  return (
    <Routes>
      <Route path="/" element={<LandingPage />} />
      <Route path="/auth" element={<AuthPage />} />

      <Route element={<ProtectedRoute />}>
        <Route element={<DashboardShell />}>
          <Route path="/dashboard" element={<CustomerDashboard />} />
          <Route path="/menu" element={<WeeklyMenuPage />} />
          <Route path="/subscriptions" element={<SubscriptionPlansPage />} />
          <Route path="/payment" element={<PaymentPage />} />
          <Route path="/addresses" element={<AddressManagementPage />} />
          <Route path="/profile" element={<ProfileSettingsPage />} />
          <Route path="/notifications" element={<NotificationsPage />} />
          <Route path="/analytics" element={<AnalyticsPage />} />

          <Route element={<ProtectedRoute allowRoles={['admin']} />}>
            <Route path="/admin" element={<AdminDashboardPage />} />
          </Route>
        </Route>
      </Route>

      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <AppRoutes />
      </AuthProvider>
    </BrowserRouter>
  );
}
