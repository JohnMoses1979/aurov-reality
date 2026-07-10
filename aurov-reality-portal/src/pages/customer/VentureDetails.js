import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { FiGrid, FiImage, FiMapPin } from 'react-icons/fi';
import PageHeader from '../../components/ui/PageHeader.js';
import PrimaryButton from '../../components/ui/PrimaryButton.js';
import { getFileUrl, ventureApi } from '../../services/api.js';

function normalizeAmenities(amenities) {
  if (Array.isArray(amenities)) {
    return amenities.map((item) => String(item).trim()).filter(Boolean);
  }

  return String(amenities || '')
    .split(',')
    .map((item) => item.trim())
    .filter(Boolean);
}

export default function VentureDetails() {
  const { id } = useParams();
  const [venture, setVenture] = useState(null);
  const [selectedImage, setSelectedImage] = useState('');
  const [message, setMessage] = useState('');

  useEffect(() => {
    const loadVenture = async () => {
      try {
        setMessage('');
        const res = await ventureApi.getById(id);
        const data = res.data;

        if (!data) {
          setMessage('Unable to load venture details.');
          return;
        }

        setVenture(data);

        const poster =
          data.image ||
          data.posterImageUrl ||
          data.images?.[0] ||
          data.galleryImageUrls?.[0] ||
          '';

        setSelectedImage(poster);
      } catch (error) {
        console.error(error);
        setMessage('Unable to load venture details.');
      }
    };

    loadVenture();
  }, [id]);

  if (message) {
    return (
      <div className="rounded-2xl bg-white p-5 text-sm font-bold text-red-600 shadow-sm">
        {message}
      </div>
    );
  }

  if (!venture) {
    return (
      <div className="rounded-2xl bg-white p-5 text-sm font-bold text-slate-500 shadow-sm">
        Loading venture details...
      </div>
    );
  }

  const poster = venture.image || venture.posterImageUrl || venture.images?.[0] || venture.galleryImageUrls?.[0] || '';
  const galleryImages = [
    ...(venture.images || []),
    ...(venture.galleryImageUrls || []),
  ].filter(Boolean);
  const allImages = Array.from(new Set([poster, ...galleryImages].filter(Boolean)));
  const amenities = normalizeAmenities(venture.amenities);

  return (
    <div>
      <PageHeader
        title={venture.name}
        subtitle="Customer venture details with poster image and additional venture gallery images."
        action={
          <Link to={`/customer/properties?ventureId=${venture.id}`}>
            <PrimaryButton>
              <FiGrid /> View Properties
            </PrimaryButton>
          </Link>
        }
      />

      <div className="overflow-hidden rounded-[32px] border border-slate-200 bg-white shadow-sm">
        <div className="relative h-[420px] overflow-hidden">
          <img
            src={getFileUrl(selectedImage || poster)}
            alt={venture.name}
            className="h-full w-full object-cover"
          />

          <div className="absolute inset-0 bg-gradient-to-t from-slate-950/70 via-transparent to-transparent" />

          <div className="absolute bottom-6 left-6 right-6">
            <span className="rounded-full bg-white/90 px-4 py-2 text-xs font-black text-[#0B3D91]">
              {venture.type || 'Venture'}
            </span>

            <h1 className="mt-4 text-4xl font-black text-white">
              {venture.name}
            </h1>

            <p className="mt-2 flex items-center gap-2 text-sm font-bold text-white/90">
              <FiMapPin /> {venture.location}
            </p>
          </div>
        </div>

        {allImages.length > 0 && (
          <div className="border-b border-slate-100 p-5">
            <div className="mb-3 flex items-center gap-2 text-sm font-black uppercase tracking-wider text-slate-500">
              <FiImage /> Venture Images
            </div>

            <div className="grid gap-3 sm:grid-cols-3 md:grid-cols-4 xl:grid-cols-6">
              {allImages.map((image, index) => (
                <button
                  key={`${image}-${index}`}
                  type="button"
                  onClick={() => setSelectedImage(image)}
                  className={`overflow-hidden rounded-2xl border-2 bg-slate-50 ${
                    selectedImage === image ? 'border-[#1E5EFF]' : 'border-slate-200'
                  }`}
                >
                  <img
                    src={getFileUrl(image)}
                    alt={`Venture image ${index + 1}`}
                    className="h-24 w-full object-cover"
                  />
                </button>
              ))}
            </div>
          </div>
        )}

        <div className="grid gap-6 p-6 lg:grid-cols-3">
          <div className="lg:col-span-2">
            <h2 className="text-xl font-black text-slate-900">Description</h2>
            <p className="mt-3 text-sm font-semibold leading-7 text-slate-600">
              {venture.description || 'No description available yet.'}
            </p>
          </div>

          <div>
            <h2 className="text-xl font-black text-slate-900">Amenities</h2>

            <div className="mt-3 flex flex-wrap gap-2">
              {amenities.length > 0 ? (
                amenities.map((item) => (
                  <span
                    key={item}
                    className="rounded-full bg-emerald-50 px-4 py-2 text-xs font-black text-emerald-700"
                  >
                    {item}
                  </span>
                ))
              ) : (
                <span className="text-sm font-bold text-slate-500">
                  No amenities added yet.
                </span>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
