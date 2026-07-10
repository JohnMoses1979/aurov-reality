import { useEffect, useRef, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { FiImage } from 'react-icons/fi';
import PageHeader from '../../components/ui/PageHeader.js';
import PrimaryButton from '../../components/ui/PrimaryButton.js';
import { getFileUrl, ventureApi } from '../../services/api.js';

export default function EditVenture() {
  const { id } = useParams();
  const navigate = useNavigate();

  const posterInputRef = useRef(null);
  const galleryInputRef = useRef(null);

  const [form, setForm] = useState({
    name: '',
    location: '',
    type: 'Plots + Villas',
    description: '',
    amenities: '',
    image: '',
    images: [],
  });

  const [posterFile, setPosterFile] = useState(null);
  const [galleryFiles, setGalleryFiles] = useState([]);
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const loadVenture = async () => {
      try {
        setLoading(true);
        const res = await ventureApi.getById(id);
        const venture = res.data;

        setForm({
          name: venture.name || '',
          location: venture.location || '',
          type: venture.type || 'Plots + Villas',
          description: venture.description || '',
          amenities: Array.isArray(venture.amenities)
            ? venture.amenities.join(', ')
            : venture.amenities || '',
          image: venture.image || venture.posterImageUrl || '',
          images: venture.images || venture.galleryImageUrls || [],
        });
      } catch (error) {
        console.error(error);
        setMessage('Unable to load venture details.');
      } finally {
        setLoading(false);
      }
    };

    loadVenture();
  }, [id]);

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

  const handlePosterImage = async (event) => {
    const file = event.target.files?.[0];
    event.target.value = '';

    if (!file) return;

    if (!isValidImage(file)) {
      setMessage('Only JPG, JPEG, PNG, and WEBP images are allowed.');
      return;
    }

    const preview = await fileToPreview(file);

    setPosterFile(file);
    setForm((old) => ({ ...old, image: preview }));
    setMessage('Poster image selected.');
  };

  const handleGalleryImages = async (event) => {
    const files = Array.from(event.target.files || []);
    event.target.value = '';

    if (!files.length) return;

    const invalidFile = files.find((file) => !isValidImage(file));

    if (invalidFile) {
      setMessage('Only JPG, JPEG, PNG, and WEBP images are allowed.');
      return;
    }

    const previews = await Promise.all(files.map(fileToPreview));

    setGalleryFiles((old) => [...old, ...files]);
    setForm((old) => ({
      ...old,
      images: [...old.images, ...previews],
    }));

    setMessage('More images selected.');
  };

  const removeGalleryImage = (index) => {
    setForm((old) => ({
      ...old,
      images: old.images.filter((_, i) => i !== index),
    }));

    setGalleryFiles((old) => old.filter((_, i) => i !== index));
  };

  const submit = async (event) => {
    event.preventDefault();

    if (
      !form.name.trim() ||
      !form.location.trim() ||
      !form.description.trim() ||
      !form.amenities.trim()
    ) {
      setMessage('Please fill all venture details.');
      return;
    }

    try {
      setLoading(true);

      const formData = new FormData();

      formData.append('name', form.name.trim());
      formData.append('location', form.location.trim());
      formData.append('type', form.type);
      formData.append('description', form.description.trim());
      formData.append('amenities', form.amenities.trim());

      if (posterFile) {
        formData.append('posterImage', posterFile);
      }

      galleryFiles.forEach((file) => {
        formData.append('galleryImages', file);
      });

      const existingGalleryImages = form.images.filter(
        (img) => typeof img === 'string' && !img.startsWith('data:')
      );

      formData.append(
        'existingGalleryImages',
        JSON.stringify(existingGalleryImages)
      );

      await ventureApi.update(id, formData);

      setMessage('Venture updated successfully.');
      navigate('/admin/ventures');
    } catch (error) {
      console.error(error);
      setMessage(
        error?.response?.data?.message || 'Unable to update venture.'
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <PageHeader
        title="Edit Venture Details"
        subtitle="Update venture details, poster image, and more customer gallery images."
      />

      {message && (
        <div className="mb-5 rounded-2xl border border-slate-200 bg-white p-4 text-sm font-bold text-slate-700 shadow-sm">
          {message}
        </div>
      )}

      <form
        onSubmit={submit}
        className="rounded-[30px] border border-slate-200 bg-white p-5 shadow-sm"
      >
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          <label>
            <span className="mb-2 block text-sm font-extrabold text-slate-700">
              Venture Name
            </span>
            <input
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              className="w-full rounded-2xl border border-slate-200 px-4 py-3 text-sm font-bold outline-none focus:border-[#1E5EFF]"
            />
          </label>

          <label>
            <span className="mb-2 block text-sm font-extrabold text-slate-700">
              Location
            </span>
            <input
              value={form.location}
              onChange={(e) => setForm({ ...form, location: e.target.value })}
              className="w-full rounded-2xl border border-slate-200 px-4 py-3 text-sm font-bold outline-none focus:border-[#1E5EFF]"
            />
          </label>

          <label>
            <span className="mb-2 block text-sm font-extrabold text-slate-700">
              Venture Type
            </span>
            <select
              value={form.type}
              onChange={(e) => setForm({ ...form, type: e.target.value })}
              className="w-full rounded-2xl border border-slate-200 px-4 py-3 text-sm font-bold outline-none focus:border-[#1E5EFF]"
            >
              <option>Plots + Villas</option>
              <option>Open Plots</option>
              <option>Premium Villas</option>
              <option>Flats</option>
            </select>
          </label>

          <div>
            <span className="mb-2 block text-sm font-extrabold text-slate-700">
              Poster Image
            </span>
            <input
              ref={posterInputRef}
              type="file"
              accept=".jpg,.jpeg,.png,.webp,image/jpeg,image/png,image/webp"
              onChange={handlePosterImage}
              className="hidden"
            />
            <button
              type="button"
              onClick={() => posterInputRef.current?.click()}
              className="flex w-full items-center justify-center gap-2 rounded-2xl border border-dashed border-[#0B7A8F] bg-[#F0FDFA] px-4 py-3 text-sm font-black text-[#0B7A8F]"
            >
              <FiImage /> Change Poster
            </button>
          </div>

          <div className="md:col-span-2">
            <span className="mb-2 block text-sm font-extrabold text-slate-700">
              Add More Images
            </span>
            <input
              ref={galleryInputRef}
              type="file"
              multiple
              accept=".jpg,.jpeg,.png,.webp,image/jpeg,image/png,image/webp"
              onChange={handleGalleryImages}
              className="hidden"
            />
            <button
              type="button"
              onClick={() => galleryInputRef.current?.click()}
              className="flex w-full items-center justify-center gap-2 rounded-2xl border border-dashed border-[#1E5EFF] bg-blue-50 px-4 py-3 text-sm font-black text-[#1E5EFF]"
            >
              <FiImage /> Upload Multiple Images
            </button>
          </div>

          <label className="md:col-span-2">
            <span className="mb-2 block text-sm font-extrabold text-slate-700">
              Description
            </span>
            <textarea
              rows="4"
              value={form.description}
              onChange={(e) =>
                setForm({ ...form, description: e.target.value })
              }
              className="w-full rounded-2xl border border-slate-200 px-4 py-3 text-sm font-bold outline-none focus:border-[#1E5EFF]"
            />
          </label>

          <label className="md:col-span-2">
            <span className="mb-2 block text-sm font-extrabold text-slate-700">
              Amenities
            </span>
            <textarea
              rows="4"
              value={form.amenities}
              onChange={(e) => setForm({ ...form, amenities: e.target.value })}
              className="w-full rounded-2xl border border-slate-200 px-4 py-3 text-sm font-bold outline-none focus:border-[#1E5EFF]"
            />
          </label>
        </div>

        {form.image && (
          <div className="mt-5 overflow-hidden rounded-[28px] border border-slate-200 bg-slate-50 p-3">
            <p className="mb-2 text-xs font-black uppercase tracking-wider text-slate-500">
              Poster Preview
            </p>
            <img
              src={getFileUrl(form.image)}
              alt="Poster preview"
              className="h-56 w-full rounded-2xl object-cover"
            />
          </div>
        )}

        {form.images.length > 0 && (
          <div className="mt-5 rounded-[28px] border border-slate-200 bg-slate-50 p-3">
            <p className="mb-3 text-xs font-black uppercase tracking-wider text-slate-500">
              More Images
            </p>

            <div className="grid gap-3 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4">
              {form.images.map((image, index) => (
                <div
                  key={`${image}-${index}`}
                  className="relative overflow-hidden rounded-2xl border border-slate-200 bg-white"
                >
                  <img
                    src={getFileUrl(image)}
                    alt={`Gallery ${index + 1}`}
                    className="h-36 w-full object-cover"
                  />

                  <button
                    type="button"
                    onClick={() => removeGalleryImage(index)}
                    className="absolute right-2 top-2 rounded-full bg-red-600 px-3 py-1 text-xs font-black text-white"
                  >
                    X
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        <div className="mt-5 flex gap-3">
          <PrimaryButton type="submit" variant="green" disabled={loading}>
            {loading ? 'Updating...' : 'Update Venture'}
          </PrimaryButton>

          <PrimaryButton
            type="button"
            variant="outline"
            onClick={() => navigate('/admin/ventures')}
          >
            Cancel
          </PrimaryButton>
        </div>
      </form>
    </div>
  );
}