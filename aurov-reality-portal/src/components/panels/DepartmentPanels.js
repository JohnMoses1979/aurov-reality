import { useMemo } from 'react';
import { FiCheckCircle, FiClock, FiCreditCard, FiFileText, FiPhoneCall, FiUserPlus } from 'react-icons/fi';
import PageHeader from '../ui/PageHeader.js';
import SectionCard from '../ui/SectionCard.js';
import PrimaryButton from '../ui/PrimaryButton.js';
import StatusBadge from '../ui/StatusBadge.js';
import { useAuth } from '../../context/AuthContext.js';
import { useAppData } from '../../context/AppDataContext.js';
import { formatCurrency } from '../../utils/formatters.js';

export function CampaignsPanel({ title = 'Campaigns', subtitle = 'Marketing campaign work and campaign PDF tasks for this department.' }) {
  const { user } = useAuth();
  const app = useAppData();
  const tasks = app.tasks.filter((task) => task.department === 'Marketing');
  const campaigns = [
    { name: 'Green County Digital Launch', channel: 'Social + Search', budget: 185000, leads: 42, status: 'Active' },
    { name: 'Lake View Villa Campaign', channel: 'Premium Ads', budget: 260000, leads: 31, status: 'Planning' },
    { name: 'Aurov Heights Retargeting', channel: 'CRM + Display', budget: 120000, leads: 57, status: 'Active' },
  ];
  return (
    <div>
      <PageHeader title={title} subtitle={subtitle} />
      <div className="grid gap-6 xl:grid-cols-[1fr_0.9fr]">
        <SectionCard title="Campaign Board" subtitle="Frontend-only campaign simulation">
          <div className="grid gap-4 md:grid-cols-2">
            {campaigns.map((item) => (
              <article key={item.name} className="rounded-[28px] border border-slate-200 bg-white p-5 shadow-sm">
                <div className="flex items-start justify-between gap-3"><div><p className="text-xs font-black uppercase tracking-[0.2em] text-[#0B7A8F]">{item.channel}</p><h3 className="mt-2 text-lg font-black text-slate-900">{item.name}</h3></div><StatusBadge status={item.status} /></div>
                <div className="mt-5 grid grid-cols-2 gap-3"><div className="rounded-2xl bg-slate-50 p-3"><p className="text-xs font-bold text-slate-500">Budget</p><p className="font-black">{formatCurrency(item.budget)}</p></div><div className="rounded-2xl bg-slate-50 p-3"><p className="text-xs font-bold text-slate-500">Leads</p><p className="font-black">{item.leads}</p></div></div>
              </article>
            ))}
          </div>
        </SectionCard>
        <SectionCard title="Marketing PDF Work" subtitle={`${user?.role || 'Marketing'} assigned work`}>
          <div className="space-y-3">
            {tasks.map((task) => <div key={task.id} className="rounded-2xl border border-slate-100 bg-slate-50 p-4"><div className="flex items-start justify-between gap-3"><div><p className="font-black text-slate-900">{task.title}</p><p className="text-xs font-bold text-slate-500">{task.assignee} · {task.pdfName}</p></div><StatusBadge status={task.status} /></div></div>)}
            {tasks.length === 0 && <p className="rounded-2xl bg-slate-50 p-4 text-sm font-bold text-slate-500">No marketing PDF tasks assigned yet.</p>}
          </div>
        </SectionCard>
      </div>
    </div>
  );
}

