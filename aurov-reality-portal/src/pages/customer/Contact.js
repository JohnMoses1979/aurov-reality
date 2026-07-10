// import { useMemo, useState } from 'react';
// import { useSearchParams } from 'react-router-dom';
// import { FiMail, FiMapPin, FiPhone } from 'react-icons/fi';
// import PrimaryButton from '../../components/ui/PrimaryButton.js';
// import { useAppData } from '../../context/AppDataContext.js';

// export default function Contact() {
//   const { createCustomerLead, ventures } = useAppData();
//   const [params] = useSearchParams();
//   const selectedVenture = params.get('ventureId') || ventures[0]?.id || '';
//   const selectedProperty = params.get('propertyId') || '';
//   const leadType = params.get('type') === 'enquiry' ? 'Enquiry' : 'Contact Request';
//   const [form, setForm] = useState({ name: '', phone: '', email: '', ventureId: selectedVenture, propertyId: selectedProperty, message: '' });
//   const [done, setDone] = useState(false);
//   const venture = useMemo(() => ventures.find((item) => item.id === form.ventureId), [ventures, form.ventureId]);

//   const submit = (event) => {
//     event.preventDefault();
//     if (!form.name.trim() || !form.phone.trim() || !form.message.trim()) return;
//     createCustomerLead({ ...form, venture: venture?.name }, leadType);
//     setDone(true);
//     setForm({ name: '', phone: '', email: '', ventureId: selectedVenture, propertyId: selectedProperty, message: '' });
//   };

//   return (
//     <main className="mx-auto max-w-[1200px] px-4 py-16 lg:px-8">
//       <div className="grid gap-10 lg:grid-cols-[0.8fr_1.2fr]">
//         <div>
//           <p className="text-sm font-black uppercase tracking-[0.22em] text-[#0B7A8F]">Contact Us</p><h1 className="mt-3 text-4xl font-black text-slate-900">Talk to Aurov Reality</h1><p className="mt-4 text-sm font-semibold leading-6 text-slate-500">Contact requests and enquiries automatically become new leads in MD/OH/Sales Manager dashboards.</p>
//           <div className="mt-8 space-y-4"><p className="flex items-center gap-3 font-bold text-slate-700"><FiPhone className="text-[#0B3D91]" /> +91 90000 00000</p><p className="flex items-center gap-3 font-bold text-slate-700"><FiMail className="text-[#0B3D91]" /> info@aurov.in</p><p className="flex items-center gap-3 font-bold text-slate-700"><FiMapPin className="text-[#0B3D91]" /> Hyderabad, Telangana</p></div>
//         </div>
//         <form onSubmit={submit} className="rounded-[36px] border border-slate-200 bg-white p-6 shadow-xl shadow-slate-900/8 sm:p-8">
//           {done && <div className="mb-5 rounded-3xl border border-emerald-200 bg-emerald-50 p-4 text-sm font-bold text-emerald-700">Request submitted successfully. It is now visible as a new lead in Managing Director, Operational Head, and Sales Manager dashboards.</div>}
//           <div className="grid gap-5 sm:grid-cols-2">
//             <label className="block"><span className="mb-2 block text-sm font-extrabold text-slate-700">Name</span><input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} className="w-full rounded-2xl border border-slate-200 px-4 py-3 text-sm font-bold outline-none focus:border-[#1E5EFF]" /></label>
//             <label className="block"><span className="mb-2 block text-sm font-extrabold text-slate-700">Phone</span><input value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} className="w-full rounded-2xl border border-slate-200 px-4 py-3 text-sm font-bold outline-none focus:border-[#1E5EFF]" /></label>
//             <label className="block sm:col-span-2"><span className="mb-2 block text-sm font-extrabold text-slate-700">Email</span><input value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} className="w-full rounded-2xl border border-slate-200 px-4 py-3 text-sm font-bold outline-none focus:border-[#1E5EFF]" /></label>
//             <label className="block sm:col-span-2"><span className="mb-2 block text-sm font-extrabold text-slate-700">Interested Venture</span><select value={form.ventureId} onChange={(e) => setForm({ ...form, ventureId: e.target.value })} className="w-full rounded-2xl border border-slate-200 px-4 py-3 text-sm font-bold outline-none focus:border-[#1E5EFF]"><option value="">General enquiry</option>{ventures.map((venture) => <option key={venture.id} value={venture.id}>{venture.name}</option>)}</select></label>
//             <label className="block sm:col-span-2"><span className="mb-2 block text-sm font-extrabold text-slate-700">Message</span><textarea value={form.message} onChange={(e) => setForm({ ...form, message: e.target.value })} rows="6" className="w-full rounded-2xl border border-slate-200 px-4 py-3 text-sm font-bold outline-none focus:border-[#1E5EFF]" /></label>
//           </div>
//           <PrimaryButton type="submit" variant="green" className="mt-5 w-full">Submit Request</PrimaryButton>
//         </form>
//       </div>
//     </main>
//   );
// }




