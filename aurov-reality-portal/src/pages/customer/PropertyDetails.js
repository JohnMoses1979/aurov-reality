// import { Link, useParams } from 'react-router-dom';
// import { FiCheckCircle, FiMapPin } from 'react-icons/fi';

// import PrimaryButton from '../../components/ui/PrimaryButton.js';
// import StatusBadge from '../../components/ui/StatusBadge.js';
// import { formatCurrency } from '../../utils/formatters.js';
// import { useAppData } from '../../context/AppDataContext.js';

// const fallbackBuildingImage =

// function getVentureImage(venture) {
//   return venture?.image || venture?.images?.[0] || fallbackBuildingImage;
// }

// function getPropertyImage(property, venture) {
//   return property?.image || property?.images?.[0] || getVentureImage(venture);
// }

// export default function PropertyDetails() {
//   const { id } = useParams();
//   const { properties, ventures } = useAppData();
//   const property = properties.find((item) => item.id === id);
//   const venture = ventures.find((item) => item.id === property?.ventureId);

//   if (!property || !venture) {
//     return (
//       <main className="mx-auto max-w-[960px] px-4 py-16 lg:px-8">
//         <div className="rounded-[30px] border border-slate-200 bg-white p-8 text-center shadow-sm">
//           <h1 className="text-2xl font-black text-slate-900">Property not found</h1>
//           <p className="mt-2 text-sm font-bold text-slate-500">The selected property is not available in Local Storage.</p>
//           <Link to="/customer/properties"><PrimaryButton className="mt-5">Back to Properties</PrimaryButton></Link>
//         </div>
//       </main>
//     );
//   }

//   const image = getPropertyImage(property, venture);

//   return (
//     <main className="mx-auto max-w-[1440px] px-4 py-12 lg:px-8">
//       <div className="grid gap-8 lg:grid-cols-[1fr_0.8fr]">
//         <div className="overflow-hidden rounded-[30px] border border-slate-200 bg-white shadow-sm">
//           <img src={image} alt={`${property.type} ${property.number}`} className="h-[420px] w-full object-cover" />
//           <div className="p-6">
//             <p className="text-sm font-black uppercase tracking-[0.22em] text-[#0B7A8F]">{property.type} Details</p>
//             <h1 className="mt-2 text-4xl font-black text-slate-900">{property.type} {property.number}</h1>
//             <p className="mt-3 flex items-center gap-2 text-base font-bold text-slate-500"><FiMapPin /> {venture.name} · {venture.location}</p>
//           </div>
//         </div>

//         <aside className="rounded-[30px] border border-slate-200 bg-white p-6 shadow-sm">
//           <div className="flex items-start justify-between gap-3">
//             <div>
//               <p className="text-sm font-bold text-slate-500">Price</p>
//               <p className="mt-1 text-4xl font-black text-[#0B3D91]">{formatCurrency(property.price)}</p>
//             </div>
//             <StatusBadge status={property.status} />
//           </div>

//           <div className="mt-8 grid grid-cols-2 gap-4">
//             <div className="rounded-3xl bg-slate-50 p-4">
//               <p className="text-sm font-bold text-slate-500">Area</p>
//               <p className="mt-1 text-lg font-black">{property.area}</p>
//             </div>
//             <div className="rounded-3xl bg-slate-50 p-4">
//               <p className="text-sm font-bold text-slate-500">{property.type === 'Flat' ? 'BHK Type' : 'Facing'}</p>
//               <p className="mt-1 text-lg font-black">{property.type === 'Flat' ? property.bhkType || '-' : property.facing || '-'}</p>
//             </div>
//             {property.type === 'Flat' && (
//               <div className="rounded-3xl bg-slate-50 p-4">
//                 <p className="text-sm font-bold text-slate-500">Floor</p>
//                 <p className="mt-1 text-lg font-black">{property.floor || '-'}</p>
//               </div>
//             )}
//           </div>

//           <div className="mt-8 rounded-3xl bg-[#EEF4FF] p-4">
//             <p className="text-sm font-black text-slate-900">Venture Information</p>
//             <p className="mt-2 text-sm font-bold leading-6 text-slate-600">{venture.description}</p>
//           </div>

//           <div className="mt-8 space-y-3">
//             {['Verified project documents', 'Site visit available', 'Transparent reservation flow', 'Premium location and layout'].map((item) => (
//               <p key={item} className="flex items-center gap-3 text-sm font-bold text-slate-600">
//                 <FiCheckCircle className="text-[#12B76A]" /> {item}
//               </p>
//             ))}
//           </div>

//           <div className="mt-8 grid gap-3 sm:grid-cols-3">
//             <Link to={`/customer/book-demo?propertyId=${property.id}&ventureId=${venture.id}`}><PrimaryButton variant="outline" className="w-full">Book Demo</PrimaryButton></Link>
//             <Link to={`/customer/contact-us?propertyId=${property.id}&ventureId=${venture.id}`}><PrimaryButton variant="outline" className="w-full">Contact Us</PrimaryButton></Link>
//             <Link to={`/customer/book-property?propertyId=${property.id}`}><PrimaryButton variant="green" className="w-full" disabled={property.status === 'Sold'}>Reserve</PrimaryButton></Link>
//           </div>
//         </aside>
//       </div>
//     </main>
//   );
// }




