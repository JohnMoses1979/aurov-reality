import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { FiArrowLeft, FiHome, FiMapPin } from 'react-icons/fi';
import PageHeader from '../../components/ui/PageHeader.js';
import PrimaryButton from '../../components/ui/PrimaryButton.js';
import StatusBadge from '../../components/ui/StatusBadge.js';
import { useAuth } from '../../context/AuthContext.js';
import { formatCurrency } from '../../utils/formatters.js';
import { getFileUrl, propertyApi, ventureApi } from '../../services/api.js';

function getBasePath(role = '') {
  return role === 'Operational Head' ? '/operational-head' : '/md';
}

export default function LeadershipPropertyDetails() {
  const { id } = useParams();
  const { user } = useAuth();
  const basePath = getBasePath(user?.role);

  const [property, setProperty] = useState(null);
  const [venture, setVenture] = useState(null);
  const [message, setMessage] = useState('');

  useEffect(() => {
    const load = async () => {
      try {
        setMessage('');
        const propertyRes = await propertyApi.getById(id);
        const nextProperty = propertyRes.data;
        setProperty(nextProperty || null);

        if (nextProperty?.ventureId) {
          const ventureRes = await ventureApi.getById(nextProperty.ventureId);
          setVenture(ventureRes.data || null);
        }
      } catch (error) {
        console.error(error);
        setMessage('Unable to load property details.');
      }
    };

    load();
  }, [id]);

  if (message) {
    return <div className="rounded-2xl bg-white p-5 text-sm font-bold text-red-600 shadow-sm">{message}</div>;
  }

  if (!property) {
    return <div className="rounded-2xl bg-white p-5 text-sm font-bold text-slate-500 shadow-sm">Loading property details...</div>;
  }

  const image = getFileUrl(property.image || property.imageUrl || venture?.posterImageUrl || venture?.image || '');

  return (
    <div>
      <PageHeader
        title={`${property.type} ${property.number}`}
        subtitle="View full property image, details, and venture information."
        action={
          <div className="flex flex-wrap gap-3">
            <Link to={`${basePath}/properties${property.ventureId ? `?ventureId=${property.ventureId}` : ''}`}>
              <PrimaryButton variant="outline">
                <FiArrowLeft /> Back to Properties
              </PrimaryButton>
            </Link>
            {property.ventureId && (
              <Link to={`${basePath}/ventures/${property.ventureId}`}>
                <PrimaryButton>
                  <FiHome /> Open Venture
                </PrimaryButton>
              </Link>
            )}
          </div>
        }
      />

      <div className="overflow-hidden rounded-[32px] border border-slate-200 bg-white shadow-sm">
        <div className="relative h-[420px] overflow-hidden">
          <img src={image} alt={`${property.type} ${property.number}`} className="h-full w-full object-cover" />
          <div className="absolute inset-0 bg-gradient-to-t from-slate-950/70 to-transparent" />
          <div className="absolute bottom-6 left-6 right-6">
            <div className="flex flex-wrap items-center gap-3">
              <span className="rounded-full bg-white/90 px-4 py-2 text-xs font-black text-[#0B3D91]">{property.type}</span>
              <StatusBadge status={property.status} />
            </div>
            <h1 className="mt-4 text-4xl font-black text-white">{property.number}</h1>
            <p className="mt-2 flex items-center gap-2 text-sm font-bold text-white/90">
              <FiMapPin /> {property.ventureName || venture?.name || 'Aurov Venture'}
            </p>
          </div>
        </div>

        <div className="grid gap-5 p-6 md:grid-cols-2 xl:grid-cols-4">
          <DetailCard label="Price" value={formatCurrency(property.price)} accent="text-[#0B3D91]" />
          <DetailCard label="Area" value={property.area} accent="text-slate-900" />
          <DetailCard label={property.type === 'Flat' ? 'BHK Type' : 'Facing'} value={property.type === 'Flat' ? property.bhkType || '-' : property.facing || '-'} accent="text-slate-900" />
          <DetailCard label="Status" value={property.status} accent="text-slate-900" />
        </div>

        <div className="grid gap-6 border-t border-slate-100 p-6 lg:grid-cols-[1.2fr_0.8fr]">
          <div>
            <h2 className="flex items-center gap-2 text-xl font-black text-slate-900">
              <FiHome /> Property More Details
            </h2>
            <div className="mt-4 grid gap-3 sm:grid-cols-2">
              <Field label="Venture" value={property.ventureName || venture?.name} />
              <Field label="Property Type" value={property.type} />
              <Field label="Number" value={property.number} />
              <Field label="Area" value={property.area} />
              <Field label="Facing" value={property.facing || '-'} />
              <Field label="Floor" value={property.floor || '-'} />
              <Field label="BHK Type" value={property.bhkType || '-'} />
              <Field label="Created By" value={property.createdBy || 'System'} />
            </div>
          </div>

          <div className="rounded-3xl border border-slate-200 p-5">
            <h3 className="text-lg font-black text-slate-900">Venture Information</h3>
            <p className="mt-3 text-sm font-semibold leading-6 text-slate-500">
              {venture?.description || 'This property belongs to the selected venture. Use Open Venture to see full venture layout and inventory details.'}
            </p>
            <div className="mt-5 space-y-3 text-sm font-bold text-slate-600">
              <div className="flex items-center justify-between gap-3 rounded-2xl bg-slate-50 px-4 py-3">
                <span>Location</span>
                <span className="text-right font-black text-slate-900">{venture?.location || '-'}</span>
              </div>
              <div className="flex items-center justify-between gap-3 rounded-2xl bg-slate-50 px-4 py-3">
                <span>Venture Type</span>
                <span className="text-right font-black text-slate-900">{venture?.type || '-'}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function DetailCard({ label, value, accent = 'text-slate-900' }) {
  return (
    <div className="rounded-3xl bg-slate-50 p-5">
      <p className="text-sm font-bold text-slate-500">{label}</p>
      <p className={`mt-2 text-2xl font-black ${accent}`}>{value || '-'}</p>
    </div>
  );
}

function Field({ label, value }) {
  return (
    <div className="rounded-2xl bg-slate-50 p-4">
      <p className="text-xs font-black uppercase tracking-wider text-slate-500">{label}</p>
      <p className="mt-2 text-sm font-black text-slate-900">{value || '-'}</p>
    </div>
  );
}
