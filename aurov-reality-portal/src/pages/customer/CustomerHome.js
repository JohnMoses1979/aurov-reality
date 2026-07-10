

// import { Link } from 'react-router-dom';
// import { motion } from 'framer-motion';
// import { FiArrowRight, FiCheckCircle, FiMapPin, FiStar } from 'react-icons/fi';

// import PrimaryButton from '../../components/ui/PrimaryButton.js';
// import StatusBadge from '../../components/ui/StatusBadge.js';
// import { useAppData } from '../../context/AppDataContext.js';
// import { compactCurrency, formatCurrency } from '../../utils/formatters.js';

// const fallbackBuildingImage = '';

// const REAL_ESTATE_IMAGES = {
//   'Aurov Green Meadows':

//   'Aurov Ridgeview Plots':
//     'https://images.unsplash.com/photo-1600566753190-17f0baa2a6c3?auto=format&fit=crop&w=1400&q=85',

//   'Aurov Skyline Residences':
//     'https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?auto=format&fit=crop&w=1400&q=85',

//   'Aurov Parkside Towers':
//     'https://images.unsplash.com/photo-1600047509807-ba8f99d2cdde?auto=format&fit=crop&w=1400&q=85',
// };

// const DEFAULT_GALLERY_IMAGES = [
//   'https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?auto=format&fit=crop&w=1400&q=85',
//   'https://images.unsplash.com/photo-1600566753190-17f0baa2a6c3?auto=format&fit=crop&w=1400&q=85',
//   'https://images.unsplash.com/photo-1600047509807-ba8f99d2cdde?auto=format&fit=crop&w=1400&q=85',
//   'https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?auto=format&fit=crop&w=1400&q=85',
//   'https://images.unsplash.com/photo-1600607688969-a5bfcd646154?auto=format&fit=crop&w=1400&q=85',
//   'https://images.unsplash.com/photo-1600566752355-35792bedcfea?auto=format&fit=crop&w=1400&q=85',
//   'https://images.unsplash.com/photo-1600607687920-4e2a09cf159d?auto=format&fit=crop&w=1400&q=85',
// ];

// function getVentureImage(venture) {
//   return (
//     REAL_ESTATE_IMAGES[venture?.name] ||
//     venture?.image ||
//     venture?.images?.[0] ||
//     fallbackBuildingImage
//   );
// }

// function getPropertyImage(property, ventures) {
//   const venture = ventures.find((item) => item.id === property.ventureId);

//   return (
//     property?.image ||
//     property?.images?.[0] ||
//     getVentureImage(venture) ||
//     fallbackBuildingImage
//   );
// }

// function getStartingPrice(venture, properties) {
//   if (Number(venture.startingPrice || 0) > 0) {
//     return Number(venture.startingPrice || 0);
//   }

//   const prices = properties
//     .filter((property) => property.ventureId === venture.id)
//     .map((property) => Number(property.price || 0))
//     .filter(Boolean);

//   return prices.length ? Math.min(...prices) : 0;
// }

// function ImageWithFallback({ src, alt, className }) {
//   return (
//     <img
//       src={src || fallbackBuildingImage}
//       alt={alt}
//       onError={(event) => {
//         event.currentTarget.onerror = null;
//         event.currentTarget.src = fallbackBuildingImage;
//       }}
//       className={className}
//     />
//   );
// }

// function VentureCard({ venture, properties, app }) {
//   const stats = app.getVentureStats(venture.id);
//   const starting = getStartingPrice(venture, properties);

//   return (
//     <article className="overflow-hidden rounded-[24px] border border-slate-200 bg-white shadow-sm transition hover:-translate-y-1 hover:shadow-xl hover:shadow-slate-900/10">
//       <div className="relative h-64 overflow-hidden">
//         <ImageWithFallback
//           src={getVentureImage(venture)}
//           alt={venture.name}
//           className="h-full w-full object-cover"
//         />

//         <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-slate-950/20 to-transparent" />

//         {venture.category && (
//           <span className="absolute left-5 top-5 rounded-full bg-[#0B7A8F] px-4 py-2 text-xs font-black uppercase tracking-wider text-white">
//             {venture.category}
//           </span>
//         )}

