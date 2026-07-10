import { useEffect, useMemo, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { FiArrowLeft, FiCheckCircle, FiGrid, FiMapPin } from 'react-icons/fi';
import PageHeader from '../../components/ui/PageHeader.js';
import PrimaryButton from '../../components/ui/PrimaryButton.js';
import StatusBadge from '../../components/ui/StatusBadge.js';
import { useAuth } from '../../context/AuthContext.js';
import { compactCurrency, formatCurrency } from '../../utils/formatters.js';
import { getFileUrl, propertyApi, ventureApi } from '../../services/api.js';

function getBasePath(role = '') {
  return role === 'Operational Head' ? '/operational-head' : '/md';
}

function normalizeAmenities(amenities) {
  if (Array.isArray(amenities)) return amenities.filter(Boolean);
  if (!amenities) return [];
  return String(amenities)
    .split(',')
    .map((item) => item.trim())
    .filter(Boolean);
}

function getPropertyImage(property, venture) {
  return getFileUrl(
    property?.image ||
      property?.imageUrl ||
      venture?.posterImageUrl ||
      venture?.image ||
      ''
  );
}

export default function LeadershipVentureDetails() {
  const { id } = useParams();
  const { user } = useAuth();
  const basePath = getBasePath(user?.role);

  const [venture, setVenture] = useState(null);
  const [properties, setProperties] = useState([]);
  const [message, setMessage] = useState('');

  useEffect(() => {
    const load = async () => {
      try {
        setMessage('');
        const [ventureRes, propertyRes] = await Promise.all([
          ventureApi.getById(id),
          propertyApi.getAll(id),
        ]);
        setVenture(ventureRes.data || null);
        setProperties(propertyRes.data || []);
      } catch (error) {
        console.error(error);
        setMessage('Unable to load venture details.');
      }
    };

    load();
  }, [id]);

  const stats = useMemo(() => {
    const availableUnits = properties.filter((item) => item.status === 'Available').length;
    const bookedUnits = properties.filter((item) => ['Reserved', 'Sold', 'Booked'].includes(item.status)).length;
    const revenue = properties
      .filter((item) => ['Sold', 'Booked'].includes(item.status))
      .reduce((sum, item) => sum + Number(item.price || 0), 0);
    const totalUnits = properties.length;
    const progress = totalUnits ? Math.round((bookedUnits / totalUnits) * 100) : 0;
    return { availableUnits, bookedUnits, revenue, totalUnits, progress };
  }, [properties]);

  if (message) {
    return <div className="rounded-2xl bg-white p-5 text-sm font-bold text-red-600 shadow-sm">{message}</div>;
  }

  if (!venture) {
    return <div className="rounded-2xl bg-white p-5 text-sm font-bold text-slate-500 shadow-sm">Loading venture details...</div>;
  }

  const amenities = normalizeAmenities(venture.amenities);
  const heroImage = getFileUrl(venture.posterImageUrl || venture.image || '');
  const gallery = Array.from(
    new Set([
      heroImage,
      ...(venture.galleryImageUrls || []),
      ...(venture.images || []),
    ].map((item) => getFileUrl(item)).filter(Boolean))
  );

  return (
    <div>
      <PageHeader
        title={venture.name}
        subtitle="View full venture image, details, inventory, and property navigation."
        action={
          <div className="flex flex-wrap gap-3">
            <Link to={`${basePath}/ventures`}>
              <PrimaryButton variant="outline">
                <FiArrowLeft /> Back to Ventures
              </PrimaryButton>
            </Link>
            <Link to={`${basePath}/properties?ventureId=${venture.id}`}>
              <PrimaryButton>
                <FiGrid /> View Properties
              </PrimaryButton>
            </Link>
          </div>
        }
      />

      <div className="overflow-hidden rounded-[32px] border border-slate-200 bg-white shadow-sm">
        <div className="relative h-[420px] overflow-hidden">
          <img src={heroImage} alt={venture.name} className="h-full w-full object-cover" />
          <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 to-transparent" />
          <div className="absolute bottom-6 left-6 right-6">
            <span className="rounded-full bg-white/90 px-4 py-2 text-xs font-black text-[#0B3D91]">
              {venture.type || 'Venture'}
            </span>
            <h1 className="mt-4 text-4xl font-black text-white">{venture.name}</h1>
            <p className="mt-2 flex items-center gap-2 text-sm font-bold text-white/90">
              <FiMapPin /> {venture.location}
            </p>
          </div>
        </div>

        <div className="grid gap-5 p-6 md:grid-cols-2 xl:grid-cols-4">
          <InfoCard label="Available Units" value={String(stats.availableUnits)} accent="text-[#12B76A]" />
          <InfoCard label="Reserved / Sold" value={String(stats.bookedUnits)} accent="text-[#EF4444]" />
          <InfoCard label="Revenue" value={compactCurrency(stats.revenue)} accent="text-[#0B3D91]" />
          <InfoCard label="Progress" value={`${stats.progress}%`} accent="text-slate-900" />
        </div>

        <div className="grid gap-6 border-t border-slate-100 p-6 lg:grid-cols-[1.3fr_0.7fr]">
          <div>
            <h2 className="text-xl font-black text-slate-900">About Venture</h2>
            <p className="mt-4 text-sm font-semibold leading-7 text-slate-600">
              {venture.description || 'No description available.'}
            </p>

            <div className="mt-6 flex flex-wrap gap-2">
              {amenities.length > 0 ? amenities.map((amenity) => (
                <span key={amenity} className="inline-flex items-center gap-2 rounded-full bg-emerald-50 px-4 py-2 text-xs font-black text-emerald-700">
                  <FiCheckCircle /> {amenity}
                </span>
              )) : <span className="text-sm font-bold text-slate-500">No amenities added yet.</span>}
            </div>

            {gallery.length > 1 && (
              <div className="mt-8">
                <h3 className="text-lg font-black text-slate-900">Image Gallery</h3>
                <div className="mt-4 grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
                  {gallery.map((image, index) => (
                    <img key={`${image}-${index}`} src={image} alt={`${venture.name} ${index + 1}`} className="h-48 w-full rounded-3xl object-cover" />
                  ))}
                </div>
              </div>
            )}
          </div>

          <div className="rounded-3xl border border-slate-200 p-5">
            <h3 className="text-lg font-black text-slate-900">Quick Details</h3>
            <div className="mt-4 space-y-3 text-sm font-bold text-slate-600">
              <QuickDetail label="Type" value={venture.type || 'Venture'} />
              <QuickDetail label="Location" value={venture.location || '-'} />
              <QuickDetail label="Total Units" value={String(stats.totalUnits)} />
              <QuickDetail label="Created By" value={venture.createdBy || 'System'} />
              <QuickDetail label="Created At" value={venture.createdAt || '-'} />
            </div>
          </div>
        </div>
      </div>

      <div className="mt-6 rounded-[32px] border border-slate-200 bg-white p-6 shadow-sm">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h2 className="text-2xl font-black text-slate-900">Venture Properties</h2>
            <p className="mt-1 text-sm font-bold text-slate-500">All properties linked to this venture.</p>
          </div>
          <Link to={`${basePath}/properties?ventureId=${venture.id}`}>
            <PrimaryButton variant="outline">
              <FiGrid /> Open Property List
            </PrimaryButton>
          </Link>
        </div>

        <div className="mt-5 overflow-x-auto">
          <table className="min-w-[900px] w-full text-left">
            <thead>
              <tr className="border-b border-slate-200 text-xs font-black uppercase tracking-wider text-slate-500">
                <th className="py-4 pr-4">Property</th>
                <th className="py-4 pr-4">Area</th>
                <th className="py-4 pr-4">Price</th>
                <th className="py-4 pr-4">Status</th>
                <th className="py-4 pr-4">Action</th>
              </tr>
            </thead>
            <tbody>
              {properties.map((property) => (
                <tr key={property.id} className="border-b border-slate-100 text-sm font-bold text-slate-700">
                  <td className="py-4 pr-4">
                    <div className="flex items-center gap-3">
                      <img src={getPropertyImage(property, venture)} alt={`${property.type} ${property.number}`} className="h-14 w-16 rounded-2xl object-cover" />
                      <div>
                        <p className="font-black text-slate-900">{property.type} {property.number}</p>
                        <p className="text-xs text-slate-500">{property.facing || property.bhkType || '-'}</p>
                      </div>
                    </div>
                  </td>
                  <td className="py-4 pr-4">{property.area || '-'}</td>
                  <td className="py-4 pr-4 text-[#0B3D91]">{formatCurrency(property.price)}</td>
                  <td className="py-4 pr-4"><StatusBadge status={property.status} /></td>
                  <td className="py-4 pr-4">
                    <Link to={`${basePath}/properties/${property.id}`}>
                      <PrimaryButton variant="outline" className="py-2">View Details</PrimaryButton>
                    </Link>
                  </td>
                </tr>
              ))}
              {properties.length === 0 && (
                <tr>
                  <td colSpan="5" className="py-6 text-sm font-bold text-slate-500">No properties added for this venture yet.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

function InfoCard({ label, value, accent = 'text-slate-900' }) {
  return (
    <div className="rounded-3xl bg-slate-50 p-5">
      <p className="text-sm font-bold text-slate-500">{label}</p>
      <p className={`mt-2 text-2xl font-black ${accent}`}>{value || '-'}</p>
    </div>
  );
}

function QuickDetail({ label, value }) {
  return (
    <div className="flex items-center justify-between gap-3 rounded-2xl bg-slate-50 px-4 py-3">
      <span className="text-slate-500">{label}</span>
      <span className="text-right font-black text-slate-900">{value || '-'}</span>
    </div>
  );
}
