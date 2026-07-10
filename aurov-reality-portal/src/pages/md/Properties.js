// import { useMemo, useRef, useState } from 'react';
// import { Link } from 'react-router-dom';
// import { FiFilter, FiImage } from 'react-icons/fi';
// import PageHeader from '../../components/ui/PageHeader.js';
// import PrimaryButton from '../../components/ui/PrimaryButton.js';
// import StatusBadge from '../../components/ui/StatusBadge.js';
// import { formatCurrency } from '../../utils/formatters.js';
// import { useAppData } from '../../context/AppDataContext.js';
// import { useAuth } from '../../context/AuthContext.js';
// import { isSuperRole } from '../../constants/roles.js';

// const tabs = ['All', 'Plot', 'Flat', 'Villa'];
// const initial = { ventureId: '', type: 'Plot', number: '', area: '', price: '', status: 'Available', facing: '', floor: '', bhkType: '', image: '' };

// function numberLabel(type) {
//   if (type === 'Flat') return 'Flat Number';
//   if (type === 'Villa') return 'Villa Number';
//   return 'Plot Number';
// }

// function imageLabel(type) {
//   if (type === 'Flat') return 'Flat Image Upload';
//   if (type === 'Villa') return 'Villa Image Upload';
//   return 'Plot Image Upload';
// }

// export default function Properties() {
//   const { user } = useAuth();
//   const app = useAppData();
//   const { properties, ventures, addProperty } = app;
//   const [active, setActive] = useState('All');
//   const [open, setOpen] = useState(false);
//   const [form, setForm] = useState(initial);
//   const [message, setMessage] = useState('');
//   const imageRef = useRef(null);
//   const filtered = useMemo(() => active === 'All' ? properties : properties.filter((item) => item.type === active), [active, properties]);

//   const ventureName = (ventureId) => ventures.find((item) => item.id === ventureId)?.name || 'Aurov Venture';
//   const ventureImage = (ventureId) => ventures.find((item) => item.id === ventureId)?.image || '';

//   const handleImage = async (event) => {
//     const file = event.target.files?.[0];
//     event.target.value = '';
//     if (!file) return;
//     if (!/image\/(jpeg|png|webp)/i.test(file.type) && !/\.(jpe?g|png|webp)$/i.test(file.name)) {
//       setMessage('Only JPG, JPEG, PNG, and WEBP images are supported.');
//       return;
//     }
//     const imageData = await app.fileToData(file);
//     setForm((old) => ({ ...old, image: imageData.dataUrl }));
//     setMessage('Property image uploaded successfully.');
//   };

//   const submit = (event) => {
//     event.preventDefault();
//     if (!form.ventureId || !form.number.trim() || !form.area.trim() || !String(form.price).trim() || !form.image) {
//       setMessage('Please select venture, enter property details, price, and upload image.');
//       return;
//     }
//     if (form.type === 'Flat' && (!form.floor.trim() || !form.bhkType.trim())) {
//       setMessage('Please enter floor and BHK type for flats.');
//       return;
//     }
//     addProperty(form, user?.role);
//     setForm(initial);
//     setOpen(false);
//     setMessage(`${form.type} created successfully. It is now visible in management, customer portal, and details page.`);
//   };

//   return (
//     <div>
//       <PageHeader
//         title="Property Management"
//         subtitle="Create plots, flats, and villas with local image upload. Analytics and customer pages update from the same Local Storage records."
//         action={isSuperRole(user?.role) && <PrimaryButton variant="green" onClick={() => setOpen((value) => !value)}>{open ? 'Close Form' : '+ Add Property'}</PrimaryButton>}
//       />

//       {message && <div className="mb-5 rounded-2xl border border-slate-200 bg-white p-4 text-sm font-bold text-slate-700 shadow-sm">{message}</div>}

