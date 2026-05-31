import { SectionCard } from '../components/ui';

export default function AnalyticsPage() {
  return (
    <SectionCard title="Analytics" subtitle="A dedicated place for reports, trends, and business intelligence">
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {[
          ['Meal fulfillment rate', '96.4%'],
          ['On-time delivery', '94.1%'],
          ['Customer retention', '87.2%'],
        ].map(([label, value]) => (
          <div key={label} className="rounded-3xl border border-slate-200 bg-slate-50 p-5">
            <p className="text-sm font-medium text-slate-500">{label}</p>
            <p className="mt-3 text-3xl font-bold text-slate-950">{value}</p>
          </div>
        ))}
      </div>
    </SectionCard>
  );
}