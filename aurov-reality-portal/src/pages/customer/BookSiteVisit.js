// import { useMemo, useState } from 'react';
// import { useSearchParams } from 'react-router-dom';
// import PrimaryButton from '../../components/ui/PrimaryButton.js';
// import { useAppData } from '../../context/AppDataContext.js';

// export default function BookSiteVisit() {
//   const { ventures, properties, createCustomerLead } = useAppData();
//   const [params] = useSearchParams();
//   const preProperty = params.get('propertyId') || '';
//   const preVenture = params.get('ventureId') || properties.find((item) => item.id === preProperty)?.ventureId || ventures[0]?.id || '';
//   const [form, setForm] = useState({ name: '', phone: '', email: '', ventureId: preVenture, propertyId: preProperty, date: '', timeSlot: '09:00 AM - 10:00 AM' });
//   const [done, setDone] = useState(null);

//   const ventureProperties = useMemo(() => properties.filter((property) => property.ventureId === form.ventureId), [properties, form.ventureId]);

//   const submit = (event) => {
//     event.preventDefault();
//     if (!form.name.trim() || !form.phone.trim() || !form.ventureId || !form.date) return;
//     const result = createCustomerLead(form, 'Demo Visit');
//     setDone(result.booking);
//     setForm({ name: '', phone: '', email: '', ventureId: preVenture, propertyId: preProperty, date: '', timeSlot: '09:00 AM - 10:00 AM' });
//   };

//   return (
//     <main className="mx-auto max-w-[960px] px-4 py-16 lg:px-8">
//       <div className="rounded-[36px] border border-slate-200 bg-white p-6 shadow-xl shadow-slate-900/8 sm:p-8">
//         <p className="text-sm font-black uppercase tracking-[0.22em] text-[#0B7A8F]">Book Site Visit</p>
//         <h1 className="mt-3 text-4xl font-black text-slate-900">Schedule your property visit</h1>
//         <p className="mt-3 text-sm font-semibold leading-6 text-slate-500">This creates a demo visit lead in Managing Director, Operational Head, and Sales Manager dashboards.</p>
//         {done && <div className="mt-5 rounded-3xl border border-emerald-200 bg-emerald-50 p-4 text-sm font-bold text-emerald-700">Site visit created successfully: {done.id}. It is now visible in MD/OH/Sales Manager → Bookings & Dashboard.</div>}
//         <form onSubmit={submit} className="mt-8 grid gap-5 sm:grid-cols-2">
//           <label className="block"><span className="mb-2 block text-sm font-extrabold text-slate-700">Full Name</span><input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} className="w-full rounded-2xl border border-slate-200 px-4 py-3 text-sm font-bold outline-none focus:border-[#1E5EFF]" placeholder="Customer name" /></label>
//           <label className="block"><span className="mb-2 block text-sm font-extrabold text-slate-700">Phone</span><input value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} className="w-full rounded-2xl border border-slate-200 px-4 py-3 text-sm font-bold outline-none focus:border-[#1E5EFF]" placeholder="+91" /></label>
//           <label className="block sm:col-span-2"><span className="mb-2 block text-sm font-extrabold text-slate-700">Email</span><input value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} className="w-full rounded-2xl border border-slate-200 px-4 py-3 text-sm font-bold outline-none focus:border-[#1E5EFF]" placeholder="email@example.com" /></label>
//           <label className="block sm:col-span-2"><span className="mb-2 block text-sm font-extrabold text-slate-700">Venture</span><select value={form.ventureId} onChange={(e) => setForm({ ...form, ventureId: e.target.value, propertyId: '' })} className="w-full rounded-2xl border border-slate-200 px-4 py-3 text-sm font-bold outline-none focus:border-[#1E5EFF]">{ventures.map((venture) => <option key={venture.id} value={venture.id}>{venture.name}</option>)}</select></label>
//           <label className="block sm:col-span-2"><span className="mb-2 block text-sm font-extrabold text-slate-700">Property / Unit</span><select value={form.propertyId} onChange={(e) => setForm({ ...form, propertyId: e.target.value })} className="w-full rounded-2xl border border-slate-200 px-4 py-3 text-sm font-bold outline-none focus:border-[#1E5EFF]"><option value="">General venture visit</option>{ventureProperties.map((property) => <option key={property.id} value={property.id}>{property.type} {property.number} - {property.area}</option>)}</select></label>
//           <label className="block"><span className="mb-2 block text-sm font-extrabold text-slate-700">Date</span><input type="date" value={form.date} onChange={(e) => setForm({ ...form, date: e.target.value })} className="w-full rounded-2xl border border-slate-200 px-4 py-3 text-sm font-bold outline-none focus:border-[#1E5EFF]" /></label>
//           <label className="block"><span className="mb-2 block text-sm font-extrabold text-slate-700">Time Slot</span><select value={form.timeSlot} onChange={(e) => setForm({ ...form, timeSlot: e.target.value })} className="w-full rounded-2xl border border-slate-200 px-4 py-3 text-sm font-bold outline-none focus:border-[#1E5EFF]"><option>09:00 AM - 10:00 AM</option><option>11:00 AM - 12:00 PM</option><option>03:00 PM - 04:00 PM</option><option>05:00 PM - 06:00 PM</option></select></label>
//           <PrimaryButton type="submit" variant="green" className="sm:col-span-2">Confirm Site Visit</PrimaryButton>
//         </form>
//       </div>
//     </main>
//   );
// }





