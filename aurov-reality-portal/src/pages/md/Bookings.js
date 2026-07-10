// import PageHeader from '../../components/ui/PageHeader.js';
// import SectionCard from '../../components/ui/SectionCard.js';
// import PrimaryButton from '../../components/ui/PrimaryButton.js';
// import StatusBadge from '../../components/ui/StatusBadge.js';
// import { formatCurrency } from '../../utils/formatters.js';
// import { useAppData } from '../../context/AppDataContext.js';
// import { useAuth } from '../../context/AuthContext.js';

// export default function Bookings() {
//   const { user } = useAuth();
//   const app = useAppData();
//   const { bookings } = app.getRoleData(user?.role || '');
//   const reservations = bookings.filter((booking) => booking.type !== 'Site Visit');
//   const siteVisits = bookings.filter((booking) => booking.type === 'Site Visit');

//   return (
//     <div>
//       <PageHeader title="Bookings & Site Visits" subtitle="Customer reservations and demo/site visit bookings submitted from the customer website. Managing Director, Operational Head, and Sales Manager can monitor these instantly." />

//       <div className="grid gap-6 xl:grid-cols-2">
//         <SectionCard title="Customer Site Visits" subtitle="Demo bookings from Customer → Book Site Visit">
//           <div className="table-wrap">
//             <table className="min-w-[860px] w-full text-left">
//               <thead><tr className="border-b border-slate-200 text-xs font-black uppercase tracking-wider text-slate-500"><th className="py-4 pr-4">Visit ID</th><th className="py-4 pr-4">Customer</th><th className="py-4 pr-4">Phone</th><th className="py-4 pr-4">Venture</th><th className="py-4 pr-4">Date / Slot</th><th className="py-4 pr-4">Status</th><th className="py-4 pr-4">Actions</th></tr></thead>
//               <tbody>
//                 {siteVisits.map((visit) => (
//                   <tr key={visit.id} className="border-b border-slate-100 text-sm font-bold text-slate-700">
//                     <td className="py-4 pr-4 font-black text-[#0B3D91]">{visit.id}</td><td className="py-4 pr-4">{visit.customer}</td><td className="py-4 pr-4">{visit.phone}</td><td className="py-4 pr-4">{visit.venture}</td><td className="py-4 pr-4">{visit.date} {visit.timeSlot}</td><td className="py-4 pr-4"><StatusBadge status={visit.status} /></td>
//                     <td className="py-4 pr-4"><div className="flex gap-2"><PrimaryButton variant="outline" className="py-2" onClick={() => app.updateBookingStatus(visit.id, 'Confirmed')}>Confirm</PrimaryButton><PrimaryButton variant="green" className="py-2" onClick={() => app.updateBookingStatus(visit.id, 'Closed')}>Close</PrimaryButton></div></td>
//                   </tr>
//                 ))}
//               </tbody>
//             </table>
//             {siteVisits.length === 0 && <p className="rounded-2xl bg-slate-50 p-4 text-sm font-bold text-slate-500">No site visits booked yet.</p>}
//           </div>
//         </SectionCard>

//         <SectionCard title="Property Reservations" subtitle="Reservation requests from Customer → Book Property">
//           <div className="table-wrap">
//             <table className="min-w-[900px] w-full text-left">
//               <thead><tr className="border-b border-slate-200 text-xs font-black uppercase tracking-wider text-slate-500"><th className="py-4 pr-4">Booking ID</th><th className="py-4 pr-4">Customer</th><th className="py-4 pr-4">Property</th><th className="py-4 pr-4">Venture</th><th className="py-4 pr-4">Amount</th><th className="py-4 pr-4">Paid</th><th className="py-4 pr-4">Status</th><th className="py-4 pr-4">Actions</th></tr></thead>
//               <tbody>
//                 {reservations.map((booking) => (
//                   <tr key={booking.id} className="border-b border-slate-100 text-sm font-bold text-slate-700">
//                     <td className="py-4 pr-4 font-black text-[#0B3D91]">{booking.id}</td><td className="py-4 pr-4">{booking.customer}</td><td className="py-4 pr-4">{booking.property}</td><td className="py-4 pr-4">{booking.venture}</td><td className="py-4 pr-4">{formatCurrency(booking.amount)}</td><td className="py-4 pr-4">{formatCurrency(booking.paid)}</td><td className="py-4 pr-4"><StatusBadge status={booking.status} /></td>
//                     <td className="py-4 pr-4"><div className="flex gap-2"><PrimaryButton variant="outline" className="py-2" onClick={() => app.updateBookingStatus(booking.id, 'Payment Due')}>Payment Due</PrimaryButton><PrimaryButton variant="green" className="py-2" onClick={() => app.updateBookingStatus(booking.id, 'Confirmed')}>Approve</PrimaryButton></div></td>
//                   </tr>
//                 ))}
//               </tbody>
//             </table>
//           </div>
//         </SectionCard>
//       </div>
//     </div>
//   );
// }