//         {venture.launchLabel && (
//           <span className="absolute right-5 top-5 rounded-full bg-white/80 px-4 py-2 text-xs font-black text-slate-700 backdrop-blur">
//             {venture.launchLabel}
//           </span>
//         )}

//         <div className="absolute bottom-0 left-0 right-0 p-5 text-white">
//           <h3 className="text-3xl font-black">{venture.name}</h3>

//           <p className="mt-2 flex items-center gap-2 text-sm font-bold text-white/85">
//             <FiMapPin /> {venture.location}
//           </p>
//         </div>
//       </div>

//       <div className="p-6">
//         <p className="min-h-[52px] text-sm font-semibold leading-6 text-slate-500">
//           {venture.description}
//         </p>

//         <div className="mt-4 flex flex-wrap gap-2">
//           {(venture.amenities || []).slice(0, 5).map((item) => (
//             <span
//               key={item}
//               className="rounded-full bg-slate-100 px-3 py-1 text-xs font-bold text-slate-600"
//             >
//               {item}
//             </span>
//           ))}
//         </div>

//         <div className="mt-5 grid grid-cols-3 gap-3 rounded-2xl bg-slate-50 p-3 text-center text-sm font-black">
//           <div>
//             <p className="text-slate-400">From</p>
//             <p className="text-[#0B3D91]">{compactCurrency(starting || 0)}</p>
//           </div>

//           <div>
//             <p className="text-slate-400">Available</p>
//             <p className="text-[#12B76A]">{stats.availableUnits}</p>
//           </div>

//           <div>
//             <p className="text-slate-400">Booked</p>
//             <p className="text-[#EF4444]">{stats.bookedUnits}</p>
//           </div>
//         </div>

//         <div className="mt-5 grid gap-3 sm:grid-cols-2">
//           <Link to={`/customer/ventures/${venture.id}`}>
//             <PrimaryButton className="w-full">View Layout</PrimaryButton>
//           </Link>

//           <Link to={`/customer/contact-us?ventureId=${venture.id}&type=enquiry`}>
//             <PrimaryButton variant="outline" className="w-full">
//               Enquire Now
//             </PrimaryButton>
//           </Link>
//         </div>
//       </div>
//     </article>
//   );
// }

// export default function CustomerHome() {
//   const app = useAppData();

//   const ventures = app.ventures || [];
//   const properties = app.properties || [];

//   const hero = ventures[0];

//   const available = properties.filter((item) => item.status === 'Available');

//   const gallery = Array.from(
//     new Set(
//       [
//         ...ventures.flatMap((item) => [
//           getVentureImage(item),
//           ...(item.images || []),
//         ]),
//         ...properties.flatMap((item) => [
//           item.image,
//           ...(item.images || []),
//         ]),
//         ...DEFAULT_GALLERY_IMAGES,
//       ].filter(Boolean)
//     )
//   ).slice(0, 8);

//   const ventureAmenities = Array.from(
//     new Set(ventures.flatMap((venture) => venture.amenities || []))
//   ).slice(0, 12);

//   return (
//     <main className="bg-[#F8FAFC]">
//       <section className="relative overflow-hidden rounded-b-[36px] bg-gradient-to-br from-[#0B3D91] via-[#0B7A8F] to-[#12B76A] px-4 py-14 text-white lg:px-8 lg:py-16">
//         <div className="absolute left-[-6rem] top-[-6rem] h-72 w-72 rounded-full bg-white/10 blur-2xl" />
//         <div className="absolute bottom-[-8rem] right-[-8rem] h-96 w-96 rounded-full bg-white/10 blur-3xl" />

//         <div className="relative mx-auto grid max-w-[1440px] items-center gap-10 lg:grid-cols-[1fr_0.9fr]">
//           <motion.div
//             initial={{ opacity: 0, y: 18 }}
//             animate={{ opacity: 1, y: 0 }}
//           >
//             <span className="rounded-full bg-white/15 px-4 py-2 text-xs font-black uppercase tracking-[0.24em] ring-1 ring-white/20">
//               Customer Portal
//             </span>

//             <h1 className="mt-6 max-w-4xl text-4xl font-black leading-tight sm:text-5xl xl:text-6xl">
//               Explore Aurov Reality ventures, layouts, and available properties.
//             </h1>

