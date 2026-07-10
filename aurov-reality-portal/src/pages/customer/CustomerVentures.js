import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { FiMapPin } from 'react-icons/fi';

import PrimaryButton from '../../components/ui/PrimaryButton.js';
import { compactCurrency } from '../../utils/formatters.js';
import { customerPropertiesApi, getFileUrl, ventureApi } from '../../services/api.js';

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

function getPropertyVentureId(property) {
  return property?.ventureId || property?.venture?.id || property?.venture?.ventureId || '';
}

function normalizeStatus(status) {
  return String(status || '').trim().toLowerCase();
}

function getStartingPrice(venture, properties) {
  if (Number(venture.startingPrice || 0) > 0) return Number(venture.startingPrice || 0);
  const prices = properties
    .filter((property) => String(getPropertyVentureId(property)) === String(venture.id))
    .map((property) => Number(property.price || 0))
    .filter(Boolean);
  return prices.length ? Math.min(...prices) : 0;
}

function normalizeAmenities(amenities) {
  if (Array.isArray(amenities)) {
    return amenities.map((item) => String(item).trim()).filter(Boolean);
  }

  return String(amenities || '')
    .split(',')
    .map((item) => item.trim())
    .filter(Boolean);
}

export default function CustomerVentures() {
  const [ventures, setVentures] = useState([]);
  const [properties, setProperties] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const loadVentures = async () => {
      try {
        setLoading(true);
        setError('');

        const [ventureRes, propertyPage] = await Promise.all([
          ventureApi.getAll(),
          customerPropertiesApi.getPage(),
        ]);

        setVentures(ventureRes?.data || []);
        setProperties(propertyPage?.properties || []);
      } catch (err) {
        setError(err.message || 'Unable to load ventures');
      } finally {
        setLoading(false);
      }
    };

    loadVentures();
  }, []);

  return (
    <main className="mx-auto max-w-[1440px] px-4 py-12 lg:px-8">
      <div className="mb-8 text-center">
        <p className="text-sm font-black uppercase tracking-[0.22em] text-[#0B7A8F]">Ventures</p>
        <h1 className="mt-3 text-4xl font-black text-slate-900">Explore Aurov Ventures</h1>
        <p className="mx-auto mt-3 max-w-2xl text-sm font-semibold leading-6 text-slate-500">
          Ventures shown here come directly from the backend. New ventures and
          properties added by leadership will appear automatically.
        </p>
      </div>

      {loading && (
        <div className="rounded-2xl bg-white p-5 text-sm font-bold text-slate-500 shadow-sm">
          Loading ventures...
        </div>
      )}

      {error && (
        <div className="mb-6 rounded-2xl border border-red-200 bg-red-50 p-5 text-sm font-bold text-red-700 shadow-sm">
          {error}
        </div>
      )}

      {!loading && !error && (
        <div className="grid gap-7 md:grid-cols-2">
          {ventures.map((venture) => {
            const ventureProperties = properties.filter(
              (property) => String(getPropertyVentureId(property)) === String(venture.id)
            );
            const amenities = normalizeAmenities(venture.amenities);
            const availableUnits = ventureProperties.filter(
              (property) => normalizeStatus(property.status) === 'available'
            ).length;
            const bookedUnits = ventureProperties.filter(
              (property) => normalizeStatus(property.status) && normalizeStatus(property.status) !== 'available'
            ).length;
            const startingPrice = getStartingPrice(venture, properties);
            const total =
              availableUnits + bookedUnits ||
              Number(venture.totalUnits || 0) ||
              availableUnits;

            return (
              <article
                key={venture.id}
                className="overflow-hidden rounded-[24px] border border-slate-200 bg-white shadow-sm transition hover:-translate-y-1 hover:shadow-xl hover:shadow-slate-900/10"
              >
                <div className="relative h-64 overflow-hidden">
                  <img
                    src={getFileUrl(getVentureImage(venture))}
                    alt={venture.name}
                    onError={(event) => {
                      event.currentTarget.onerror = null;
                      event.currentTarget.style.display = 'none';
                    }}
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
                    <h2 className="text-3xl font-black">{venture.name}</h2>
                    <p className="mt-2 flex items-center gap-2 text-sm font-bold text-white/85">
                      <FiMapPin /> {venture.location}
                    </p>
                  </div>
                </div>

                <div className="p-6">
                  <p className="min-h-[56px] text-base font-semibold leading-7 text-slate-500">{venture.description}</p>

                  <div className="mt-4 flex flex-wrap gap-2">
                    {amenities.slice(0, 5).map((amenity) => (
                      <span key={amenity} className="rounded-full bg-slate-100 px-3 py-1 text-xs font-bold text-slate-600">
                        {amenity}
                      </span>
                    ))}
                  </div>

                  <div className="mt-5 grid grid-cols-3 gap-3 rounded-2xl bg-slate-50 p-3 text-center text-sm font-black">
                    <div>
                      <p className="text-slate-400">From</p>
                      <p className="text-[#0B3D91]">{compactCurrency(startingPrice || 0)}</p>
                    </div>
                    <div>
                      <p className="text-slate-400">Available</p>
                      <p className="text-[#12B76A]">{availableUnits}</p>
                    </div>
                    <div>
                      <p className="text-slate-400">Total</p>
                      <p className="text-slate-700">{total || availableUnits}</p>
                    </div>
                  </div>

                  <div className="mt-5 grid gap-3 sm:grid-cols-2">
                    <Link to={`/customer/ventures/${venture.id}`}>
                      <PrimaryButton className="w-full">View Layout</PrimaryButton>
                    </Link>
                    <Link to={`/customer/contact-us?ventureId=${venture.id}&type=enquiry`}>
                      <PrimaryButton variant="outline" className="w-full">Enquire Now</PrimaryButton>
                    </Link>
                  </div>
                </div>
              </article>
            );
          })}

          {ventures.length === 0 && (
            <p className="rounded-2xl bg-white p-5 text-sm font-bold text-slate-500 shadow-sm md:col-span-2">
              No ventures created yet.
            </p>
          )}
        </div>
      )}
    </main>
  );
}



