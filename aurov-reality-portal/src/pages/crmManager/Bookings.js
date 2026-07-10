import { useMemo, useState } from 'react';
import { FiSearch } from 'react-icons/fi';
import PageHeader from '../../components/ui/PageHeader.js';
import SectionCard from '../../components/ui/SectionCard.js';
import PrimaryButton from '../../components/ui/PrimaryButton.js';
import StatusBadge from '../../components/ui/StatusBadge.js';
import { useAppData } from '../../context/AppDataContext.js';
import { useAuth } from '../../context/AuthContext.js';

const ROLE = 'CRM Manager';
const DEPARTMENT = 'CRM';
const TITLE = 'CRM Bookings & Leads';

export default function CrmManagerBookings() {
  const { user } = useAuth();
  const app = useAppData();
  const [search, setSearch] = useState('');
  const roleData = app.getRoleData(ROLE, user || {});
  const records = useMemo(() => {
    const leads = (roleData.leads || []).map((item) => ({ ...item, recordType: 'Lead' }));
    const bookings = (roleData.bookings || []).map((item) => ({ ...item, recordType: 'Booking' }));
    return [...leads, ...bookings].filter((item) => DEPARTMENT === 'Sales' || item.department === DEPARTMENT || item.recordType === 'Booking');
  }, [roleData.leads, roleData.bookings]);

  const filtered = records.filter((item) => {
    const q = search.trim().toLowerCase();
    if (!q) return true;
    return [item.id, item.name, item.customerName, item.customer, item.phone, item.email, item.source, item.type, item.status]
      .filter(Boolean)
      .join(' ')
      .toLowerCase()
      .includes(q);
  });

  return (
    <div>
      <PageHeader title={TITLE} subtitle="Department customer enquiries, demo requests, site visits, bookings, and reservations from Local Storage." />
      <SectionCard
        title="Customer Activity"
        subtitle="Bookings and leads visible for this department."
        action={
          <div className="flex items-center gap-2 rounded-2xl border border-slate-200 px-3 py-2">
            <FiSearch className="text-slate-400" />
            <input value={search} onChange={(e) => setSearch(e.target.value)} className="w-56 bg-transparent text-sm font-bold outline-none" placeholder="Search bookings/leads" />
          </div>
        }
      >
        <div className="table-wrap">
          <table className="min-w-[1050px] w-full text-left">
            <thead>
              <tr className="border-b border-slate-200 text-xs font-black uppercase tracking-wider text-slate-500">
                <th className="py-4 pr-4">ID</th>
                <th className="py-4 pr-4">Customer</th>
                <th className="py-4 pr-4">Type</th>
                <th className="py-4 pr-4">Contact</th>
                <th className="py-4 pr-4">Property / Venture</th>
                <th className="py-4 pr-4">Status</th>
                <th className="py-4 pr-4">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((item) => (
                <tr key={item.recordType + item.id} className="border-b border-slate-100 text-sm font-bold text-slate-700">
                  <td className="py-4 pr-4">{item.id}</td>
                  <td className="py-4 pr-4">{item.name || item.customerName || item.customer || 'Customer'}</td>
                  <td className="py-4 pr-4">{item.recordType} · {item.source || item.type || '-'}</td>
                  <td className="py-4 pr-4">{item.phone || item.mobile || item.email || '-'}</td>
                  <td className="py-4 pr-4">{item.propertyNumber || item.propertyName || item.ventureName || item.venture || '-'}</td>
                  <td className="py-4 pr-4"><StatusBadge status={item.status || 'New'} /></td>
                  <td className="py-4 pr-4">
                    <div className="flex flex-wrap gap-2">
                      {item.recordType === 'Lead' && <PrimaryButton variant="outline" className="py-2" onClick={() => app.updateLeadStatus(item.id, 'Follow-up')}>Follow-up</PrimaryButton>}
                      {item.recordType === 'Lead' && <PrimaryButton variant="green" className="py-2" onClick={() => app.updateLeadStatus(item.id, 'Converted')}>Convert</PrimaryButton>}
                      {item.recordType === 'Booking' && <PrimaryButton variant="outline" className="py-2" onClick={() => app.updateBookingStatus(item.id, 'Confirmed')}>Confirm</PrimaryButton>}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {filtered.length === 0 && <p className="rounded-2xl bg-slate-50 p-4 text-sm font-bold text-slate-500">No customer activity found.</p>}
      </SectionCard>
    </div>
  );
}
