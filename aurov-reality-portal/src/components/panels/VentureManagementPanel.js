import { useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { FiEdit, FiEye, FiGrid, FiImage } from 'react-icons/fi';
import PageHeader from '../ui/PageHeader.js';
import PrimaryButton from '../ui/PrimaryButton.js';
import MetricPill from '../ui/MetricPill.js';
import { compactCurrency } from '../../utils/formatters.js';
import { useAppData } from '../../context/AppDataContext.js';
import { useAuth } from '../../context/AuthContext.js';
import { isSuperRole } from '../../constants/roles.js';

const initial = {
  name: '',
  location: '',
  type: 'Plots + Villas',
  description: '',
  amenities: 'Gated community, Clubhouse, Garden, Internal roads, 24/7 security',
  image: '',
  images: [],
};

export default function Ventures() {
  const { user } = useAuth();
  const app = useAppData();
  const { ventures, addVenture, updateVenture } = app;
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState(initial);
  const [editingId, setEditingId] = useState(null);
  const [message, setMessage] = useState('');
  const imageInputRef = useRef(null);

  const reset = () => {
    setForm(initial);
    setEditingId(null);
    setOpen(false);
    setMessage('');
    if (imageInputRef.current) imageInputRef.current.value = '';
  };

  const handleImage = async (event) => {
    const file = event.target.files?.[0];
    event.target.value = '';
    if (!file) return;
    if (!/image\/(jpeg|png|webp)/i.test(file.type) && !/\.(jpe?g|png|webp)$/i.test(file.name)) {
      setMessage('Please select JPG, JPEG, PNG, or WEBP image file.');
      return;
    }
    const imageData = await app.fileToData(file);
    setForm((old) => ({ ...old, image: imageData.dataUrl, images: [imageData.dataUrl] }));
    setMessage('Image uploaded successfully and will be stored as Base64 for the frontend simulation.');
  };

  const startEdit = (venture) => {
    setEditingId(venture.id);
    setForm({
      name: venture.name || '',
      location: venture.location || '',
      type: venture.type || 'Plots + Villas',
      description: venture.description || '',
      amenities: Array.isArray(venture.amenities) ? venture.amenities.join(', ') : venture.amenities || '',
      image: venture.image || '',
      images: venture.images || (venture.image ? [venture.image] : []),
    });
    setOpen(true);
    setMessage('Editing venture. Upload a new image to replace the existing one.');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const submit = (event) => {
    event.preventDefault();
    if (!form.name.trim() || !form.location.trim() || !form.description.trim() || !form.amenities.trim()) {
      setMessage('Please enter venture name, location, description, and amenities.');
      return;
    }
    if (!form.image) {
      setMessage('Please upload a venture image.');
      return;
    }
    if (editingId) {
      updateVenture(editingId, form);
      setMessage('Venture updated. Customer portal and venture details page updated instantly.');
      reset();
      return;
    }
    addVenture(form, user?.role);
    setForm(initial);
    setOpen(false);
    setMessage('Venture created. It is now visible in Venture Management, Customer Portal, and Venture Details.');
  };

  return (
    <div>
      <PageHeader
        title="Venture Management"
        subtitle="Create ventures with local image upload. All customer screens read the same Local Storage data instantly."
        action={isSuperRole(user?.role) && <PrimaryButton variant="green" onClick={() => setOpen((value) => !value)}>{open ? 'Close Form' : '+ Add Venture'}</PrimaryButton>}
      />

      {message && <div className="mb-5 rounded-2xl border border-slate-200 bg-white p-4 text-sm font-bold text-slate-700 shadow-sm">{message}</div>}

      {open && (
        <form onSubmit={submit} className="mb-6 rounded-[30px] border border-slate-200 bg-white p-5 shadow-sm">
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
            <label className="block"><span className="mb-2 block text-sm font-extrabold text-slate-700">Venture Name</span><input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} className="w-full rounded-2xl border border-slate-200 px-4 py-3 text-sm font-bold outline-none focus:border-[#1E5EFF]" placeholder="Aurov New City" /></label>
            <label className="block"><span className="mb-2 block text-sm font-extrabold text-slate-700">Location</span><input value={form.location} onChange={(e) => setForm({ ...form, location: e.target.value })} className="w-full rounded-2xl border border-slate-200 px-4 py-3 text-sm font-bold outline-none focus:border-[#1E5EFF]" placeholder="Hyderabad" /></label>
            <label className="block"><span className="mb-2 block text-sm font-extrabold text-slate-700">Venture Type</span><select value={form.type} onChange={(e) => setForm({ ...form, type: e.target.value })} className="w-full rounded-2xl border border-slate-200 px-4 py-3 text-sm font-bold outline-none focus:border-[#1E5EFF]"><option>Plots + Villas</option><option>Open Plots</option><option>Premium Villas</option><option>Flats</option></select></label>
            <div className="block"><span className="mb-2 block text-sm font-extrabold text-slate-700">Venture Image Upload</span><input ref={imageInputRef} type="file" accept=".jpg,.jpeg,.png,.webp,image/jpeg,image/png,image/webp" onChange={handleImage} className="hidden" /><button type="button" onClick={() => imageInputRef.current?.click()} className="flex w-full items-center justify-center gap-2 rounded-2xl border border-dashed border-[#0B7A8F] bg-[#F0FDFA] px-4 py-3 text-sm font-black text-[#0B7A8F] transition hover:bg-emerald-50"><FiImage /> Upload Image</button></div>
            <label className="block md:col-span-2"><span className="mb-2 block text-sm font-extrabold text-slate-700">Description</span><textarea rows="4" value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} className="w-full rounded-2xl border border-slate-200 px-4 py-3 text-sm font-bold outline-none focus:border-[#1E5EFF]" placeholder="Write complete venture description" /></label>
            <label className="block md:col-span-2"><span className="mb-2 block text-sm font-extrabold text-slate-700">Amenities</span><textarea rows="4" value={form.amenities} onChange={(e) => setForm({ ...form, amenities: e.target.value })} className="w-full rounded-2xl border border-slate-200 px-4 py-3 text-sm font-bold outline-none focus:border-[#1E5EFF]" placeholder="Clubhouse, Garden, Roads, Security" /></label>
          </div>
          {form.image && <div className="mt-5 overflow-hidden rounded-[28px] border border-slate-200 bg-slate-50 p-3"><p className="mb-2 text-xs font-black uppercase tracking-wider text-slate-500">Image Preview</p><img src={form.image} alt="Venture preview" className="h-56 w-full rounded-2xl object-cover" /></div>}
          <div className="mt-4 flex flex-wrap gap-2"><PrimaryButton type="submit" variant="green">{editingId ? 'Update Venture' : 'Create Venture'}</PrimaryButton>{editingId && <PrimaryButton type="button" variant="outline" onClick={reset}>Cancel</PrimaryButton>}</div>
        </form>
      )}

      <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4">
        {ventures.map((venture) => {
          const stats = app.getVentureStats(venture.id);
          return (
            <article key={venture.id} className="group overflow-hidden rounded-[30px] border border-slate-200 bg-white shadow-sm transition hover:-translate-y-1 hover:shadow-xl hover:shadow-slate-900/10">
              <Link to={`/customer/ventures/${venture.id}`} className="relative block h-56 overflow-hidden">
                <img src={venture.image} alt={venture.name} className="h-full w-full object-cover transition duration-500 group-hover:scale-105" />
                <div className="absolute inset-0 bg-gradient-to-t from-slate-950/70 to-transparent" />
                <div className="absolute bottom-4 left-4 right-4">
                  <span className="rounded-full bg-white/90 px-3 py-1 text-xs font-black text-[#0B3D91]">{venture.type}</span>
                  <h2 className="mt-3 text-xl font-black text-white">{venture.name}</h2>
                  <p className="text-sm font-semibold text-white/78">{venture.location}</p>
                </div>
              </Link>
              <div className="p-5">
                <div className="grid grid-cols-3 gap-3">
                  <MetricPill label="Available" value={stats.availableUnits} />
                  <MetricPill label="Booked" value={stats.bookedUnits} />
                  <MetricPill label="Revenue" value={compactCurrency(stats.revenue)} />
                </div>
                <div className="mt-5">
                  <div className="mb-2 flex justify-between text-xs font-black text-slate-500"><span>Sales progress</span><span>{stats.progress}%</span></div>
                  <div className="h-2.5 overflow-hidden rounded-full bg-slate-100"><div className="h-full rounded-full bg-gradient-to-r from-[#0B3D91] to-[#12B76A]" style={{ width: `${stats.progress}%` }} /></div>
                </div>
                <p className="mt-3 text-xs font-bold text-slate-500">Created by: {venture.createdBy || 'System'} · {venture.createdAt || 'New'}</p>
                <div className="mt-5 grid grid-cols-3 gap-2">
                  <Link to={`/customer/ventures/${venture.id}`}><PrimaryButton variant="outline" className="w-full px-2"><FiEye /> View</PrimaryButton></Link>
                  {isSuperRole(user?.role) ? <PrimaryButton variant="outline" className="px-2" onClick={() => startEdit(venture)}><FiEdit /> Edit</PrimaryButton> : <PrimaryButton variant="outline" className="px-2"><FiEdit /> Edit</PrimaryButton>}
                  <Link to={`/customer/properties?ventureId=${venture.id}`}><PrimaryButton className="w-full px-2"><FiGrid /> Properties</PrimaryButton></Link>
                </div>
              </div>
            </article>
          );
        })}
        {ventures.length === 0 && <p className="rounded-2xl bg-white p-5 text-sm font-bold text-slate-500 shadow-sm md:col-span-2 xl:col-span-3">No ventures created yet. Add a venture to make it appear in the customer portal.</p>}
      </div>
    </div>
  );
}
