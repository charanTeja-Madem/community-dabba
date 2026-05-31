import { useEffect, useState } from 'react';
import { BellRing, Loader2, CheckCheck } from 'lucide-react';
import { api } from '../services/api';
import { SectionCard } from '../components/ui';

export default function NotificationsPage() {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');

  const loadNotifications = async () => {
    try {
      setLoading(true);
      const { data } = await api.get('/notifications');
      setNotifications(data);
    } catch (err) {
      setError(err?.response?.data?.message || 'Unable to load notifications.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadNotifications();
  }, []);

  const handleMarkRead = async (id) => {
    try {
      setError('');
      await api.put(`/notifications/${id}/read`);
      setMessage('Notification marked as read.');
      await loadNotifications();
    } catch (err) {
      setError(err?.response?.data?.message || 'Could not update notification.');
    }
  };

  const handleMarkAll = async () => {
    try {
      setError('');
      await api.put('/notifications/read-all');
      setMessage('All notifications marked as read.');
      await loadNotifications();
    } catch (err) {
      setError(err?.response?.data?.message || 'Could not update notifications.');
    }
  };

  return (
    <SectionCard
      title="Notifications"
      subtitle="Announcements, skip confirmations, and expiry reminders"
      action={<button onClick={handleMarkAll} className="inline-flex items-center gap-2 rounded-2xl bg-orange-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-orange-700"><CheckCheck className="h-4 w-4" />Mark all read</button>}
    >
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3 rounded-3xl border border-orange-100 bg-orange-50/70 px-4 py-3 text-sm text-orange-800">
        <span className="font-medium">{message || 'Notifications refresh in real time after each action.'}</span>
        {error ? <span className="font-semibold text-rose-700">{error}</span> : null}
      </div>

      {loading ? (
        <div className="flex items-center gap-2 rounded-3xl border border-slate-200 bg-white p-5 text-sm text-slate-500">
          <Loader2 className="h-4 w-4 animate-spin text-orange-600" />
          Loading notifications...
        </div>
      ) : null}

      <div className="space-y-3">
        {notifications.map((notification) => (
          <div key={notification._id || notification.id} className="flex items-start gap-4 rounded-3xl border border-slate-200 bg-slate-50 p-4">
            <div className="rounded-2xl bg-white p-3 text-orange-600 shadow-sm">
              <BellRing className="h-5 w-5" />
            </div>
            <div className="flex-1">
              <h3 className="text-sm font-semibold text-slate-950">{notification.title}</h3>
              <p className="mt-1 text-sm text-slate-500">{notification.message}</p>
            </div>
            {!notification.isRead ? (
              <button onClick={() => handleMarkRead(notification._id || notification.id)} className="rounded-2xl border border-slate-200 px-3 py-2 text-xs font-semibold text-slate-700 hover:border-orange-200 hover:text-orange-700">
                Mark read
              </button>
            ) : (
              <span className="rounded-full bg-emerald-50 px-3 py-1 text-xs font-semibold text-emerald-700">Read</span>
            )}
          </div>
        ))}
      </div>
    </SectionCard>
  );
}