//             <p className="mt-5 max-w-2xl text-base font-semibold leading-8 text-white/85">
//               View venture images, amenities, location, available plots, flats,
//               villas, gallery, and submit enquiries or booking requests directly
//               from the customer portal.
//             </p>

//             <div className="mt-8 flex flex-wrap gap-3">
//               <Link to="/customer/ventures">
//                 <PrimaryButton variant="green">
//                   View Ventures <FiArrowRight />
//                 </PrimaryButton>
//               </Link>

//               <Link to="/customer/book-demo">
//                 <PrimaryButton variant="outline">Book Demo</PrimaryButton>
//               </Link>

//               <Link to="/customer/contact-us">
//                 <PrimaryButton variant="outline">Contact Us</PrimaryButton>
//               </Link>
//             </div>
//           </motion.div>

//           <motion.div
//             initial={{ opacity: 0, scale: 0.96 }}
//             animate={{ opacity: 1, scale: 1 }}
//             className="overflow-hidden rounded-[30px] bg-white/12 p-3 ring-1 ring-white/20 backdrop-blur-xl"
//           >
//             <ImageWithFallback
//               src={getVentureImage(hero)}
//               alt={hero?.name || 'Premium Aurov real estate building'}
//               className="h-[340px] w-full rounded-[24px] object-cover shadow-2xl lg:h-[460px]"
//             />
//           </motion.div>
//         </div>
//       </section>

//       <section className="mx-auto max-w-[1440px] px-4 py-14 lg:px-8">
//         <div className="mb-8 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
//           <div>
//             <p className="text-sm font-black uppercase tracking-[0.22em] text-[#0B7A8F]">
//               Featured Ventures
//             </p>

//             <h2 className="mt-2 text-3xl font-black text-slate-900">
//               Explore Aurov Reality projects
//             </h2>
//           </div>

//           <Link
//             to="/customer/ventures"
//             className="text-sm font-black text-[#0B3D91]"
//           >
//             View all
//           </Link>
//         </div>

//         <div className="grid gap-6 md:grid-cols-2">
//           {ventures.map((venture) => (
//             <VentureCard
//               key={venture.id}
//               venture={venture}
//               properties={properties}
//               app={app}
//             />
//           ))}

//           {ventures.length === 0 && (
//             <div className="rounded-[24px] border border-slate-200 bg-white p-6 text-sm font-bold text-slate-500 shadow-sm md:col-span-2">
//               No ventures available yet. New ventures created by MD/OH will
//               appear here automatically.
//             </div>
//           )}
//         </div>
//       </section>

//       <section className="mx-auto max-w-[1440px] px-4 pb-14 lg:px-8">
//         <div className="grid gap-6 lg:grid-cols-[0.75fr_1.25fr]">
//           <div className="rounded-[24px] border border-slate-200 bg-white p-6 shadow-sm">
//             <p className="text-sm font-black uppercase tracking-[0.22em] text-[#0B7A8F]">
//               About Venture
//             </p>

//             <h2 className="mt-2 text-3xl font-black text-slate-900">
//               Designed for transparent property decisions
//             </h2>

//             <p className="mt-4 text-sm font-semibold leading-7 text-slate-500">
//               Customer Home uses the same Local Storage data as Ventures,
//               Venture Details, Properties, MD, OH, and Sales Manager modules.
//               New ventures and properties added by leadership appear here
//               automatically.
//             </p>

//             <div className="mt-5 grid gap-3">
//               {[
//                 'Live layout visibility',
//                 'Direct enquiry and booking workflow',
//                 'Location and amenity clarity',
//                 'One shared Context + Local Storage source',
//               ].map((item) => (
//                 <p
//                   key={item}
//                   className="flex items-center gap-3 text-sm font-black text-slate-700"
//                 >
//                   <FiCheckCircle className="text-[#12B76A]" /> {item}
//                 </p>
//               ))}
//             </div>
//           </div>

//           <div className="rounded-[24px] border border-slate-200 bg-white p-6 shadow-sm">
//             <p className="text-sm font-black uppercase tracking-[0.22em] text-[#0B7A8F]">
//               Amenities
//             </p>

