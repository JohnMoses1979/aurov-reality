import PageHeader from '../ui/PageHeader.js';
import SectionCard from '../ui/SectionCard.js';
import PrimaryButton from '../ui/PrimaryButton.js';
import StatusBadge from '../ui/StatusBadge.js';
import { formatCurrency } from '../../utils/formatters.js';
import { useAppData } from '../../context/AppDataContext.js';
import { useAuth } from '../../context/AuthContext.js';

export default function Bookings() {
  const { user } = useAuth();
  const app = useAppData();
  const { bookings } = app.getRoleData(user?.role || '');
  const reservations = bookings.filter((booking) => booking.type !== 'Site Visit');
  const siteVisits = bookings.filter((booking) => booking.type === 'Site Visit');

  return (
    <div>
      <PageHeader title="Bookings & Site Visits" subtitle="Customer reservations and demo/site visit bookings submitted from the customer website. Managing Director, Operational Head, and Sales Manager can monitor these instantly." />

      <div className="grid gap-6 xl:grid-cols-2">
        <SectionCard title="Customer Site Visits" subtitle="Demo bookings from Customer → Book Site Visit">
          <div className="table-wrap">
            <table className="min-w-[860px] w-full text-left">
              <thead><tr className="border-b border-slate-200 text-xs font-black uppercase tracking-wider text-slate-500"><th className="py-4 pr-4">Visit ID</th><th className="py-4 pr-4">Customer</th><th className="py-4 pr-4">Phone</th><th className="py-4 pr-4">Venture</th><th className="py-4 pr-4">Date / Slot</th><th className="py-4 pr-4">Status</th><th className="py-4 pr-4">Actions</th></tr></thead>
              <tbody>
                {siteVisits.map((visit) => (
                  <tr key={visit.id} className="border-b border-slate-100 text-sm font-bold text-slate-700">
                    <td className="py-4 pr-4 font-black text-[#0B3D91]">{visit.id}</td><td className="py-4 pr-4">{visit.customer}</td><td className="py-4 pr-4">{visit.phone}</td><td className="py-4 pr-4">{visit.venture}</td><td className="py-4 pr-4">{visit.date} {visit.timeSlot}</td><td className="py-4 pr-4"><StatusBadge status={visit.status} /></td>
                    <td className="py-4 pr-4"><div className="flex gap-2"><PrimaryButton variant="outline" className="py-2" onClick={() => app.updateBookingStatus(visit.id, 'Confirmed')}>Confirm</PrimaryButton><PrimaryButton variant="green" className="py-2" onClick={() => app.updateBookingStatus(visit.id, 'Closed')}>Close</PrimaryButton></div></td>
                  </tr>
                ))}
              </tbody>
            </table>
            {siteVisits.length === 0 && <p className="rounded-2xl bg-slate-50 p-4 text-sm font-bold text-slate-500">No site visits booked yet.</p>}
          </div>
        </SectionCard>

        <SectionCard title="Property Reservations" subtitle="Reservation requests from Customer → Book Property">
          <div className="table-wrap">
            <table className="min-w-[900px] w-full text-left">
              <thead><tr className="border-b border-slate-200 text-xs font-black uppercase tracking-wider text-slate-500"><th className="py-4 pr-4">Booking ID</th><th className="py-4 pr-4">Customer</th><th className="py-4 pr-4">Property</th><th className="py-4 pr-4">Venture</th><th className="py-4 pr-4">Amount</th><th className="py-4 pr-4">Paid</th><th className="py-4 pr-4">Status</th><th className="py-4 pr-4">Actions</th></tr></thead>
              <tbody>
                {reservations.map((booking) => (
                  <tr key={booking.id} className="border-b border-slate-100 text-sm font-bold text-slate-700">
                    <td className="py-4 pr-4 font-black text-[#0B3D91]">{booking.id}</td><td className="py-4 pr-4">{booking.customer}</td><td className="py-4 pr-4">{booking.property}</td><td className="py-4 pr-4">{booking.venture}</td><td className="py-4 pr-4">{formatCurrency(booking.amount)}</td><td className="py-4 pr-4">{formatCurrency(booking.paid)}</td><td className="py-4 pr-4"><StatusBadge status={booking.status} /></td>
                    <td className="py-4 pr-4"><div className="flex gap-2"><PrimaryButton variant="outline" className="py-2" onClick={() => app.updateBookingStatus(booking.id, 'Payment Due')}>Payment Due</PrimaryButton><PrimaryButton variant="green" className="py-2" onClick={() => app.updateBookingStatus(booking.id, 'Confirmed')}>Approve</PrimaryButton></div></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </SectionCard>
      </div>
    </div>
  );
}
