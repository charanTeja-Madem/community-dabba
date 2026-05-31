import { useEffect, useState } from 'react';
import { Loader2, MapPinned, Plus, Trash2, Check } from 'lucide-react';
import { api } from '../services/api';
import { SectionCard } from '../components/ui';

export default function AddressManagementPage() {
  const [addresses, setAddresses] = useState([]);
  const [form, setForm] = useState({ label: 'Home', street: '', city: '', state: '', postalCode: '', country: 'India', landmark: '', isDefault: false });
  const [editingId, setEditingId] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');

  const loadAddresses = async () => {
    try {
      setLoading(true);
      const { data } = await api.get('/addresses');
      setAddresses(data);
    } catch (err) {
      setError(err?.response?.data?.message || 'Unable to load addresses.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAddresses();
  }, []);

  const resetForm = () => {
    setForm({ label: 'Home', street: '', city: '', state: '', postalCode: '', country: 'India', landmark: '', isDefault: false });
    setEditingId(null);
  };

  const handleSave = async (event) => {
    event.preventDefault();
    setError('');
    setMessage('');

    try {
      setSaving(true);
      if (editingId) {
        await api.put(`/addresses/${editingId}`, form);
        setMessage('Address updated.');
      } else {
        await api.post('/addresses', form);
        setMessage('Address added.');
      }
      resetForm();
      await loadAddresses();
    } catch (err) {
      setError(err?.response?.data?.message || 'Could not save address.');
    } finally {
      setSaving(false);
    }
  };

  const handleEdit = (address) => {
    setEditingId(address._id);
    setForm({
      label: address.label,
      street: address.street,
      city: address.city,
      state: address.state,
      postalCode: address.postalCode,
      country: address.country || 'India',
      landmark: address.landmark || '',
      isDefault: address.isDefault || false,
    });
  };

  const handleDelete = async (id) => {
    try {
      setError('');
      setMessage('');
      await api.delete(`/addresses/${id}`);
      setMessage('Address deleted.');
      await loadAddresses();
    } catch (err) {
      setError(err?.response?.data?.message || 'Could not delete address.');
    }
  };

  const handleSetDefault = async (id) => {
    try {
      setError('');
      setMessage('');
      await api.put(`/addresses/${id}/default`);
      setMessage('Default address updated.');
      await loadAddresses();
    } catch (err) {
      setError(err?.response?.data?.message || 'Could not set default address.');
    }
  };

  return (
    <SectionCard
      title="Delivery addresses"
      subtitle="Add, edit, or mark a default delivery point"
      action={<button onClick={resetForm} className="inline-flex items-center gap-2 rounded-2xl bg-orange-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-orange-700"><Plus className="h-4 w-4" />New address</button>}
    >
      <div className="mb-5 flex flex-wrap items-center justify-between gap-3 rounded-3xl border border-orange-100 bg-orange-50/70 px-4 py-3 text-sm text-orange-800">
        <span className="font-medium">{message || 'Manage all saved delivery points from this screen.'}</span>
        {error ? <span className="font-semibold text-rose-700">{error}</span> : null}
      </div>

      <form onSubmit={handleSave} className="mb-6 grid gap-3 rounded-[1.75rem] border border-slate-200 bg-white p-5 shadow-sm md:grid-cols-2">
        <Input label="Label" value={form.label} onChange={(label) => setForm({ ...form, label })} placeholder="Home" />
        <Input label="Street" value={form.street} onChange={(street) => setForm({ ...form, street })} placeholder="Tower C, Flat 402" />
        <Input label="City" value={form.city} onChange={(city) => setForm({ ...form, city })} placeholder="Bengaluru" />
        <Input label="State" value={form.state} onChange={(state) => setForm({ ...form, state })} placeholder="Karnataka" />
        <Input label="Postal code" value={form.postalCode} onChange={(postalCode) => setForm({ ...form, postalCode })} placeholder="560001" />
        <Input label="Landmark" value={form.landmark} onChange={(landmark) => setForm({ ...form, landmark })} placeholder="Near Tech Park" />
        <Input label="Country" value={form.country} onChange={(country) => setForm({ ...form, country })} placeholder="India" />
        <label className="flex items-center gap-2 rounded-2xl border border-slate-200 px-4 py-3 text-sm font-medium text-slate-700">
          <input type="checkbox" checked={form.isDefault} onChange={(event) => setForm({ ...form, isDefault: event.target.checked })} />
          Make this default
        </label>

        <div className="md:col-span-2 flex items-center gap-3">
          <button disabled={saving} className="inline-flex items-center gap-2 rounded-2xl bg-slate-950 px-4 py-3 text-sm font-semibold text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-60">
            {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Plus className="h-4 w-4" />}
            {editingId ? 'Update address' : 'Save address'}
          </button>
          {editingId ? (
            <button type="button" onClick={resetForm} className="rounded-2xl border border-slate-200 px-4 py-3 text-sm font-semibold text-slate-700 hover:border-orange-200 hover:text-orange-700">
              Cancel edit
            </button>
          ) : null}
        </div>
      </form>

      {loading ? (
        <div className="flex items-center gap-2 rounded-3xl border border-slate-200 bg-white p-5 text-sm text-slate-500">
          <Loader2 className="h-4 w-4 animate-spin text-orange-600" />
          Loading addresses...
        </div>
      ) : null}

      <div className="grid gap-4 md:grid-cols-2">
        {addresses.map((address) => (
          <div key={address._id} className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
            <div className="flex items-start justify-between gap-4">
              <div>
                <div className="flex items-center gap-2">
                  <MapPinned className="h-4 w-4 text-orange-600" />
                  <h3 className="text-lg font-semibold text-slate-950">{address.label}</h3>
                </div>
                <p className="mt-3 text-sm text-slate-600">{address.street}</p>
                <p className="text-sm text-slate-600">{address.city}, {address.state} {address.postalCode}</p>
                <p className="mt-1 text-sm text-slate-500">{address.country}</p>
              </div>
              {address.isDefault ? <span className="rounded-full bg-emerald-50 px-3 py-1 text-xs font-semibold text-emerald-700">Default</span> : null}
            </div>
            <div className="mt-4 flex flex-wrap gap-2">
              <button onClick={() => handleEdit(address)} className="rounded-2xl border border-slate-200 px-4 py-2 text-sm font-medium text-slate-700 hover:border-orange-200 hover:text-orange-700">Edit</button>
              {!address.isDefault ? (
                <button onClick={() => handleSetDefault(address._id)} className="inline-flex items-center gap-2 rounded-2xl border border-emerald-200 px-4 py-2 text-sm font-medium text-emerald-700 hover:bg-emerald-50">
                  <Check className="h-4 w-4" />
                  Set default
                </button>
              ) : null}
              <button onClick={() => handleDelete(address._id)} className="inline-flex items-center gap-2 rounded-2xl border border-rose-200 px-4 py-2 text-sm font-medium text-rose-600 hover:bg-rose-50"><Trash2 className="h-4 w-4" />Delete</button>
            </div>
          </div>
        ))}
      </div>
    </SectionCard>
  );
}

function Input({ label, value, onChange, placeholder }) {
  return (
    <label className="block">
      <span className="mb-2 block text-sm font-medium text-slate-700">{label}</span>
      <input
        value={value}
        onChange={(event) => onChange(event.target.value)}
        placeholder={placeholder}
        className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm outline-none transition focus:border-orange-400 focus:bg-white focus:ring-4 focus:ring-orange-100"
      />
    </label>
  );
}