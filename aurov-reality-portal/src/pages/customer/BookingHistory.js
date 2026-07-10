// import PageHeader from '../../components/ui/PageHeader.js';
// import SectionCard from '../../components/ui/SectionCard.js';
// import StatusBadge from '../../components/ui/StatusBadge.js';
// import { useAppData } from '../../context/AppDataContext.js';
// import { formatCurrency } from '../../utils/formatters.js';

// export default function BookingHistory() {
//   const app = useAppData();
//   return (
//     <div>
//       <PageHeader title="Booking History" subtitle="Frontend-only customer booking history from Local Storage. Demo visits and property reservations appear here after submission." />
//       <SectionCard title="My Site Visits & Reservations" subtitle="Local Storage customer workflow records">
//         <div className="table-wrap">
//           <table className="min-w-[900px] w-full text-left">
//             <thead><tr className="border-b border-slate-200 text-xs font-black uppercase tracking-wider text-slate-500"><th className="py-4 pr-4">ID</th><th className="py-4 pr-4">Customer</th><th className="py-4 pr-4">Type</th><th className="py-4 pr-4">Venture</th><th className="py-4 pr-4">Property</th><th className="py-4 pr-4">Amount</th><th className="py-4 pr-4">Status</th></tr></thead>
//             <tbody>
//               {app.bookings.map((booking) => (
//                 <tr key={booking.id} className="border-b border-slate-100 text-sm font-bold text-slate-700">
//                   <td className="py-4 pr-4 font-black text-[#0B3D91]">{booking.id}</td><td className="py-4 pr-4">{booking.customer}</td><td className="py-4 pr-4">{booking.type || 'Reservation'}</td><td className="py-4 pr-4">{booking.venture}</td><td className="py-4 pr-4">{booking.property}</td><td className="py-4 pr-4">{booking.type === 'Site Visit' ? '-' : formatCurrency(booking.amount)}</td><td className="py-4 pr-4"><StatusBadge status={booking.status} /></td>
//                 </tr>
//               ))}
//             </tbody>
//           </table>
//         </div>
//       </SectionCard>
//     </div>
//   );
// }






import { useEffect, useState } from 'react';

import PageHeader from '../../components/ui/PageHeader.js';
import SectionCard from '../../components/ui/SectionCard.js';
import StatusBadge from '../../components/ui/StatusBadge.js';
import PrimaryButton from '../../components/ui/PrimaryButton.js';
import { formatCurrency } from '../../utils/formatters.js';
import { customerBookingApi } from '../../services/api.js';

export default function BookingHistory() {
  const [bookings, setBookings] = useState([]);
  const [phone, setPhone] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const loadBookings = async (phoneNumber = '') => {
    try {
      setLoading(true);
      setError('');

      const data = await customerBookingApi.getBookings(phoneNumber);
      setBookings(Array.isArray(data) ? data : []);
    } catch (err) {
      setError(err.message || 'Unable to load booking history');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadBookings();
  }, []);

  const searchByPhone = (event) => {
    event.preventDefault();
    loadBookings(phone.trim());
  };

  return (
    <div>
      <PageHeader
        title="Booking History"
        subtitle="Customer booking history loaded from backend database. Demo visits and property reservations appear here after submission."
      />

      <SectionCard
        title="My Site Visits & Reservations"
        subtitle="Backend customer workflow records"
      >
        <form
          onSubmit={searchByPhone}
          className="mb-5 grid gap-3 sm:grid-cols-[1fr_auto]"
        >
          <input
            value={phone}
            onChange={(event) => setPhone(event.target.value)}
            className="w-full rounded-2xl border border-slate-200 px-4 py-3 text-sm font-bold outline-none focus:border-[#1E5EFF]"
            placeholder="Search by mobile number"
          />

          <PrimaryButton type="submit">
            Search
          </PrimaryButton>
        </form>

        {loading && (
          <div className="rounded-2xl bg-slate-50 p-5 text-sm font-black text-slate-500">
            Loading booking history...
          </div>
        )}

        {error && (
          <div className="rounded-2xl border border-red-200 bg-red-50 p-5 text-sm font-black text-red-700">
            {error}
          </div>
        )}

        {!loading && !error && (
          <div className="table-wrap">
            <table className="min-w-[900px] w-full text-left">
              <thead>
                <tr className="border-b border-slate-200 text-xs font-black uppercase tracking-wider text-slate-500">
                  <th className="py-4 pr-4">ID</th>
                  <th className="py-4 pr-4">Customer</th>
                  <th className="py-4 pr-4">Type</th>
                  <th className="py-4 pr-4">Venture</th>
                  <th className="py-4 pr-4">Property</th>
                  <th className="py-4 pr-4">Amount</th>
                  <th className="py-4 pr-4">Status</th>
                </tr>
              </thead>

              <tbody>
                {bookings.map((booking) => (
                  <tr
                    key={booking.id}
                    className="border-b border-slate-100 text-sm font-bold text-slate-700"
                  >
                    <td className="py-4 pr-4 font-black text-[#0B3D91]">
                      {booking.id}
                    </td>

                    <td className="py-4 pr-4">
                      {booking.customer}
                      <br />
                      <span className="text-xs text-slate-500">
                        {booking.phone}
                      </span>
                    </td>

                    <td className="py-4 pr-4">
                      {booking.type || 'Reservation'}
                    </td>

                    <td className="py-4 pr-4">
                      {booking.venture}
                    </td>

                    <td className="py-4 pr-4">
                      {booking.property}
                    </td>

                    <td className="py-4 pr-4">
                      {booking.type === 'Site Visit'
                        ? '-'
                        : formatCurrency(booking.amount || 0)}
                    </td>

                    <td className="py-4 pr-4">
                      <StatusBadge status={booking.status} />
                    </td>
                  </tr>
                ))}

                {bookings.length === 0 && (
                  <tr>
                    <td
                      colSpan="7"
                      className="rounded-2xl bg-slate-50 p-5 text-sm font-black text-slate-500"
                    >
                      No booking history found.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </SectionCard>
    </div>
  );
}