import { useEffect, useMemo, useState } from 'react';
import PageHeader from '../../components/ui/PageHeader.js';
import SectionCard from '../../components/ui/SectionCard.js';
import PrimaryButton from '../../components/ui/PrimaryButton.js';
import StatusBadge from '../../components/ui/StatusBadge.js';
import { formatCurrency } from '../../utils/formatters.js';
import { useAuth } from '../../context/AuthContext.js';
import { bookingApi } from '../../services/api.js';

export default function Bookings() {
  const { user } = useAuth();

  const [bookings, setBookings] = useState([]);
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [updatingId, setUpdatingId] = useState(null);

  const loadBookings = async () => {
    try {
      setLoading(true);
      setMessage('');

      const res = await bookingApi.getAll();
      setBookings(res.data || []);
    } catch (error) {
      console.error(error);
      setMessage('Unable to load bookings from backend.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadBookings();
  }, []);

  const reservations = useMemo(
    () => bookings.filter((booking) => booking.type !== 'Site Visit'),
    [bookings]
  );

  const siteVisits = useMemo(
    () => bookings.filter((booking) => booking.type === 'Site Visit'),
    [bookings]
  );

  const updateSiteVisitStatus = async (visit, status) => {
    try {
      setUpdatingId(`visit-${visit.id}-${status}`);
      setMessage('');

      await bookingApi.updateSiteVisitStatus(visit.id, status);

      setBookings((old) =>
        old.map((item) =>
          item.type === 'Site Visit' && item.id === visit.id
            ? { ...item, status }
            : item
        )
      );

      setMessage(`Site visit ${status.toLowerCase()} successfully.`);
    } catch (error) {
      console.error(error);
      setMessage(
        error?.response?.data?.message ||
          `Unable to update site visit status to ${status}.`
      );
    } finally {
      setUpdatingId(null);
    }
  };

  const updateReservationStatus = async (booking, status) => {
    try {
      setUpdatingId(`booking-${booking.id}-${status}`);
      setMessage('');

      await bookingApi.updateReservationStatus(booking.id, status);

      setBookings((old) =>
        old.map((item) =>
          item.type !== 'Site Visit' && item.id === booking.id
            ? { ...item, status }
            : item
        )
      );

      setMessage(`Property reservation status updated to ${status}.`);
    } catch (error) {
      console.error(error);
      setMessage(
        error?.response?.data?.message ||
          `Unable to update reservation status to ${status}.`
      );
    } finally {
      setUpdatingId(null);
    }
  };

  return (
    <div>
      <PageHeader
        title="Bookings & Site Visits"
        subtitle="Customer reservations and demo/site visit bookings submitted from the customer website. Managing Director, Operational Head, and Sales Manager can monitor these instantly."
      />

      {message && (
        <div className="mb-5 rounded-2xl border border-slate-200 bg-white p-4 text-sm font-bold text-slate-700 shadow-sm">
          {message}
        </div>
      )}

      {loading && (
        <div className="mb-5 rounded-2xl border border-slate-200 bg-white p-4 text-sm font-bold text-slate-500 shadow-sm">
          Loading bookings...
        </div>
      )}

      <div className="grid gap-6 xl:grid-cols-2">
        <SectionCard
          title="Customer Site Visits"
          subtitle="Demo bookings from Customer → Book Site Visit"
        >
          <div className="table-wrap">
            <table className="min-w-[860px] w-full text-left">
              <thead>
                <tr className="border-b border-slate-200 text-xs font-black uppercase tracking-wider text-slate-500">
                  <th className="py-4 pr-4">Visit ID</th>
                  <th className="py-4 pr-4">Customer</th>
                  <th className="py-4 pr-4">Phone</th>
                  <th className="py-4 pr-4">Venture</th>
                  <th className="py-4 pr-4">Date / Slot</th>
                  <th className="py-4 pr-4">Status</th>
                  <th className="py-4 pr-4">Actions</th>
                </tr>
              </thead>

              <tbody>
                {siteVisits.map((visit) => (
                  <tr
                    key={`visit-${visit.id}`}
                    className="border-b border-slate-100 text-sm font-bold text-slate-700"
                  >
                    <td className="py-4 pr-4 font-black text-[#0B3D91]">
                      {visit.code || visit.visitCode || visit.id}
                    </td>

                    <td className="py-4 pr-4">{visit.customer}</td>

                    <td className="py-4 pr-4">{visit.phone}</td>

                    <td className="py-4 pr-4">{visit.venture}</td>

                    <td className="py-4 pr-4">
                      {visit.date || '-'} {visit.timeSlot || ''}
                    </td>

                    <td className="py-4 pr-4">
                      <StatusBadge status={visit.status} />
                    </td>

                    <td className="py-4 pr-4">
                      <div className="flex gap-2">
                        <PrimaryButton
                          variant="outline"
                          className="py-2"
                          disabled={updatingId === `visit-${visit.id}-Confirmed`}
                          onClick={() =>
                            updateSiteVisitStatus(visit, 'Confirmed')
                          }
                        >
                          {updatingId === `visit-${visit.id}-Confirmed`
                            ? 'Confirming...'
                            : 'Confirm'}
                        </PrimaryButton>

                        <PrimaryButton
                          variant="green"
                          className="py-2"
                          disabled={updatingId === `visit-${visit.id}-Closed`}
                          onClick={() => updateSiteVisitStatus(visit, 'Closed')}
                        >
                          {updatingId === `visit-${visit.id}-Closed`
                            ? 'Closing...'
                            : 'Close'}
                        </PrimaryButton>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            {siteVisits.length === 0 && !loading && (
              <p className="rounded-2xl bg-slate-50 p-4 text-sm font-bold text-slate-500">
                No site visits booked yet.
              </p>
            )}
          </div>
        </SectionCard>

        <SectionCard
          title="Property Reservations"
          subtitle="Reservation requests from Customer → Book Property"
        >
          <div className="table-wrap">
            <table className="min-w-[900px] w-full text-left">
              <thead>
                <tr className="border-b border-slate-200 text-xs font-black uppercase tracking-wider text-slate-500">
                  <th className="py-4 pr-4">Booking ID</th>
                  <th className="py-4 pr-4">Customer</th>
                  <th className="py-4 pr-4">Property</th>
                  <th className="py-4 pr-4">Venture</th>
                  <th className="py-4 pr-4">Amount</th>
                  <th className="py-4 pr-4">Paid</th>
                  <th className="py-4 pr-4">Status</th>
                  <th className="py-4 pr-4">Actions</th>
                </tr>
              </thead>

              <tbody>
                {reservations.map((booking) => (
                  <tr
                    key={`booking-${booking.id}`}
                    className="border-b border-slate-100 text-sm font-bold text-slate-700"
                  >
                    <td className="py-4 pr-4 font-black text-[#0B3D91]">
                      {booking.code || booking.bookingCode || booking.id}
                    </td>

                    <td className="py-4 pr-4">{booking.customer}</td>

                    <td className="py-4 pr-4">{booking.property}</td>

                    <td className="py-4 pr-4">{booking.venture}</td>

                    <td className="py-4 pr-4">
                      {formatCurrency(booking.amount || 0)}
                    </td>

                    <td className="py-4 pr-4">
                      {formatCurrency(booking.paid || 0)}
                    </td>

                    <td className="py-4 pr-4">
                      <StatusBadge status={booking.status} />
                    </td>

                    <td className="py-4 pr-4">
                      <div className="flex gap-2">
                        <PrimaryButton
                          variant="outline"
                          className="py-2"
                          disabled={
                            updatingId === `booking-${booking.id}-Payment Due`
                          }
                          onClick={() =>
                            updateReservationStatus(booking, 'Payment Due')
                          }
                        >
                          {updatingId === `booking-${booking.id}-Payment Due`
                            ? 'Updating...'
                            : 'Payment Due'}
                        </PrimaryButton>

                        <PrimaryButton
                          variant="green"
                          className="py-2"
                          disabled={
                            updatingId === `booking-${booking.id}-Confirmed`
                          }
                          onClick={() =>
                            updateReservationStatus(booking, 'Confirmed')
                          }
                        >
                          {updatingId === `booking-${booking.id}-Confirmed`
                            ? 'Approving...'
                            : 'Approve'}
                        </PrimaryButton>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            {reservations.length === 0 && !loading && (
              <p className="rounded-2xl bg-slate-50 p-4 text-sm font-bold text-slate-500">
                No property reservations found.
              </p>
            )}
          </div>
        </SectionCard>
      </div>
    </div>
  );
}