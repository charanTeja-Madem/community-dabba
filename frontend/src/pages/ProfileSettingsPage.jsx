import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { SectionCard } from '../components/ui';

export default function ProfileSettingsPage() {
  const { user } = useAuth();
  const [form, setForm] = useState({ name: user?.name || '', phone: user?.phone || '', email: user?.email || '' });

  return (
    <SectionCard title="Profile settings" subtitle="Update basic account details and contact information">
      <div className="grid gap-4 md:grid-cols-2">
        {['name', 'email', 'phone'].map((field) => (
          <label key={field} className="block">
            <span className="mb-2 block text-sm font-medium capitalize text-slate-700">{field}</span>
            <input
              value={form[field]}
              onChange={(event) => setForm({ ...form, [field]: event.target.value })}
              className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm outline-none transition focus:border-orange-400 focus:ring-4 focus:ring-orange-100"
            />
          </label>
        ))}
      </div>
    </SectionCard>
  );
}