//       {open && (
//         <form onSubmit={submit} className="mb-6 rounded-[30px] border border-slate-200 bg-white p-5 shadow-sm">
//           <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
//             <label><span className="mb-2 block text-sm font-extrabold text-slate-700">Venture</span><select value={form.ventureId} onChange={(e) => setForm({ ...form, ventureId: e.target.value })} className="w-full rounded-2xl border border-slate-200 px-4 py-3 text-sm font-bold outline-none focus:border-[#1E5EFF]"><option value="">Select Venture</option>{ventures.map((venture) => <option key={venture.id} value={venture.id}>{venture.name}</option>)}</select></label>
//             <label><span className="mb-2 block text-sm font-extrabold text-slate-700">Property Type</span><select value={form.type} onChange={(e) => setForm({ ...form, type: e.target.value, number: '', floor: '', bhkType: '' })} className="w-full rounded-2xl border border-slate-200 px-4 py-3 text-sm font-bold outline-none focus:border-[#1E5EFF]"><option>Plot</option><option>Flat</option><option>Villa</option></select></label>
//             <label><span className="mb-2 block text-sm font-extrabold text-slate-700">{numberLabel(form.type)}</span><input value={form.number} onChange={(e) => setForm({ ...form, number: e.target.value })} className="w-full rounded-2xl border border-slate-200 px-4 py-3 text-sm font-bold outline-none focus:border-[#1E5EFF]" placeholder="A1 / B-1205 / V-07" /></label>
//             <label><span className="mb-2 block text-sm font-extrabold text-slate-700">Area</span><input value={form.area} onChange={(e) => setForm({ ...form, area: e.target.value })} className="w-full rounded-2xl border border-slate-200 px-4 py-3 text-sm font-bold outline-none focus:border-[#1E5EFF]" placeholder="220 Sq.Yds / 1625 Sq.Ft" /></label>
//             {form.type === 'Flat' && <label><span className="mb-2 block text-sm font-extrabold text-slate-700">Floor</span><input value={form.floor} onChange={(e) => setForm({ ...form, floor: e.target.value })} className="w-full rounded-2xl border border-slate-200 px-4 py-3 text-sm font-bold outline-none focus:border-[#1E5EFF]" placeholder="12" /></label>}
//             {form.type === 'Flat' && <label><span className="mb-2 block text-sm font-extrabold text-slate-700">BHK Type</span><select value={form.bhkType} onChange={(e) => setForm({ ...form, bhkType: e.target.value })} className="w-full rounded-2xl border border-slate-200 px-4 py-3 text-sm font-bold outline-none focus:border-[#1E5EFF]"><option value="">Select BHK</option><option>1 BHK</option><option>2 BHK</option><option>3 BHK</option><option>4 BHK</option><option>5 BHK</option></select></label>}
//             <label><span className="mb-2 block text-sm font-extrabold text-slate-700">Price</span><input type="number" value={form.price} onChange={(e) => setForm({ ...form, price: e.target.value })} className="w-full rounded-2xl border border-slate-200 px-4 py-3 text-sm font-bold outline-none focus:border-[#1E5EFF]" placeholder="Enter amount manually" /></label>
//             <label><span className="mb-2 block text-sm font-extrabold text-slate-700">Status</span><select value={form.status} onChange={(e) => setForm({ ...form, status: e.target.value })} className="w-full rounded-2xl border border-slate-200 px-4 py-3 text-sm font-bold outline-none focus:border-[#1E5EFF]"><option>Available</option><option>Reserved</option><option>Sold</option></select></label>
//             <label><span className="mb-2 block text-sm font-extrabold text-slate-700">Facing</span><input value={form.facing} onChange={(e) => setForm({ ...form, facing: e.target.value })} className="w-full rounded-2xl border border-slate-200 px-4 py-3 text-sm font-bold outline-none focus:border-[#1E5EFF]" placeholder="East / North" /></label>
//             <div><span className="mb-2 block text-sm font-extrabold text-slate-700">{imageLabel(form.type)}</span><input ref={imageRef} type="file" accept=".jpg,.jpeg,.png,.webp,image/jpeg,image/png,image/webp" onChange={handleImage} className="hidden" /><button type="button" onClick={() => imageRef.current?.click()} className="flex w-full items-center justify-center gap-2 rounded-2xl border border-dashed border-[#0B7A8F] bg-[#F0FDFA] px-4 py-3 text-sm font-black text-[#0B7A8F] transition hover:bg-emerald-50"><FiImage /> Upload Image</button></div>
//           </div>
//           {form.image && <div className="mt-5 overflow-hidden rounded-[28px] border border-slate-200 bg-slate-50 p-3"><p className="mb-2 text-xs font-black uppercase tracking-wider text-slate-500">Image Preview</p><img src={form.image} alt="Property preview" className="h-56 w-full rounded-2xl object-cover" /></div>}
//           <PrimaryButton type="submit" variant="green" className="mt-4">Create {form.type}</PrimaryButton>
//         </form>
//       )}