export function CustomerFollowupsPanel({ title = 'Customer Followups', subtitle = 'CRM follow-up list from customer leads and bookings.' }) {
  const app = useAppData();
  const leads = app.leads;
  return (
    <div>
      <PageHeader title={title} subtitle={subtitle} />
      <SectionCard title="Follow-up Pipeline" subtitle="Customer enquiries created from website forms">
        <div className="table-wrap">
          <table className="min-w-[920px] w-full text-left">
            <thead><tr className="border-b border-slate-200 text-xs font-black uppercase tracking-wider text-slate-500"><th className="py-4 pr-4">Lead</th><th className="py-4 pr-4">Phone</th><th className="py-4 pr-4">Source</th><th className="py-4 pr-4">Venture</th><th className="py-4 pr-4">Status</th><th className="py-4 pr-4">Action</th></tr></thead>
            <tbody>
              {leads.map((lead) => (
                <tr key={lead.id} className="border-b border-slate-100 text-sm font-bold text-slate-700">
                  <td className="py-4 pr-4"><p className="font-black text-slate-900">{lead.name}</p><p className="text-xs text-slate-500">{lead.email || 'No email'}</p></td>
                  <td className="py-4 pr-4">{lead.phone}</td><td className="py-4 pr-4">{lead.source}</td><td className="py-4 pr-4">{lead.venture}</td><td className="py-4 pr-4"><StatusBadge status={lead.status} /></td>
                  <td className="py-4 pr-4"><PrimaryButton className="py-2" variant="outline" onClick={() => app.updateLeadStatus(lead.id, 'Follow-up')}><FiPhoneCall /> Mark Follow-up</PrimaryButton></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </SectionCard>
    </div>
  );
}

export function PaymentsPanel({ title = 'Payments', subtitle = 'Accounts payment monitoring from customer property reservations.' }) {
  const app = useAppData();
  const reservations = app.bookings.filter((item) => item.type !== 'Site Visit');
  return (
    <div>
      <PageHeader title={title} subtitle={subtitle} />
      <SectionCard title="Payment Verification Queue" subtitle="Approve and track customer payment lifecycle">
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {reservations.map((booking) => (
            <article key={booking.id} className="rounded-[28px] border border-slate-200 bg-white p-5 shadow-sm">
              <div className="flex items-start justify-between gap-3"><div><p className="text-xs font-black uppercase tracking-[0.2em] text-[#0B7A8F]">{booking.id}</p><h3 className="mt-2 text-lg font-black text-slate-900">{booking.customer}</h3><p className="mt-1 text-sm font-bold text-slate-500">{booking.property} · {booking.venture}</p></div><StatusBadge status={booking.status} /></div>
              <div className="mt-5 grid grid-cols-2 gap-3"><div className="rounded-2xl bg-slate-50 p-3"><p className="text-xs font-bold text-slate-500">Amount</p><p className="font-black">{formatCurrency(booking.amount)}</p></div><div className="rounded-2xl bg-slate-50 p-3"><p className="text-xs font-bold text-slate-500">Paid</p><p className="font-black">{formatCurrency(booking.paid)}</p></div></div>
              <div className="mt-4 flex flex-wrap gap-2"><PrimaryButton variant="outline" className="py-2" onClick={() => app.updateBookingStatus(booking.id, 'Payment Due')}><FiClock /> Due</PrimaryButton><PrimaryButton variant="green" className="py-2" onClick={() => app.updateBookingStatus(booking.id, 'Confirmed')}><FiCheckCircle /> Verify</PrimaryButton></div>
            </article>
          ))}
        </div>
      </SectionCard>
    </div>
  );
}

export function InvoicesPanel({ title = 'Invoices', subtitle = 'Invoice list generated from bookings and reservations.' }) {
  const app = useAppData();
  const reservations = app.bookings.filter((item) => item.type !== 'Site Visit');
  return (
    <div>
      <PageHeader title={title} subtitle={subtitle} />
      <SectionCard title="Booking Invoices" subtitle="Frontend invoice records from Local Storage bookings">
        <div className="table-wrap">
          <table className="min-w-[840px] w-full text-left">
            <thead><tr className="border-b border-slate-200 text-xs font-black uppercase tracking-wider text-slate-500"><th className="py-4 pr-4">Invoice</th><th className="py-4 pr-4">Customer</th><th className="py-4 pr-4">Property</th><th className="py-4 pr-4">Amount</th><th className="py-4 pr-4">Status</th><th className="py-4 pr-4">Download</th></tr></thead>
            <tbody>{reservations.map((booking) => <tr key={booking.id} className="border-b border-slate-100 text-sm font-bold text-slate-700"><td className="py-4 pr-4 font-black text-[#0B3D91]">INV-{booking.id}</td><td className="py-4 pr-4">{booking.customer}</td><td className="py-4 pr-4">{booking.property}</td><td className="py-4 pr-4">{formatCurrency(booking.amount)}</td><td className="py-4 pr-4"><StatusBadge status={booking.status} /></td><td className="py-4 pr-4"><PrimaryButton variant="outline" className="py-2"><FiFileText /> Invoice</PrimaryButton></td></tr>)}</tbody>
          </table>
        </div>
      </SectionCard>
    </div>
  );
}

export function RecruitmentPanel({ title = 'Recruitment', subtitle = 'HR recruitment tasks and onboarding tracker.' }) {
  const app = useAppData();
  const hrEmployees = app.employees.filter((employee) => employee.department === 'HR');
  const tasks = app.tasks.filter((task) => task.department === 'HR');
  return (
    <div>
      <PageHeader title={title} subtitle={subtitle} />
      <div className="grid gap-6 xl:grid-cols-[1fr_0.9fr]">
        <SectionCard title="Recruitment Pipeline" subtitle="Demo HR recruitment board">
          <div className="grid gap-4 md:grid-cols-2">
            {['Screening', 'Interview Scheduled', 'Document Collection', 'Onboarding'].map((stage, index) => <article key={stage} className="rounded-[28px] border border-slate-200 bg-white p-5 shadow-sm"><FiUserPlus className="text-3xl text-[#0B7A8F]" /><h3 className="mt-3 text-lg font-black text-slate-900">{stage}</h3><p className="mt-2 text-sm font-bold text-slate-500">{index + 2} candidates in progress</p></article>)}
          </div>
        </SectionCard>
        <SectionCard title="HR Tasks" subtitle="PDF recruitment task workflow">
          <div className="space-y-3">{tasks.map((task) => <div key={task.id} className="rounded-2xl border border-slate-100 bg-slate-50 p-4"><p className="font-black text-slate-900">{task.title}</p><p className="text-xs font-bold text-slate-500">{task.assignee} · {task.due}</p></div>)}{tasks.length === 0 && <p className="rounded-2xl bg-slate-50 p-4 text-sm font-bold text-slate-500">No HR PDF tasks assigned yet.</p>}</div>
        </SectionCard>
      </div>
      <SectionCard title="HR Team" subtitle="Current HR employees" className="mt-6"><div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">{hrEmployees.map((employee) => <div key={employee.id} className="rounded-2xl border border-slate-100 bg-slate-50 p-4"><p className="font-black text-slate-900">{employee.name}</p><p className="text-sm font-bold text-slate-500">{employee.role}</p><StatusBadge status={employee.status} /></div>)}</div></SectionCard>
    </div>
  );
}