import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { FiArrowLeft, FiHome, FiMapPin } from 'react-icons/fi';
import PageHeader from '../../components/ui/PageHeader.js';
import PrimaryButton from '../../components/ui/PrimaryButton.js';
import StatusBadge from '../../components/ui/StatusBadge.js';
import { formatCurrency } from '../../utils/formatters.js';
import { getFileUrl, propertyApi } from '../../services/api.js';

export default function PropertyDetails() {
  const { id } = useParams();

  const [property, setProperty] = useState(null);
  const [message, setMessage] = useState('');

  useEffect(() => {
    const loadProperty = async () => {
      try {
        const res = await propertyApi.getById(id);
        setProperty(res.data);
      } catch (error) {
        console.error(error);
        setMessage('Unable to load property details.');
      }
    };

    loadProperty();
  }, [id]);

  if (message) {
    return (
      <div className="rounded-2xl bg-white p-5 text-sm font-bold text-red-600 shadow-sm">
        {message}
      </div>
    );
  }

  if (!property) {
    return (
      <div className="rounded-2xl bg-white p-5 text-sm font-bold text-slate-500 shadow-sm">
        Loading property details...
      </div>
    );
  }

  return (
    <div>
      <PageHeader
        title={`${property.type} ${property.number}`}
        subtitle="Complete property details for customer view."
        action={
          <Link to={`/customer/properties?ventureId=${property.ventureId}`}>
            <PrimaryButton variant="outline">
              <FiArrowLeft /> Back to Properties
            </PrimaryButton>
          </Link>
        }
      />

      <div className="overflow-hidden rounded-[32px] border border-slate-200 bg-white shadow-sm">
        <div className="relative h-[420px] overflow-hidden">
          <img
            src={getFileUrl(property.image || property.imageUrl)}
            alt={`${property.type} ${property.number}`}
            className="h-full w-full object-cover"
          />

          <div className="absolute inset-0 bg-gradient-to-t from-slate-950/70 to-transparent" />

          <div className="absolute bottom-6 left-6 right-6">
            <div className="flex flex-wrap items-center gap-3">
              <span className="rounded-full bg-white/90 px-4 py-2 text-xs font-black text-[#0B3D91]">
                {property.type}
              </span>

              <StatusBadge status={property.status} />
            </div>

            <h1 className="mt-4 text-4xl font-black text-white">
              {property.number}
            </h1>

            <p className="mt-2 flex items-center gap-2 text-sm font-bold text-white/90">
              <FiMapPin /> {property.ventureName || 'Aurov Venture'}
            </p>
          </div>
        </div>

        <div className="grid gap-5 p-6 md:grid-cols-2 xl:grid-cols-4">
          <div className="rounded-3xl bg-slate-50 p-5">
            <p className="text-sm font-bold text-slate-500">Price</p>
            <p className="mt-2 text-2xl font-black text-[#0B3D91]">
              {formatCurrency(property.price)}
            </p>
          </div>

          <div className="rounded-3xl bg-slate-50 p-5">
            <p className="text-sm font-bold text-slate-500">Area</p>
            <p className="mt-2 text-xl font-black text-slate-900">
              {property.area}
            </p>
          </div>

          <div className="rounded-3xl bg-slate-50 p-5">
            <p className="text-sm font-bold text-slate-500">
              {property.type === 'Flat' ? 'BHK Type' : 'Facing'}
            </p>
            <p className="mt-2 text-xl font-black text-slate-900">
              {property.type === 'Flat'
                ? property.bhkType || '-'
                : property.facing || '-'}
            </p>
          </div>

          <div className="rounded-3xl bg-slate-50 p-5">
            <p className="text-sm font-bold text-slate-500">Status</p>
            <p className="mt-2 text-xl font-black text-slate-900">
              {property.status}
            </p>
          </div>
        </div>

        <div className="grid gap-6 border-t border-slate-100 p-6 lg:grid-cols-3">
          <div className="lg:col-span-2">
            <h2 className="flex items-center gap-2 text-xl font-black text-slate-900">
              <FiHome /> Property More Details
            </h2>

            <div className="mt-4 grid gap-3 sm:grid-cols-2">
              <Detail label="Venture" value={property.ventureName} />
              <Detail label="Property Type" value={property.type} />
              <Detail label="Number" value={property.number} />
              <Detail label="Area" value={property.area} />
              <Detail label="Facing" value={property.facing || '-'} />
              <Detail label="Floor" value={property.floor || '-'} />
              <Detail label="BHK Type" value={property.bhkType || '-'} />
              <Detail label="Created By" value={property.createdBy || 'System'} />
            </div>
          </div>

          <div className="rounded-3xl border border-slate-200 p-5">
            <h3 className="text-lg font-black text-slate-900">
              Customer Action
            </h3>

            <p className="mt-2 text-sm font-semibold leading-6 text-slate-500">
              Customer can view complete property details here before booking
              site visit or payment.
            </p>

            <PrimaryButton className="mt-5 w-full">
              Book Site Visit
            </PrimaryButton>
          </div>
        </div>
      </div>
    </div>
  );
}

function Detail({ label, value }) {
  return (
    <div className="rounded-2xl bg-slate-50 p-4">
      <p className="text-xs font-black uppercase tracking-wider text-slate-500">
        {label}
      </p>
      <p className="mt-2 text-sm font-black text-slate-900">
        {value || '-'}
      </p>
    </div>
  );
}