import { useEffect, useMemo, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { FiMail, FiMapPin, FiPhone } from 'react-icons/fi';

import PrimaryButton from '../../components/ui/PrimaryButton.js';
import { customerContactApi } from '../../services/api.js';

export default function Contact() {
  const [params] = useSearchParams();

  const selectedVenture = params.get('ventureId') || '';
  const selectedProperty = params.get('propertyId') || '';
  const leadType =
    params.get('type') === 'enquiry' ? 'Enquiry' : 'Contact Request';

  const [ventures, setVentures] = useState([]);
  const [form, setForm] = useState({
    name: '',
    phone: '',
    email: '',
    ventureId: selectedVenture,
    propertyId: selectedProperty,
    message: '',
  });

  const [done, setDone] = useState(false);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  const venture = useMemo(
    () =>
      ventures.find((item) => String(item.id) === String(form.ventureId)),
    [ventures, form.ventureId]
  );

  const loadOptions = async () => {
    try {
      setLoading(true);
      setError('');

      const data = await customerContactApi.getOptions();
      const loadedVentures = data.ventures || [];

      setVentures(loadedVentures);

      setForm((old) => ({
        ...old,
        ventureId:
          selectedVenture ||
          loadedVentures[0]?.id?.toString() ||
          '',
      }));
    } catch (err) {
      setError(err.message || 'Unable to load contact options');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadOptions();
  }, []);

  const submit = async (event) => {
    event.preventDefault();

    if (!form.name.trim() || !form.phone.trim() || !form.message.trim()) {
      setError('Please enter name, phone, and message');
      return;
    }

    try {
      setSubmitting(true);
      setError('');
      setDone(false);

      await customerContactApi.submit({
        name: form.name.trim(),
        phone: form.phone.trim(),
        email: form.email.trim(),
        ventureId: form.ventureId ? Number(form.ventureId) : null,
        propertyId: form.propertyId ? Number(form.propertyId) : null,
        message: form.message.trim(),
        leadType,
      });

      setDone(true);

      setForm({
        name: '',
        phone: '',
        email: '',
        ventureId: selectedVenture || venture?.id?.toString() || '',
        propertyId: selectedProperty || '',
        message: '',
      });
    } catch (err) {
      setError(err.message || 'Unable to submit request');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <main className="mx-auto max-w-[1200px] px-4 py-16 lg:px-8">
      <div className="grid gap-10 lg:grid-cols-[0.8fr_1.2fr]">
        <div>
          <p className="text-sm font-black uppercase tracking-[0.22em] text-[#0B7A8F]">
            Contact Us
          </p>

          <h1 className="mt-3 text-4xl font-black text-slate-900">
            Talk to Aurov Reality
          </h1>

          <p className="mt-4 text-sm font-semibold leading-6 text-slate-500">
            Contact requests and enquiries automatically become new leads in
            MD/OH/Sales Manager dashboards.
          </p>

          <div className="mt-8 space-y-4">
            <p className="flex items-center gap-3 font-bold text-slate-700">
              <FiPhone className="text-[#0B3D91]" /> +91 90000 00000
            </p>

            <p className="flex items-center gap-3 font-bold text-slate-700">
              <FiMail className="text-[#0B3D91]" /> info@aurov.in
            </p>

            <p className="flex items-center gap-3 font-bold text-slate-700">
              <FiMapPin className="text-[#0B3D91]" /> Hyderabad, Telangana
            </p>
          </div>
        </div>

        <form
          onSubmit={submit}
          className="rounded-[36px] border border-slate-200 bg-white p-6 shadow-xl shadow-slate-900/8 sm:p-8"
        >
          {loading && (
            <div className="mb-5 rounded-3xl border border-slate-200 bg-slate-50 p-4 text-sm font-bold text-slate-600">
              Loading ventures...
            </div>
          )}

          {error && (
            <div className="mb-5 rounded-3xl border border-red-200 bg-red-50 p-4 text-sm font-bold text-red-700">
              {error}
            </div>
          )}

          {done && (
            <div className="mb-5 rounded-3xl border border-emerald-200 bg-emerald-50 p-4 text-sm font-bold text-emerald-700">
              Request submitted successfully. It is now visible as a new lead in
              Managing Director, Operational Head, and Sales Manager dashboards.
            </div>
          )}

          <div className="grid gap-5 sm:grid-cols-2">
            <label className="block">
              <span className="mb-2 block text-sm font-extrabold text-slate-700">
                Name
              </span>

              <input
                value={form.name}
                onChange={(event) =>
                  setForm({ ...form, name: event.target.value })
                }
                className="w-full rounded-2xl border border-slate-200 px-4 py-3 text-sm font-bold outline-none focus:border-[#1E5EFF]"
              />
            </label>

            <label className="block">
              <span className="mb-2 block text-sm font-extrabold text-slate-700">
                Phone
              </span>

              <input
                value={form.phone}
                onChange={(event) =>
                  setForm({ ...form, phone: event.target.value })
                }
                className="w-full rounded-2xl border border-slate-200 px-4 py-3 text-sm font-bold outline-none focus:border-[#1E5EFF]"
              />
            </label>

            <label className="block sm:col-span-2">
              <span className="mb-2 block text-sm font-extrabold text-slate-700">
                Email
              </span>

              <input
                value={form.email}
                onChange={(event) =>
                  setForm({ ...form, email: event.target.value })
                }
                className="w-full rounded-2xl border border-slate-200 px-4 py-3 text-sm font-bold outline-none focus:border-[#1E5EFF]"
              />
            </label>

            <label className="block sm:col-span-2">
              <span className="mb-2 block text-sm font-extrabold text-slate-700">
                Interested Venture
              </span>

              <select
                value={form.ventureId}
                onChange={(event) =>
                  setForm({ ...form, ventureId: event.target.value })
                }
                className="w-full rounded-2xl border border-slate-200 px-4 py-3 text-sm font-bold outline-none focus:border-[#1E5EFF]"
              >
                <option value="">General enquiry</option>

                {ventures.map((venture) => (
                  <option key={venture.id} value={venture.id}>
                    {venture.name}
                  </option>
                ))}
              </select>
            </label>

            <label className="block sm:col-span-2">
              <span className="mb-2 block text-sm font-extrabold text-slate-700">
                Message
              </span>

              <textarea
                value={form.message}
                onChange={(event) =>
                  setForm({ ...form, message: event.target.value })
                }
                rows="6"
                className="w-full rounded-2xl border border-slate-200 px-4 py-3 text-sm font-bold outline-none focus:border-[#1E5EFF]"
              />
            </label>
          </div>

          <PrimaryButton
            type="submit"
            variant="green"
            className="mt-5 w-full"
            disabled={loading || submitting}
          >
            {submitting ? 'Submitting...' : 'Submit Request'}
          </PrimaryButton>
        </form>
      </div>
    </main>
  );
}