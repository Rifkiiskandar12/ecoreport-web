import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import DashboardLayout from '../components/DashboardLayout';
import LocationPicker from '../components/LocationPicker';
import { useAuth } from '../context/AuthContext';
import { pengaduanService, kategoriService } from '../services/pengaduanService';
import { validatePengaduanForm } from '../utils/validationPengaduan';

export default function EditPengaduan() {
  const { id } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();

  const [kategoriList, setKategoriList] = useState([]);
  const [form, setForm] = useState({ judul: '', deskripsi: '', lokasi: '', kategoriId: '' });
  const [koordinat, setKoordinat] = useState({ latitude: null, longitude: null });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [serverError, setServerError] = useState('');
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    async function loadData() {
      setLoading(true);
      setServerError('');
      try {
        const [kategoriData, row] = await Promise.all([
          kategoriService.getAll(),
          pengaduanService.getById(id),
        ]);
        setKategoriList(kategoriData);

        // Hanya pemilik laporan & status masih menunggu yang boleh edit
        if (row.user_id !== user.id || row.status !== 'menunggu') {
          setServerError('Kamu tidak bisa mengedit laporan ini');
          return;
        }

        setForm({
          judul: row.judul,
          deskripsi: row.deskripsi,
          lokasi: row.lokasi,
          kategoriId: row.kategori_id,
        });
        setKoordinat({ latitude: row.latitude, longitude: row.longitude });
      } catch (err) {
        setServerError('Gagal memuat data: ' + err.message);
      } finally {
        setLoading(false);
      }
    }
    if (user) loadData();
  }, [id, user]);

  function handleChange(e) {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) setErrors((prev) => ({ ...prev, [name]: '' }));
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setServerError('');

    const validationErrors = validatePengaduanForm(form);
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }

    setSubmitting(true);
    try {
      await pengaduanService.update(id, {
        judul: form.judul,
        deskripsi: form.deskripsi,
        lokasi: form.lokasi,
        kategori_id: form.kategoriId,
        latitude: koordinat.latitude,
        longitude: koordinat.longitude,
      });
      setSuccess(true);
      setTimeout(() => navigate(`/pengaduan/${id}`), 1000);
    } catch (err) {
      setServerError('Gagal menyimpan perubahan: ' + err.message);
    } finally {
      setSubmitting(false);
    }
  }

  if (loading) {
    return (
      <DashboardLayout>
        <div className="p-8 text-center text-sm text-gray-400">Memuat data...</div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="max-w-2xl mx-auto">
        <h2 className="text-lg sm:text-xl font-bold text-gray-800 mb-1">Edit Pengaduan</h2>
        <p className="text-sm text-gray-500 mb-6">Ubah detail laporan yang masih berstatus menunggu</p>

        {success && (
          <div className="mb-4 text-sm text-green-700 bg-green-50 border border-green-200 rounded-lg px-3 py-2">
            Perubahan berhasil disimpan, mengalihkan...
          </div>
        )}
        {serverError && (
          <div className="mb-4 text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg px-3 py-2">
            {serverError}
          </div>
        )}

        {!serverError && (
          <form onSubmit={handleSubmit} noValidate className="bg-white rounded-bubble shadow-sm border border-gray-100 p-4 sm:p-6 space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Kategori</label>
              <select
                name="kategoriId"
                value={form.kategoriId}
                onChange={handleChange}
                className={`w-full min-h-[44px] px-3 rounded-lg border ${errors.kategoriId ? 'border-red-400' : 'border-gray-300'} focus:outline-none focus:ring-2 focus:ring-primary bg-white`}
              >
                <option value="">Pilih kategori</option>
                {kategoriList.map((k) => (
                  <option key={k.id} value={k.id}>{k.nama}</option>
                ))}
              </select>
              {errors.kategoriId && <p className="text-xs text-red-500 mt-1">{errors.kategoriId}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Judul</label>
              <input
                type="text"
                name="judul"
                value={form.judul}
                onChange={handleChange}
                className={`w-full min-h-[44px] px-3 rounded-lg border ${errors.judul ? 'border-red-400' : 'border-gray-300'} focus:outline-none focus:ring-2 focus:ring-primary`}
              />
              {errors.judul && <p className="text-xs text-red-500 mt-1">{errors.judul}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Lokasi</label>
              <input
                type="text"
                name="lokasi"
                value={form.lokasi}
                onChange={handleChange}
                className={`w-full min-h-[44px] px-3 rounded-lg border ${errors.lokasi ? 'border-red-400' : 'border-gray-300'} focus:outline-none focus:ring-2 focus:ring-primary`}
              />
              {errors.lokasi && <p className="text-xs text-red-500 mt-1">{errors.lokasi}</p>}
            </div>

            <LocationPicker
              latitude={koordinat.latitude}
              longitude={koordinat.longitude}
              onChange={(lat, lng) => setKoordinat({ latitude: lat, longitude: lng })}
              onAddressFound={(alamat) => setForm((prev) => ({ ...prev, lokasi: alamat }))}
            />

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Deskripsi</label>
              <textarea
                name="deskripsi"
                value={form.deskripsi}
                onChange={handleChange}
                rows={4}
                className={`w-full px-3 py-2 rounded-lg border ${errors.deskripsi ? 'border-red-400' : 'border-gray-300'} focus:outline-none focus:ring-2 focus:ring-primary`}
              />
              {errors.deskripsi && <p className="text-xs text-red-500 mt-1">{errors.deskripsi}</p>}
            </div>

            <button
              type="submit"
              disabled={submitting}
              className="w-full min-h-[44px] bg-primary hover:bg-primary/90 disabled:bg-primary/40 text-white font-medium rounded-lg transition-colors"
            >
              {submitting ? 'Menyimpan...' : 'Simpan Perubahan'}
            </button>
          </form>
        )}
      </div>
    </DashboardLayout>
  );
}