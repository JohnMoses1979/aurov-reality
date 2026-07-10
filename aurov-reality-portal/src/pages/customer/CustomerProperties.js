// import { Link, useSearchParams } from 'react-router-dom';

// import PrimaryButton from '../../components/ui/PrimaryButton.js';
// import StatusBadge from '../../components/ui/StatusBadge.js';
// import { formatCurrency } from '../../utils/formatters.js';
// import { useAppData } from '../../context/AppDataContext.js';

// const fallbackBuildingImage = '';

// function getVentureImage(venture) {
//   return venture?.image || venture?.images?.[0] || fallbackBuildingImage;
// }

// function getPropertyImage(property, venture) {
//   return property?.image || property?.images?.[0] || getVentureImage(venture);
// }

// export default function CustomerProperties() {
//   const { properties, ventures } = useAppData();
//   const [params] = useSearchParams();
//   const ventureId = params.get('ventureId');
//   const selectedVenture = ventures.find((venture) => venture.id === ventureId);
//   const visibleProperties = ventureId
//     ? properties.filter((property) => property.ventureId === ventureId)
//     : properties;
//   const venture = (id) => ventures.find((item) => item.id === id);

//   return (
//     <main className="mx-auto max-w-[1440px] px-4 py-12 lg:px-8">
//       <div className="mb-8 text-center">
//         <p className="text-sm font-black uppercase tracking-[0.22em] text-[#0B7A8F]">Properties</p>
//         <h1 className="mt-3 text-4xl font-black text-slate-900">
//           {selectedVenture ? `${selectedVenture.name} Properties` : 'Plots, Flats & Villas'}
//         </h1>
//         <p className="mx-auto mt-3 max-w-2xl text-sm font-semibold leading-6 text-slate-500">
//           All properties created by MD/OH or available in customer inventory appear here from the same shared Local Storage data.
//         </p>
//         {selectedVenture && (
//           <Link to={`/customer/ventures/${selectedVenture.id}`} className="mt-4 inline-flex text-sm font-black text-[#0B3D91]">
//             Back to venture details
//           </Link>
//         )}
//       </div>

//       <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-4">
//         {visibleProperties.map((property) => {
//           const propertyVenture = venture(property.ventureId);
//           return (
//             <article key={property.id} className="overflow-hidden rounded-[24px] border border-slate-200 bg-white shadow-sm transition hover:-translate-y-1 hover:shadow-xl hover:shadow-slate-900/10">
//               <img src={getFileUrl(getPropertyImage(property, propertyVenture))} alt={`${property.type} ${property.number}`} className="h-52 w-full object-cover" />
//               <div className="p-5">
//                 <div className="flex items-start justify-between gap-3">
//                   <div>
//                     <p className="text-xs font-black uppercase tracking-[0.22em] text-[#0B7A8F]">{property.type}</p>
//                     <h2 className="mt-2 text-2xl font-black text-slate-900">{property.number}</h2>
//                     <p className="mt-1 text-xs font-bold text-slate-500">{propertyVenture?.name || 'Aurov Venture'}</p>
//                   </div>
//                   <StatusBadge status={property.status} />
//                 </div>
//                 <div className="mt-5 rounded-3xl bg-gradient-to-br from-[#EEF4FF] to-[#ECFDF5] p-5">
//                   <p className="text-sm font-bold text-slate-500">Area</p>
//                   <p className="mt-1 text-xl font-black text-slate-900">{property.area}</p>
//                   <p className="mt-4 text-sm font-bold text-slate-500">{property.type === 'Flat' ? 'BHK Type' : 'Facing'}</p>
//                   <p className="mt-1 text-xl font-black text-slate-900">{property.type === 'Flat' ? property.bhkType || '-' : property.facing || '-'}</p>
//                 </div>
//                 <p className="mt-5 text-2xl font-black text-[#0B3D91]">{formatCurrency(property.price)}</p>
//                 <div className="mt-5 grid grid-cols-2 gap-2">
//                   <Link to={`/customer/properties/${property.id}`}><PrimaryButton variant="outline" className="w-full">Details</PrimaryButton></Link>
//                   <Link to={`/customer/book-property?propertyId=${property.id}`}><PrimaryButton variant="green" className="w-full" disabled={property.status === 'Sold'}>Reserve</PrimaryButton></Link>
//                 </div>
//               </div>
//             </article>
//           );
//         })}

//         {visibleProperties.length === 0 && (
//           <p className="rounded-2xl bg-white p-5 text-sm font-bold text-slate-500 shadow-sm md:col-span-2 xl:col-span-4">
//             No properties available for this venture yet.
//           </p>
//         )}
//       </div>
//     </main>
//   );
// }