//       <div className="mb-5 flex flex-wrap gap-2 rounded-[24px] border border-slate-200 bg-white p-2 shadow-sm">
//         {tabs.map((tab) => (
//           <button key={tab} onClick={() => setActive(tab)} className={`rounded-2xl px-4 py-2 text-sm font-black transition ${active === tab ? 'bg-[#0B3D91] text-white' : 'text-slate-600 hover:bg-slate-100'}`}>{tab === 'All' ? 'All Properties' : `${tab}s`}</button>
//         ))}
//         <span className="ml-auto hidden items-center gap-2 rounded-2xl bg-slate-50 px-4 py-2 text-sm font-bold text-slate-500 sm:flex"><FiFilter /> Live Local Storage Inventory</span>
//       </div>

//       <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-4">
//         {filtered.map((property) => (
//           <article key={property.id} className="overflow-hidden rounded-[28px] border border-slate-200 bg-white shadow-sm transition hover:-translate-y-1 hover:shadow-xl hover:shadow-slate-900/10">
//             <img src={property.image || ventureImage(property.ventureId)} alt={`${property.type} ${property.number}`} className="h-44 w-full object-cover" />
//             <div className="p-5">
//               <div className="flex items-start justify-between gap-3">
//                 <div><p className="text-xs font-black uppercase tracking-[0.2em] text-[#0B7A8F]">{property.type}</p><h2 className="mt-2 text-2xl font-black text-slate-900">{property.number}</h2><p className="mt-1 text-sm font-bold text-slate-500">{ventureName(property.ventureId)}</p></div>
//                 <StatusBadge status={property.status} />
//               </div>
//               <div className="mt-5 grid grid-cols-2 gap-3 text-sm">
//                 <div className="rounded-2xl bg-slate-50 p-3"><p className="font-bold text-slate-500">Area</p><p className="mt-1 font-black text-slate-900">{property.area}</p></div>
//                 <div className="rounded-2xl bg-slate-50 p-3"><p className="font-bold text-slate-500">{property.type === 'Flat' ? 'BHK' : 'Facing'}</p><p className="mt-1 font-black text-slate-900">{property.type === 'Flat' ? property.bhkType || '-' : property.facing || '-'}</p></div>
//               </div>
//               {property.type === 'Flat' && <p className="mt-3 text-xs font-bold text-slate-500">Floor: {property.floor || '-'}</p>}
//               <p className="mt-5 text-xl font-black text-[#0B3D91]">{formatCurrency(property.price)}</p>
//               <Link to={`/md/properties/${property.id}`}><PrimaryButton variant="outline" className="mt-4 w-full">View Details</PrimaryButton></Link>
//             </div>
//           </article>
//         ))}
//         {filtered.length === 0 && <p className="rounded-2xl bg-white p-5 text-sm font-bold text-slate-500 shadow-sm sm:col-span-2 xl:col-span-4">No properties created yet.</p>}
//       </div>
//     </div>
//   );
// }





