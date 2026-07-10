import PageHeader from '../ui/PageHeader.js';
import SectionCard from '../ui/SectionCard.js';
import PrimaryButton from '../ui/PrimaryButton.js';
import StatusBadge from '../ui/StatusBadge.js';
import { useAppData } from '../../context/AppDataContext.js';
import { useAuth } from '../../context/AuthContext.js';

const leadStatuses = ['New', 'Contacted', 'Follow-up', 'Site Visit Scheduled', 'Converted', 'Closed'];

export default function Customers() {
  const { user } = useAuth();
  const app = useAppData();
  const roleData = app.getRoleData(user?.role || '');

  return (
    <div>
      <PageHeader title="Customers & Leads" subtitle="Customer contact forms, demo visits, and property reservations automatically create leads for Managing Director, Operational Head, and Sales Manager dashboards." />
      <div className="grid gap-6 xl:grid-cols-[1fr_1.1fr]">
        <SectionCard title="Lead Management" subtitle="Update lead status lifecycle">
          <div className="space-y-3">
            {roleData.leads.map((lead) => (
              <div key={lead.id} className="rounded-3xl border border-slate-200 bg-white p-4 shadow-sm">
                <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                  <div>
                    <p className="text-xs font-black uppercase tracking-[0.2em] text-[#0B7A8F]">{lead.id} · {lead.source}</p>
                    <h3 className="mt-2 text-base font-black text-slate-900">{lead.name}</h3>
                    <p className="mt-1 text-sm font-bold text-slate-500">{lead.phone} · {lead.email || 'No email'}</p>
                    <p className="mt-1 text-sm font-bold text-slate-500">{lead.venture} · {lead.property}</p>
                  </div>
                  <div className="flex flex-col gap-2 sm:min-w-[220px]"><StatusBadge status={lead.status} /><select value={lead.status} onChange={(e) => app.updateLeadStatus(lead.id, e.target.value)} className="rounded-2xl border border-slate-200 px-3 py-2 text-sm font-bold outline-none focus:border-[#1E5EFF]">{leadStatuses.map((status) => <option key={status}>{status}</option>)}</select></div>
                </div>
              </div>
            ))}
          </div>
        </SectionCard>

        <SectionCard title="Customer Directory" subtitle="Customers created automatically from enquiries and bookings">
          <div className="grid gap-5 lg:grid-cols-2">
            {app.customers.map((customer) => (
              <div key={customer.id} className="rounded-[28px] border border-slate-200 bg-white p-5 shadow-sm">
                <div className="flex items-start justify-between gap-3"><div><p className="text-xs font-black uppercase tracking-[0.2em] text-[#0B7A8F]">{customer.id}</p><h2 className="mt-2 text-xl font-black text-slate-900">{customer.name}</h2><p className="mt-1 text-sm font-bold text-slate-500">{customer.phone}</p></div><StatusBadge status={customer.status} /></div>
                <div className="mt-5 space-y-3 text-sm font-bold text-slate-600"><p><span className="text-slate-400">Email:</span> {customer.email}</p><p><span className="text-slate-400">Interested:</span> {customer.interested}</p><p><span className="text-slate-400">Budget:</span> {customer.budget}</p></div>
                <div className="mt-5 flex gap-2"><PrimaryButton variant="outline" className="flex-1">Call</PrimaryButton><PrimaryButton className="flex-1">Follow Up</PrimaryButton></div>
              </div>
            ))}
          </div>
        </SectionCard>
      </div>
    </div>
  );
}