//             <div className="mt-4 flex flex-wrap gap-3">
//               {ventureAmenities.map((item) => (
//                 <span
//                   key={item}
//                   className="inline-flex items-center gap-2 rounded-2xl bg-[#EEF4FF] px-4 py-3 text-sm font-black text-[#0B3D91]"
//                 >
//                   <FiStar /> {item}
//                 </span>
//               ))}

//               {ventureAmenities.length === 0 && (
//                 <p className="text-sm font-bold text-slate-500">
//                   Amenities will appear after ventures are added.
//                 </p>
//               )}
//             </div>
//           </div>
//         </div>
//       </section>

//       <section className="mx-auto max-w-[1440px] px-4 pb-14 lg:px-8">
//         <div className="mb-6">
//           <p className="text-sm font-black uppercase tracking-[0.22em] text-[#0B7A8F]">
//             Available Properties
//           </p>

//           <h2 className="mt-2 text-3xl font-black text-slate-900">
//             Plots, flats and villas
//           </h2>
//         </div>

//         <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
//           {available.slice(0, 6).map((property) => {
//             const venture = ventures.find(
//               (item) => item.id === property.ventureId
//             );

//             return (
//               <article
//                 key={property.id}
//                 className="overflow-hidden rounded-[24px] border border-slate-200 bg-white shadow-sm"
//               >
//                 <ImageWithFallback
//                   src={getPropertyImage(property, ventures)}
//                   alt={`${property.type} ${property.number}`}
//                   className="h-48 w-full object-cover"
//                 />

//                 <div className="p-5">
//                   <div className="flex items-start justify-between gap-3">
//                     <div>
//                       <p className="text-xs font-black uppercase tracking-[0.2em] text-[#0B7A8F]">
//                         {property.type}
//                       </p>

//                       <h3 className="mt-1 text-xl font-black text-slate-900">
//                         {property.type} {property.number}
//                       </h3>
//                     </div>

//                     <StatusBadge status={property.status} />
//                   </div>

//                   <p className="mt-3 text-sm font-bold text-slate-500">
//                     {venture?.name} · {property.area}
//                   </p>

//                   <p className="mt-3 text-2xl font-black text-[#0B3D91]">
//                     {formatCurrency(property.price)}
//                   </p>

//                   <Link to={`/customer/properties/${property.id}`}>
//                     <PrimaryButton className="mt-4 w-full">
//                       View Details
//                     </PrimaryButton>
//                   </Link>
//                 </div>
//               </article>
//             );
//           })}

//           {available.length === 0 && (
//             <div className="rounded-[24px] border border-slate-200 bg-white p-6 text-sm font-bold text-slate-500 shadow-sm md:col-span-2 xl:col-span-3">
//               No available properties yet.
//             </div>
//           )}
//         </div>
//       </section>

//       <section className="mx-auto max-w-[1440px] px-4 pb-20 lg:px-8">
//         <div className="mb-6">
//           <p className="text-sm font-black uppercase tracking-[0.22em] text-[#0B7A8F]">
//             Gallery
//           </p>

//           <h2 className="mt-2 text-3xl font-black text-slate-900">
//             Venture and property images
//           </h2>
//         </div>

//         <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
//           {gallery.map(
//             (image, index) => (
//               <ImageWithFallback
//                 key={`${image}-${index}`}
//                 src={image}
//                 alt={`Aurov gallery ${index + 1}`}
//                 className="h-52 w-full rounded-[24px] border border-slate-200 object-cover shadow-sm"
//               />
//             )
//           )}
//         </div>
//       </section>
//     </main>
//   );
// }







import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { FiArrowRight, FiCheckCircle, FiMapPin, FiStar } from 'react-icons/fi';

import PrimaryButton from '../../components/ui/PrimaryButton.js';
import StatusBadge from '../../components/ui/StatusBadge.js';
import { compactCurrency, formatCurrency } from '../../utils/formatters.js';
import { customerHomeApi, getFileUrl } from '../../services/api.js';

const fallbackBuildingImage = '';

function getVentureImage(venture) {
  return (
    venture?.image ||
    venture?.posterImageUrl ||
    venture?.images?.[0] ||
    venture?.galleryImageUrls?.[0] ||
    ''
  );
}

function getPropertyImage(property, ventures) {
  const venture = ventures.find(
    (item) => String(item.id) === String(property.ventureId)
  );

  return (
    property?.image ||
    property?.imageUrl ||
    property?.images?.[0] ||
    getVentureImage(venture) ||
    ''
  );
}