import { useEffect, useMemo, useRef, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { FiFilter, FiImage } from 'react-icons/fi';
import PageHeader from '../../components/ui/PageHeader.js';
import PrimaryButton from '../../components/ui/PrimaryButton.js';
import StatusBadge from '../../components/ui/StatusBadge.js';
import { formatCurrency } from '../../utils/formatters.js';
import { useAuth } from '../../context/AuthContext.js';
import { isSuperRole } from '../../constants/roles.js';
import { getFileUrl, propertyApi, ventureApi } from '../../services/api.js';

const tabs = ['All', 'Plot', 'Flat', 'Villa'];

const initial = {
  ventureId: '',
  type: 'Plot',
  number: '',
  area: '',
  price: '',
  status: 'Available',
  facing: '',
  floor: '',
  bhkType: '',
  image: '',
};

function numberLabel(type) {
  if (type === 'Flat') return 'Flat Number';
  if (type === 'Villa') return 'Villa Number';
  return 'Plot Number';
}

function imageLabel(type) {
  if (type === 'Flat') return 'Flat Image Upload';
  if (type === 'Villa') return 'Villa Image Upload';
  return 'Plot Image Upload';
}

export default function Properties() {
  const { user } = useAuth();
  const [searchParams] = useSearchParams();
  const selectedVentureId = searchParams.get('ventureId');

  const [ventures, setVentures] = useState([]);
  const [properties, setProperties] = useState([]);
  const [active, setActive] = useState('All');
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState(initial);
  const [imageFile, setImageFile] = useState(null);
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);

  const imageRef = useRef(null);

  const loadData = async () => {
    try {
      setLoading(true);

      const [ventureRes, propertyRes] = await Promise.all([
        ventureApi.getAll(),
        propertyApi.getAll(selectedVentureId),
      ]);

      setVentures(ventureRes.data || []);
      setProperties(propertyRes.data || []);

      if (selectedVentureId) {
        setForm((old) => ({ ...old, ventureId: selectedVentureId }));
      }
    } catch (error) {
      console.error(error);
      setMessage('Unable to load properties.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [selectedVentureId]);

  const filtered = useMemo(() => {
    if (active === 'All') return properties;
    return properties.filter((item) => item.type === active);
  }, [active, properties]);

  const ventureName = (ventureId) => {
    return (
      ventures.find((item) => String(item.id) === String(ventureId))?.name ||
      'Aurov Venture'
    );
  };

  const ventureImage = (ventureId) => {
    const venture = ventures.find(
      (item) => String(item.id) === String(ventureId)
    );

    return venture?.image || venture?.posterImageUrl || '';
  };

  const isValidImage = (file) => {
    return (
      /image\/(jpeg|png|webp)/i.test(file.type) ||
      /\.(jpe?g|png|webp)$/i.test(file.name)
    );
  };

  const fileToPreview = (file) =>
    new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result);
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });

  const handleImage = async (event) => {
    const file = event.target.files?.[0];
    event.target.value = '';

    if (!file) return;

    if (!isValidImage(file)) {
      setMessage('Only JPG, JPEG, PNG, and WEBP images are supported.');
      return;
    }

    const preview = await fileToPreview(file);

    setImageFile(file);
    setForm((old) => ({ ...old, image: preview }));
    setMessage('Property image uploaded successfully.');
  };

  const submit = async (event) => {
    event.preventDefault();

    if (
      !form.ventureId ||
      !form.number.trim() ||
      !form.area.trim() ||
      !String(form.price).trim() ||
      !imageFile
    ) {
      setMessage(
        'Please select venture, enter property details, price, and upload image.'
      );
      return;
    }

    if (form.type === 'Flat' && (!form.floor.trim() || !form.bhkType.trim())) {
      setMessage('Please enter floor and BHK type for flats.');
      return;
    }

    try {
      setLoading(true);

      const data = new FormData();

      data.append('ventureId', form.ventureId);
      data.append('type', form.type);
      data.append('number', form.number.trim());
      data.append('area', form.area.trim());
      data.append('price', form.price);
      data.append('status', form.status);
      data.append('facing', form.facing.trim());
      data.append('floor', form.floor.trim());
      data.append('bhkType', form.bhkType.trim());
      data.append('image', imageFile);

      await propertyApi.create(data);

      setForm({
        ...initial,
        ventureId: selectedVentureId || '',
      });

      setImageFile(null);
      setOpen(false);
      setMessage(`${form.type} created successfully.`);
      await loadData();
    } catch (error) {
      console.error(error);
      setMessage(
        error?.response?.data?.message || 'Unable to create property.'
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <PageHeader
        title="Property Management"
        subtitle={
          selectedVentureId
            ? `Showing properties for ${ventureName(selectedVentureId)}`
            : 'Create plots, flats, and villas. Customer property details update from backend.'
        }
        action={
          isSuperRole(user?.role) && (
            <PrimaryButton
              variant="green"
              onClick={() => setOpen((value) => !value)}
            >
              {open ? 'Close Form' : '+ Add Property'}
            </PrimaryButton>
          )
        }
      />

      {message && (
        <div className="mb-5 rounded-2xl border border-slate-200 bg-white p-4 text-sm font-bold text-slate-700 shadow-sm">
          {message}
        </div>
      )}

      {open && (
        <form
          onSubmit={submit}
          className="mb-6 rounded-[30px] border border-slate-200 bg-white p-5 shadow-sm"
        >
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
            <label>
              <span className="mb-2 block text-sm font-extrabold text-slate-700">
                Venture
              </span>
              <select
                value={form.ventureId}
                onChange={(e) =>
                  setForm({ ...form, ventureId: e.target.value })
                }
                className="w-full rounded-2xl border border-slate-200 px-4 py-3 text-sm font-bold outline-none focus:border-[#1E5EFF]"
              >
                <option value="">Select Venture</option>
                {ventures.map((venture) => (
                  <option key={venture.id} value={venture.id}>
                    {venture.name}
                  </option>
                ))}
              </select>
            </label>

            <label>
              <span className="mb-2 block text-sm font-extrabold text-slate-700">
                Property Type
              </span>
              <select
                value={form.type}
                onChange={(e) =>
                  setForm({
                    ...form,
                    type: e.target.value,
                    number: '',
                    floor: '',
                    bhkType: '',
                  })
                }
                className="w-full rounded-2xl border border-slate-200 px-4 py-3 text-sm font-bold outline-none focus:border-[#1E5EFF]"
              >
                <option>Plot</option>
                <option>Flat</option>
                <option>Villa</option>
              </select>
            </label>

            <label>
              <span className="mb-2 block text-sm font-extrabold text-slate-700">
                {numberLabel(form.type)}
              </span>
              <input
                value={form.number}
                onChange={(e) => setForm({ ...form, number: e.target.value })}
                className="w-full rounded-2xl border border-slate-200 px-4 py-3 text-sm font-bold outline-none focus:border-[#1E5EFF]"
                placeholder="A1 / B-1205 / V-07"
              />
            </label>

            <label>
              <span className="mb-2 block text-sm font-extrabold text-slate-700">
                Area
              </span>
              <input
                value={form.area}
                onChange={(e) => setForm({ ...form, area: e.target.value })}
                className="w-full rounded-2xl border border-slate-200 px-4 py-3 text-sm font-bold outline-none focus:border-[#1E5EFF]"
                placeholder="220 Sq.Yds / 1625 Sq.Ft"
              />
            </label>

            {form.type === 'Flat' && (
              <label>
                <span className="mb-2 block text-sm font-extrabold text-slate-700">
                  Floor
                </span>
                <input
                  value={form.floor}
                  onChange={(e) =>
                    setForm({ ...form, floor: e.target.value })
                  }
                  className="w-full rounded-2xl border border-slate-200 px-4 py-3 text-sm font-bold outline-none focus:border-[#1E5EFF]"
                  placeholder="12"
                />
              </label>
            )}

            {form.type === 'Flat' && (
              <label>
                <span className="mb-2 block text-sm font-extrabold text-slate-700">
                  BHK Type
                </span>
                <select
                  value={form.bhkType}
                  onChange={(e) =>
                    setForm({ ...form, bhkType: e.target.value })
                  }
                  className="w-full rounded-2xl border border-slate-200 px-4 py-3 text-sm font-bold outline-none focus:border-[#1E5EFF]"
                >
                  <option value="">Select BHK</option>
                  <option>1 BHK</option>
                  <option>2 BHK</option>
                  <option>3 BHK</option>
                  <option>4 BHK</option>
                  <option>5 BHK</option>
                </select>
              </label>
            )}

            <label>
              <span className="mb-2 block text-sm font-extrabold text-slate-700">
                Price
              </span>
              <input
                type="number"
                value={form.price}
                onChange={(e) => setForm({ ...form, price: e.target.value })}
                className="w-full rounded-2xl border border-slate-200 px-4 py-3 text-sm font-bold outline-none focus:border-[#1E5EFF]"
                placeholder="Enter amount manually"
              />
            </label>

            <label>
              <span className="mb-2 block text-sm font-extrabold text-slate-700">
                Status
              </span>
              <select
                value={form.status}
                onChange={(e) => setForm({ ...form, status: e.target.value })}
                className="w-full rounded-2xl border border-slate-200 px-4 py-3 text-sm font-bold outline-none focus:border-[#1E5EFF]"
              >
                <option>Available</option>
                <option>Reserved</option>
                <option>Sold</option>
              </select>
            </label>

            <label>
              <span className="mb-2 block text-sm font-extrabold text-slate-700">
                Facing
              </span>
              <input
                value={form.facing}
                onChange={(e) => setForm({ ...form, facing: e.target.value })}
                className="w-full rounded-2xl border border-slate-200 px-4 py-3 text-sm font-bold outline-none focus:border-[#1E5EFF]"
                placeholder="East / North"
              />
            </label>

            <div>
              <span className="mb-2 block text-sm font-extrabold text-slate-700">
                {imageLabel(form.type)}
              </span>

              <input
                ref={imageRef}
                type="file"
                accept=".jpg,.jpeg,.png,.webp,image/jpeg,image/png,image/webp"
                onChange={handleImage}
                className="hidden"
              />

              <button
                type="button"
                onClick={() => imageRef.current?.click()}
                className="flex w-full items-center justify-center gap-2 rounded-2xl border border-dashed border-[#0B7A8F] bg-[#F0FDFA] px-4 py-3 text-sm font-black text-[#0B7A8F] transition hover:bg-emerald-50"
              >
                <FiImage /> Upload Image
              </button>
            </div>
          </div>

          {form.image && (
            <div className="mt-5 overflow-hidden rounded-[28px] border border-slate-200 bg-slate-50 p-3">
              <p className="mb-2 text-xs font-black uppercase tracking-wider text-slate-500">
                Image Preview
              </p>
              <img
                src={form.image}
                alt="Property preview"
                className="h-56 w-full rounded-2xl object-cover"
              />
            </div>
          )}

          <PrimaryButton
            type="submit"
            variant="green"
            className="mt-4"
            disabled={loading}
          >
            {loading ? 'Saving...' : `Create ${form.type}`}
          </PrimaryButton>
        </form>
      )}

      <div className="mb-5 flex flex-wrap gap-2 rounded-[24px] border border-slate-200 bg-white p-2 shadow-sm">
        {tabs.map((tab) => (
          <button
            key={tab}
            onClick={() => setActive(tab)}
            className={`rounded-2xl px-4 py-2 text-sm font-black transition ${
              active === tab
                ? 'bg-[#0B3D91] text-white'
                : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            {tab === 'All' ? 'All Properties' : `${tab}s`}
          </button>
        ))}

        <span className="ml-auto hidden items-center gap-2 rounded-2xl bg-slate-50 px-4 py-2 text-sm font-bold text-slate-500 sm:flex">
          <FiFilter /> Backend Inventory
        </span>
      </div>

      <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-4">
        {filtered.map((property) => (
          <article
            key={property.id}
            className="overflow-hidden rounded-[28px] border border-slate-200 bg-white shadow-sm transition hover:-translate-y-1 hover:shadow-xl hover:shadow-slate-900/10"
          >
            <img
              src={getFileUrl(property.image || property.imageUrl || ventureImage(property.ventureId))}
              alt={`${property.type} ${property.number}`}
              className="h-44 w-full object-cover"
            />

            <div className="p-5">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="text-xs font-black uppercase tracking-[0.2em] text-[#0B7A8F]">
                    {property.type}
                  </p>

                  <h2 className="mt-2 text-2xl font-black text-slate-900">
                    {property.number}
                  </h2>

                  <p className="mt-1 text-sm font-bold text-slate-500">
                    {property.ventureName || ventureName(property.ventureId)}
                  </p>
                </div>

                <StatusBadge status={property.status} />
              </div>

              <div className="mt-5 grid grid-cols-2 gap-3 text-sm">
                <div className="rounded-2xl bg-slate-50 p-3">
                  <p className="font-bold text-slate-500">Area</p>
                  <p className="mt-1 font-black text-slate-900">
                    {property.area}
                  </p>
                </div>

                <div className="rounded-2xl bg-slate-50 p-3">
                  <p className="font-bold text-slate-500">
                    {property.type === 'Flat' ? 'BHK' : 'Facing'}
                  </p>
                  <p className="mt-1 font-black text-slate-900">
                    {property.type === 'Flat'
                      ? property.bhkType || '-'
                      : property.facing || '-'}
                  </p>
                </div>
              </div>

              {property.type === 'Flat' && (
                <p className="mt-3 text-xs font-bold text-slate-500">
                  Floor: {property.floor || '-'}
                </p>
              )}

              <p className="mt-5 text-xl font-black text-[#0B3D91]">
                {formatCurrency(property.price)}
              </p>

              <Link to={`/md/properties/${property.id}`}>
                <PrimaryButton variant="outline" className="mt-4 w-full">
                  View Details
                </PrimaryButton>
              </Link>
            </div>
          </article>
        ))}

        {filtered.length === 0 && !loading && (
          <p className="rounded-2xl bg-white p-5 text-sm font-bold text-slate-500 shadow-sm sm:col-span-2 xl:col-span-4">
            No properties created yet.
          </p>
        )}
      </div>
    </div>
  );
}