import { useEffect, useMemo, useState } from 'react';
import { useSearchParams } from 'react-router-dom';

import PrimaryButton from '../../components/ui/PrimaryButton.js';
import { customerSiteVisitApi } from '../../services/api.js';

export default function BookSiteVisit() {
  const [params] = useSearchParams();

  const preProperty = params.get('propertyId') || '';
  const preVentureParam = params.get('ventureId') || '';

  const [ventures, setVentures] = useState([]);
  const [properties, setProperties] = useState([]);

  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  const [error, setError] = useState('');
  const [done, setDone] = useState(null);

  const [form, setForm] = useState({
    name: '',
    phone: '',
    email: '',
    ventureId: '',
    propertyId: '',
    date: '',
    timeSlot: '09:00 AM - 10:00 AM',
  });

  const loadOptions = async () => {
    try {
      setLoading(true);
      setError('');

      const data = await customerSiteVisitApi.getOptions();

      const loadedVentures = data.ventures || [];
      const loadedProperties = data.properties || [];

      setVentures(loadedVentures);
      setProperties(loadedProperties);

      const selectedProperty = loadedProperties.find(
        (item) => String(item.id) === String(preProperty)
      );

      const selectedVentureId =
        preVentureParam ||
        selectedProperty?.ventureId ||
        loadedVentures[0]?.id ||
        '';

      setForm((old) => ({
        ...old,
        ventureId: String(selectedVentureId || ''),
        propertyId: String(preProperty || ''),
      }));
    } catch (err) {
      setError(err.message || 'Unable to load site visit options');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadOptions();
  }, []);

  const ventureProperties = useMemo(
    () =>
      properties.filter(
        (property) => String(property.ventureId) === String(form.ventureId)
      ),
    [properties, form.ventureId]
  );

  const submit = async (event) => {
    event.preventDefault();

    if (
      !form.name.trim() ||
      !form.phone.trim() ||
      !form.ventureId ||
      !form.date
    ) {
      setError('Please fill name, phone, venture, and date');
      return;
    }

    try {
      setSubmitting(true);
      setError('');
      setDone(null);

      const result = await customerSiteVisitApi.create({
        name: form.name.trim(),
        phone: form.phone.trim(),
        email: form.email.trim(),
        ventureId: Number(form.ventureId),
        propertyId: form.propertyId ? Number(form.propertyId) : null,
        date: form.date,
        timeSlot: form.timeSlot,
      });

      setDone(result);

      setForm({
        name: '',
        phone: '',
        email: '',
        ventureId: String(form.ventureId || ''),
        propertyId: '',
        date: '',
        timeSlot: '09:00 AM - 10:00 AM',
      });
    } catch (err) {
      setError(err.message || 'Unable to create site visit');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <main className="mx-auto max-w-[960px] px-4 py-16 lg:px-8">
      <div className="rounded-[36px] border border-slate-200 bg-white p-6 shadow-xl shadow-slate-900/8 sm:p-8">
        <p className="text-sm font-black uppercase tracking-[0.22em] text-[#0B7A8F]">
          Book Site Visit
        </p>

        <h1 className="mt-3 text-4xl font-black text-slate-900">
          Schedule your property visit
        </h1>

        <p className="mt-3 text-sm font-semibold leading-6 text-slate-500">
          This creates a demo visit record in the backend database and it can be
          shown in Managing Director, Operational Head, and Sales Manager dashboards.
        </p>

        {loading && (
          <div className="mt-5 rounded-3xl border border-slate-200 bg-slate-50 p-4 text-sm font-bold text-slate-600">
            Loading ventures and properties...
          </div>
        )}

        {error && (
          <div className="mt-5 rounded-3xl border border-red-200 bg-red-50 p-4 text-sm font-bold text-red-700">
            {error}
          </div>
        )}

        {done && (
          <div className="mt-5 rounded-3xl border border-emerald-200 bg-emerald-50 p-4 text-sm font-bold text-emerald-700">
            Site visit created successfully: {done.id}. It is now visible in
            MD/OH/Sales Manager → Bookings & Dashboard.
          </div>
        )}

        <form onSubmit={submit} className="mt-8 grid gap-5 sm:grid-cols-2">
          <label className="block">
            <span className="mb-2 block text-sm font-extrabold text-slate-700">
              Full Name
            </span>

            <input
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              className="w-full rounded-2xl border border-slate-200 px-4 py-3 text-sm font-bold outline-none focus:border-[#1E5EFF]"
              placeholder="Customer name"
            />
          </label>

          <label className="block">
            <span className="mb-2 block text-sm font-extrabold text-slate-700">
              Phone
            </span>

            <input
              value={form.phone}
              onChange={(e) => setForm({ ...form, phone: e.target.value })}
              className="w-full rounded-2xl border border-slate-200 px-4 py-3 text-sm font-bold outline-none focus:border-[#1E5EFF]"
              placeholder="+91"
            />
          </label>

          <label className="block sm:col-span-2">
            <span className="mb-2 block text-sm font-extrabold text-slate-700">
              Email
            </span>

            <input
              value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
              className="w-full rounded-2xl border border-slate-200 px-4 py-3 text-sm font-bold outline-none focus:border-[#1E5EFF]"
              placeholder="email@example.com"
            />
          </label>

          <label className="block sm:col-span-2">
            <span className="mb-2 block text-sm font-extrabold text-slate-700">
              Venture
            </span>

            <select
              value={form.ventureId}
              onChange={(e) =>
                setForm({
                  ...form,
                  ventureId: e.target.value,
                  propertyId: '',
                })
              }
              className="w-full rounded-2xl border border-slate-200 px-4 py-3 text-sm font-bold outline-none focus:border-[#1E5EFF]"
            >
              {ventures.length === 0 && (
                <option value="">No ventures available</option>
              )}

              {ventures.map((venture) => (
                <option key={venture.id} value={venture.id}>
                  {venture.name}
                </option>
              ))}
            </select>
          </label>

          <label className="block sm:col-span-2">
            <span className="mb-2 block text-sm font-extrabold text-slate-700">
              Property / Unit
            </span>

            <select
              value={form.propertyId}
              onChange={(e) =>
                setForm({ ...form, propertyId: e.target.value })
              }
              className="w-full rounded-2xl border border-slate-200 px-4 py-3 text-sm font-bold outline-none focus:border-[#1E5EFF]"
            >
              <option value="">General venture visit</option>

              {ventureProperties.map((property) => (
                <option key={property.id} value={property.id}>
                  {property.type} {property.number} - {property.area}
                </option>
              ))}
            </select>
          </label>

          <label className="block">
            <span className="mb-2 block text-sm font-extrabold text-slate-700">
              Date
            </span>

            <input
              type="date"
              value={form.date}
              onChange={(e) => setForm({ ...form, date: e.target.value })}
              className="w-full rounded-2xl border border-slate-200 px-4 py-3 text-sm font-bold outline-none focus:border-[#1E5EFF]"
            />
          </label>

          <label className="block">
            <span className="mb-2 block text-sm font-extrabold text-slate-700">
              Time Slot
            </span>

            <select
              value={form.timeSlot}
              onChange={(e) =>
                setForm({ ...form, timeSlot: e.target.value })
              }
              className="w-full rounded-2xl border border-slate-200 px-4 py-3 text-sm font-bold outline-none focus:border-[#1E5EFF]"
            >
              <option>09:00 AM - 10:00 AM</option>
              <option>11:00 AM - 12:00 PM</option>
              <option>03:00 PM - 04:00 PM</option>
              <option>05:00 PM - 06:00 PM</option>
            </select>
          </label>

          <PrimaryButton
            type="submit"
            variant="green"
            className="sm:col-span-2"
            disabled={loading || submitting}
          >
            {submitting ? 'Creating Site Visit...' : 'Confirm Site Visit'}
          </PrimaryButton>
        </form>
      </div>
    </main>
  );
}