import { useMemo, useState } from 'react';
import { FiBriefcase, FiSearch } from 'react-icons/fi';
import PageHeader from '../../components/ui/PageHeader.js';
import SectionCard from '../../components/ui/SectionCard.js';
import StatusBadge from '../../components/ui/StatusBadge.js';
import StatCard from '../../components/ui/StatCard.js';
import { useAppData } from '../../context/AppDataContext.js';
import { useAuth } from '../../context/AuthContext.js';

const ROLE = 'Marketing Manager';
const DEPARTMENT = 'Marketing';
const TITLE = 'Marketing Campaigns';
const DESCRIPTION = 'Campaign and customer activity for the Marketing department.';

export default function MarketingManagerCampaigns() {
  const { user } = useAuth();
  const app = useAppData();
  const [search, setSearch] = useState('');
  const roleData = app.getRoleData(ROLE, user || {});
  const records = useMemo(() => {
    const tasks = (app.tasks || []).filter((task) => task.department === DEPARTMENT || task.assignedBy === ROLE).map((task) => ({ ...task, recordType: 'Task', titleText: task.title, person: task.assignee }));
    const leads = (roleData.leads || []).filter((lead) => DEPARTMENT === 'Sales' || lead.department === DEPARTMENT).map((lead) => ({ ...lead, recordType: 'Lead', titleText: lead.name || lead.customerName || lead.source, person: lead.phone || lead.email }));
    const bookings = (roleData.bookings || []).filter((booking) => DEPARTMENT === 'Sales' || booking.department === DEPARTMENT || true).map((booking) => ({ ...booking, recordType: 'Booking', titleText: booking.customerName || booking.customer || booking.type, person: booking.phone || booking.email }));
    return [...tasks, ...leads, ...bookings];
  }, [app.tasks, roleData.leads, roleData.bookings]);

  const filtered = records.filter((item) => {
    const q = search.trim().toLowerCase();
    if (!q) return true;
    return [item.id, item.titleText, item.person, item.status, item.recordType].filter(Boolean).join(' ').toLowerCase().includes(q);
  });

  return (
    <div>
      <PageHeader title={TITLE} subtitle={DESCRIPTION} />
      <div className="grid gap-4 sm:grid-cols-3">
        <StatCard label="Total Records" value={records.length} icon={FiBriefcase} trend={DEPARTMENT + ' data'} />
        <StatCard label="Open" value={records.filter((item) => ['Pending', 'New', 'In Progress'].includes(item.status)).length} icon={FiBriefcase} trend="Needs attention" />
        <StatCard label="Closed" value={records.filter((item) => ['Completed', 'Approved', 'Closed', 'Converted', 'Confirmed'].includes(item.status)).length} icon={FiBriefcase} trend="Finished records" />
      </div>
      <SectionCard
        title={TITLE + ' Records'}
        subtitle="Standalone role page backed by Context and Local Storage."
        className="mt-6"
        action={
          <div className="flex items-center gap-2 rounded-2xl border border-slate-200 px-3 py-2">
            <FiSearch className="text-slate-400" />
            <input value={search} onChange={(e) => setSearch(e.target.value)} className="w-56 bg-transparent text-sm font-bold outline-none" placeholder="Search records" />
          </div>
        }
      >
        <div className="table-wrap">
          <table className="min-w-[900px] w-full text-left">
            <thead>
              <tr className="border-b border-slate-200 text-xs font-black uppercase tracking-wider text-slate-500">
                <th className="py-4 pr-4">ID</th>
                <th className="py-4 pr-4">Type</th>
                <th className="py-4 pr-4">Title</th>
                <th className="py-4 pr-4">Person</th>
                <th className="py-4 pr-4">Status</th>
                <th className="py-4 pr-4">Date</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((item) => (
                <tr key={item.recordType + item.id} className="border-b border-slate-100 text-sm font-bold text-slate-700">
                  <td className="py-4 pr-4">{item.id}</td>
                  <td className="py-4 pr-4">{item.recordType}</td>
                  <td className="py-4 pr-4">{item.titleText || '-'}</td>
                  <td className="py-4 pr-4">{item.person || '-'}</td>
                  <td className="py-4 pr-4"><StatusBadge status={item.status || 'New'} /></td>
                  <td className="py-4 pr-4">{item.createdAt || item.updatedAt || item.date || '-'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </SectionCard>
    </div>
  );
}