function ImageWithFallback({ src, alt, className }) {
  const [failed, setFailed] = useState(false);
  const imageSrc = getFileUrl(src || '');

  if (!imageSrc || failed) {
    return <div aria-label={alt} className={`${className} bg-slate-100`} />;
  }

  return (
    <img
      src={imageSrc}
      alt={alt}
      onError={() => setFailed(true)}
      className={className}
    />
  );
}

function VentureCard({ venture }) {
  const starting = Number(venture.startingPrice || 0);

  return (
    <article className="overflow-hidden rounded-[24px] border border-slate-200 bg-white shadow-sm transition hover:-translate-y-1 hover:shadow-xl hover:shadow-slate-900/10">
      <div className="relative h-64 overflow-hidden">
        <ImageWithFallback
          src={getVentureImage(venture)}
          alt={venture.name}
          className="h-full w-full object-cover"
        />

        <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-slate-950/20 to-transparent" />

        {venture.category && (
          <span className="absolute left-5 top-5 rounded-full bg-[#0B7A8F] px-4 py-2 text-xs font-black uppercase tracking-wider text-white">
            {venture.category}
          </span>
        )}

        {venture.launchLabel && (
          <span className="absolute right-5 top-5 rounded-full bg-white/80 px-4 py-2 text-xs font-black text-slate-700 backdrop-blur">
            {venture.launchLabel}
          </span>
        )}

        <div className="absolute bottom-0 left-0 right-0 p-5 text-white">
          <h3 className="text-3xl font-black">{venture.name}</h3>

          <p className="mt-2 flex items-center gap-2 text-sm font-bold text-white/85">
            <FiMapPin /> {venture.location}
          </p>
        </div>
      </div>

      <div className="p-6">
        <p className="min-h-[52px] text-sm font-semibold leading-6 text-slate-500">
          {venture.description}
        </p>

        <div className="mt-4 flex flex-wrap gap-2">
          {(venture.amenities || []).slice(0, 5).map((item) => (
            <span
              key={item}
              className="rounded-full bg-slate-100 px-3 py-1 text-xs font-bold text-slate-600"
            >
              {item}
            </span>
          ))}
        </div>

        <div className="mt-5 grid grid-cols-3 gap-3 rounded-2xl bg-slate-50 p-3 text-center text-sm font-black">
          <div>
            <p className="text-slate-400">From</p>
            <p className="text-[#0B3D91]">{compactCurrency(starting || 0)}</p>
          </div>

          <div>
            <p className="text-slate-400">Available</p>
            <p className="text-[#12B76A]">{venture.availableUnits || 0}</p>
          </div>

          <div>
            <p className="text-slate-400">Booked</p>
            <p className="text-[#EF4444]">{venture.bookedUnits || 0}</p>
          </div>
        </div>

        <div className="mt-5 grid gap-3 sm:grid-cols-2">
          <Link to={`/customer/ventures/${venture.id}`}>
            <PrimaryButton className="w-full">View Layout</PrimaryButton>
          </Link>

          <Link to={`/customer/contact-us?ventureId=${venture.id}&type=enquiry`}>
            <PrimaryButton variant="outline" className="w-full">
              Enquire Now
            </PrimaryButton>
          </Link>
        </div>
      </div>
    </article>
  );
}