import { useEffect, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';

import PrimaryButton from '../../components/ui/PrimaryButton.js';
import StatusBadge from '../../components/ui/StatusBadge.js';
import { formatCurrency } from '../../utils/formatters.js';
import { customerPropertiesApi, getFileUrl } from '../../services/api.js';

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

function getPropertyImage(property, venture) {
  return (
    property?.image ||
    property?.imageUrl ||
    property?.images?.[0] ||
    getVentureImage(venture)
  );
}

export default function CustomerProperties() {
  const [params] = useSearchParams();
  const ventureId = params.get('ventureId') || '';

  const [ventures, setVentures] = useState([]);
  const [visibleProperties, setVisibleProperties] = useState([]);
  const [selectedVenture, setSelectedVenture] = useState(null);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const loadProperties = async () => {
    try {
      setLoading(true);
      setError('');

      const data = await customerPropertiesApi.getPage(ventureId);

      setVentures(data.ventures || []);
      setVisibleProperties(data.properties || []);
      setSelectedVenture(data.selectedVenture || null);
    } catch (err) {
      setError(err.message || 'Unable to load properties');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadProperties();
  }, [ventureId]);

  const venture = (id) =>
    ventures.find((item) => String(item.id) === String(id));

  return (
    <main className="mx-auto max-w-[1440px] px-4 py-12 lg:px-8">
      <div className="mb-8 text-center">
        <p className="text-sm font-black uppercase tracking-[0.22em] text-[#0B7A8F]">
          Properties
        </p>

        <h1 className="mt-3 text-4xl font-black text-slate-900">
          {selectedVenture
            ? `${selectedVenture.name} Properties`
            : 'Plots, Flats & Villas'}
        </h1>

        <p className="mx-auto mt-3 max-w-2xl text-sm font-semibold leading-6 text-slate-500">
          All properties created by MD/OH or available in customer inventory
          appear here from the backend database.
        </p>

        {selectedVenture && (
          <Link
            to={`/customer/ventures/${selectedVenture.id}`}
            className="mt-4 inline-flex text-sm font-black text-[#0B3D91]"
          >
            Back to venture details
          </Link>
        )}
      </div>

      {loading && (
        <div className="rounded-2xl bg-white p-5 text-sm font-bold text-slate-500 shadow-sm">
          Loading properties...
        </div>
      )}

      {error && (
        <div className="rounded-2xl border border-red-200 bg-red-50 p-5 text-sm font-bold text-red-700 shadow-sm">
          {error}
        </div>
      )}

      {!loading && !error && (
        <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-4">
          {visibleProperties.map((property) => {
            const propertyVenture =
              venture(property.ventureId) || {
                name: property.ventureName,
              };

            return (
              <article
                key={property.id}
                className="overflow-hidden rounded-[24px] border border-slate-200 bg-white shadow-sm transition hover:-translate-y-1 hover:shadow-xl hover:shadow-slate-900/10"
              >
                <img
                  src={getFileUrl(getPropertyImage(property, propertyVenture))}
                  alt={`${property.type} ${property.number}`}
                  onError={(event) => {
                    event.currentTarget.onerror = null;
                    event.currentTarget.style.display = 'none';
                  }}
                  className="h-52 w-full object-cover"
                />

                <div className="p-5">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p className="text-xs font-black uppercase tracking-[0.22em] text-[#0B7A8F]">
                        {property.type}
                      </p>

                      <h2 className="mt-2 text-2xl font-black text-slate-900">
                        {property.number}
                      </h2>

                      <p className="mt-1 text-xs font-bold text-slate-500">
                        {property.ventureName ||
                          propertyVenture?.name ||
                          'Aurov Venture'}
                      </p>
                    </div>

                    <StatusBadge status={property.status} />
                  </div>

                  <div className="mt-5 rounded-3xl bg-gradient-to-br from-[#EEF4FF] to-[#ECFDF5] p-5">
                    <p className="text-sm font-bold text-slate-500">
                      Area
                    </p>

                    <p className="mt-1 text-xl font-black text-slate-900">
                      {property.area}
                    </p>

                    <p className="mt-4 text-sm font-bold text-slate-500">
                      {property.type === 'Flat' ? 'BHK Type' : 'Facing'}
                    </p>

                    <p className="mt-1 text-xl font-black text-slate-900">
                      {property.type === 'Flat'
                        ? property.bhkType || '-'
                        : property.facing || '-'}
                    </p>
                  </div>

                  <p className="mt-5 text-2xl font-black text-[#0B3D91]">
                    {formatCurrency(property.price)}
                  </p>

                  <div className="mt-5 grid grid-cols-2 gap-2">
                    <Link to={`/customer/properties/${property.id}`}>
                      <PrimaryButton variant="outline" className="w-full">
                        Details
                      </PrimaryButton>
                    </Link>

                    <Link
                      to={`/customer/book-property?propertyId=${property.id}&ventureId=${property.ventureId}`}
                    >
                      <PrimaryButton
                        variant="green"
                        className="w-full"
                        disabled={property.status === 'Sold'}
                      >
                        Reserve
                      </PrimaryButton>
                    </Link>
                  </div>
                </div>
              </article>
            );
          })}

          {visibleProperties.length === 0 && (
            <p className="rounded-2xl bg-white p-5 text-sm font-bold text-slate-500 shadow-sm md:col-span-2 xl:col-span-4">
              No properties available for this venture yet.
            </p>
          )}
        </div>
      )}
    </main>
  );
}