export default function CustomerHome() {
  const [ventures, setVentures] = useState([]);
  const [properties, setProperties] = useState([]);
  const [available, setAvailable] = useState([]);
  const [gallery, setGallery] = useState([]);
  const [ventureAmenities, setVentureAmenities] = useState([]);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const hero = ventures[0];

  const loadHome = async () => {
    try {
      setLoading(true);
      setError('');

      const data = await customerHomeApi.getHome();

      setVentures(data.ventures || []);
      setProperties(data.properties || []);
      setAvailable(data.availableProperties || []);
      setGallery(data.gallery || []);
      setVentureAmenities(data.amenities || []);
    } catch (err) {
      setError(err.message || 'Unable to load customer home');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadHome();
  }, []);

  return (
    <main className="bg-[#F8FAFC]">
      <section className="relative overflow-hidden rounded-b-[36px] bg-gradient-to-br from-[#0B3D91] via-[#0B7A8F] to-[#12B76A] px-4 py-14 text-white lg:px-8 lg:py-16">
        <div className="absolute left-[-6rem] top-[-6rem] h-72 w-72 rounded-full bg-white/10 blur-2xl" />
        <div className="absolute bottom-[-8rem] right-[-8rem] h-96 w-96 rounded-full bg-white/10 blur-3xl" />

        <div className="relative mx-auto grid max-w-[1440px] items-center gap-10 lg:grid-cols-[1fr_0.9fr]">
          <motion.div
            initial={{ opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <span className="rounded-full bg-white/15 px-4 py-2 text-xs font-black uppercase tracking-[0.24em] ring-1 ring-white/20">
              Customer Portal
            </span>

            <h1 className="mt-6 max-w-4xl text-4xl font-black leading-tight sm:text-5xl xl:text-6xl">
              Explore Aurov Reality ventures, layouts, and available properties.
            </h1>

            <p className="mt-5 max-w-2xl text-base font-semibold leading-8 text-white/85">
              View venture images, amenities, location, available plots, flats,
              villas, gallery, and submit enquiries or booking requests directly
              from the customer portal.
            </p>

            <div className="mt-8 flex flex-wrap gap-3">
              <Link to="/customer/ventures">
                <PrimaryButton variant="green">
                  View Ventures <FiArrowRight />
                </PrimaryButton>
              </Link>

              <Link to="/customer/book-demo">
                <PrimaryButton variant="outline">Book Demo</PrimaryButton>
              </Link>

              <Link to="/customer/contact-us">
                <PrimaryButton variant="outline">Contact Us</PrimaryButton>
              </Link>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, scale: 0.96 }}
            animate={{ opacity: 1, scale: 1 }}
            className="overflow-hidden rounded-[30px] bg-white/12 p-3 ring-1 ring-white/20 backdrop-blur-xl"
          >
            <ImageWithFallback
              src={getVentureImage(hero)}
              alt={hero?.name || 'Premium Aurov real estate building'}
              className="h-[340px] w-full rounded-[24px] object-cover shadow-2xl lg:h-[460px]"
            />
          </motion.div>
        </div>
      </section>

      <section className="mx-auto max-w-[1440px] px-4 py-8 lg:px-8">
        {loading && (
          <div className="rounded-2xl bg-white p-5 text-sm font-black text-slate-500 shadow-sm">
            Loading customer home...
          </div>
        )}

        {error && (
          <div className="rounded-2xl border border-red-200 bg-red-50 p-5 text-sm font-black text-red-700">
            {error}
          </div>
        )}
      </section>

      {!loading && !error && (
        <>
          <section className="mx-auto max-w-[1440px] px-4 py-14 lg:px-8">
            <div className="mb-8 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
              <div>
                <p className="text-sm font-black uppercase tracking-[0.22em] text-[#0B7A8F]">
                  Featured Ventures
                </p>

                <h2 className="mt-2 text-3xl font-black text-slate-900">
                  Explore Aurov Reality projects
                </h2>
              </div>

              <Link
                to="/customer/ventures"
                className="text-sm font-black text-[#0B3D91]"
              >
                View all
              </Link>
            </div>

            <div className="grid gap-6 md:grid-cols-2">
              {ventures.map((venture) => (
                <VentureCard key={venture.id} venture={venture} />
              ))}

              {ventures.length === 0 && (
                <div className="rounded-[24px] border border-slate-200 bg-white p-6 text-sm font-bold text-slate-500 shadow-sm md:col-span-2">
                  No ventures available yet. New ventures created by MD/OH will
                  appear here automatically.
                </div>
              )}
            </div>
          </section>

          <section className="mx-auto max-w-[1440px] px-4 pb-14 lg:px-8">
            <div className="grid gap-6 lg:grid-cols-[0.75fr_1.25fr]">
              <div className="rounded-[24px] border border-slate-200 bg-white p-6 shadow-sm">
                <p className="text-sm font-black uppercase tracking-[0.22em] text-[#0B7A8F]">
                  About Venture
                </p>

                <h2 className="mt-2 text-3xl font-black text-slate-900">
                  Designed for transparent property decisions
                </h2>

                <p className="mt-4 text-sm font-semibold leading-7 text-slate-500">
                  Customer Home now uses backend database data from Ventures,
                  Properties, MD, OH, and Sales Manager modules. New ventures
                  and properties added by leadership appear here automatically.
                </p>

                <div className="mt-5 grid gap-3">
                  {[
                    'Live layout visibility',
                    'Direct enquiry and booking workflow',
                    'Location and amenity clarity',
                    'One backend database source',
                  ].map((item) => (
                    <p
                      key={item}
                      className="flex items-center gap-3 text-sm font-black text-slate-700"
                    >
                      <FiCheckCircle className="text-[#12B76A]" /> {item}
                    </p>
                  ))}
                </div>
              </div>

              <div className="rounded-[24px] border border-slate-200 bg-white p-6 shadow-sm">
                <p className="text-sm font-black uppercase tracking-[0.22em] text-[#0B7A8F]">
                  Amenities
                </p>

                <div className="mt-4 flex flex-wrap gap-3">
                  {ventureAmenities.map((item) => (
                    <span
                      key={item}
                      className="inline-flex items-center gap-2 rounded-2xl bg-[#EEF4FF] px-4 py-3 text-sm font-black text-[#0B3D91]"
                    >
                      <FiStar /> {item}
                    </span>
                  ))}

                  {ventureAmenities.length === 0 && (
                    <p className="text-sm font-bold text-slate-500">
                      Amenities will appear after ventures are added.
                    </p>
                  )}
                </div>
              </div>
            </div>
          </section>

          <section className="mx-auto max-w-[1440px] px-4 pb-14 lg:px-8">
            <div className="mb-6">
              <p className="text-sm font-black uppercase tracking-[0.22em] text-[#0B7A8F]">
                Available Properties
              </p>

              <h2 className="mt-2 text-3xl font-black text-slate-900">
                Plots, flats and villas
              </h2>
            </div>

            <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
              {available.slice(0, 6).map((property) => {
                const venture = ventures.find(
                  (item) => String(item.id) === String(property.ventureId)
                );

                return (
                  <article
                    key={property.id}
                    className="overflow-hidden rounded-[24px] border border-slate-200 bg-white shadow-sm"
                  >
                    <ImageWithFallback
                      src={getPropertyImage(property, ventures)}
                      alt={`${property.type} ${property.number}`}
                      className="h-48 w-full object-cover"
                    />

                    <div className="p-5">
                      <div className="flex items-start justify-between gap-3">
                        <div>
                          <p className="text-xs font-black uppercase tracking-[0.2em] text-[#0B7A8F]">
                            {property.type}
                          </p>

                          <h3 className="mt-1 text-xl font-black text-slate-900">
                            {property.type} {property.number}
                          </h3>
                        </div>

                        <StatusBadge status={property.status} />
                      </div>

                      <p className="mt-3 text-sm font-bold text-slate-500">
                        {venture?.name} · {property.area}
                      </p>

                      <p className="mt-3 text-2xl font-black text-[#0B3D91]">
                        {formatCurrency(property.price)}
                      </p>

                      <Link to={`/customer/properties/${property.id}`}>
                        <PrimaryButton className="mt-4 w-full">
                          View Details
                        </PrimaryButton>
                      </Link>
                    </div>
                  </article>
                );
              })}

              {available.length === 0 && (
                <div className="rounded-[24px] border border-slate-200 bg-white p-6 text-sm font-bold text-slate-500 shadow-sm md:col-span-2 xl:col-span-3">
                  No available properties yet.
                </div>
              )}
            </div>
          </section>

          <section className="mx-auto max-w-[1440px] px-4 pb-20 lg:px-8">
            <div className="mb-6">
              <p className="text-sm font-black uppercase tracking-[0.22em] text-[#0B7A8F]">
                Gallery
              </p>

              <h2 className="mt-2 text-3xl font-black text-slate-900">
                Venture and property images
              </h2>
            </div>

            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              {gallery.map(
                (image, index) => (
                  <ImageWithFallback
                    key={`${image}-${index}`}
                    src={image}
                    alt={`Aurov gallery ${index + 1}`}
                    className="h-52 w-full rounded-[24px] border border-slate-200 object-cover shadow-sm"
                  />
                )
              )}
            </div>
          </section>
        </>
      )}
    </main>
  );
}