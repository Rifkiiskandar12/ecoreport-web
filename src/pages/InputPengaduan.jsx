import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import DashboardLayout from '../components/DashboardLayout';
import LocationPicker from '../components/LocationPicker';
import { useAuth } from '../context/AuthContext';
import { Pengaduan } from '../models/Pengaduan';
import { pengaduanService, kategoriService } from '../services/pengaduanService';
import { validatePengaduanForm } from '../utils/validationPengaduan';

export default function InputPengaduan() {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [kategoriList, setKategoriList] = useState([]); // Array kategori
  const [form, setForm] = useState({ judul: '', deskripsi: '', lokasi: '', kategoriId: '' });
  const [foto, setFoto] = useState(null);
  const [isAnonim, setIsAnonim] = useState(false);
  const [koordinat, setKoordinat] = useState({ latitude: null, longitude: null });
  const [errors, setErrors] = useState({});
  const [loadingKategori, setLoadingKategori] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [serverError, setServerError] = useState('');
  const [success, setSuccess] = useState(false);

  // useEffect: ambil daftar kategori saat komponen mount
  useEffect(() => {
    async function loadKategori() {
      try {
        const data = await kategoriService.getAll();
        setKategoriList(data);
      } catch (err) {
        setServerError('Gagal memuat kategori: ' + err.message);
      } finally {
        setLoadingKategori(false);
      }
    }
    loadKategori();
  }, []);

  function handleChange(e) {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) setErrors((prev) => ({ ...prev, [name]: '' }));
  }

  function handleFotoChange(e) {
    const file = e.target.files[0];
    if (file) setFoto(file);
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setServerError('');
    setSuccess(false);

    const validationErrors = validatePengaduanForm(form);
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }

    setSubmitting(true);
    try {
      let fotoUrl = null;
      if (foto) {
        fotoUrl = await pengaduanService.uploadFoto(foto, user.id);
      }

      const pengaduanBaru = new Pengaduan({
        userId: user.id,
        kategoriId: form.kategoriId,
        judul: form.judul,
        deskripsi: form.deskripsi,
        lokasi: form.lokasi,
        fotoUrl,
        isAnonim,
        latitude: koordinat.latitude,
        longitude: koordinat.longitude,
      });

      await pengaduanService.create(pengaduanBaru);
      setSuccess(true);
      setTimeout(() => navigate('/pengaduan/tracking'), 1200);
    } catch (err) {
      setServerError('Gagal mengirim pengaduan: ' + err.message);
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <DashboardLayout>
      <div className="max-w-2xl mx-auto">
        <h2 className="text-lg sm:text-xl font-bold text-gray-800 mb-1">Buat Pengaduan Baru</h2>
        <p className="text-sm text-gray-500 mb-6">
          Laporkan masalah persampahan di lingkungan Anda
        </p>

        {success && (
          <div className="mb-4 text-sm text-green-700 bg-green-50 border border-green-200 rounded-lg px-3 py-2">
            Pengaduan berhasil dikirim, mengalihkan...
          </div>
        )}
        {serverError && (
          <div className="mb-4 text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg px-3 py-2">
            {serverError}
          </div>
        )}

        <form onSubmit={handleSubmit} noValidate className="bg-white rounded-bubble shadow-sm border border-gray-100 p-4 sm:p-6 space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Kategori</label>
            <select
              name="kategoriId"
              value={form.kategoriId}
              onChange={handleChange}
              disabled={loadingKategori}
              className={`w-full min-h-[44px] px-3 rounded-lg border ${
                errors.kategoriId ? 'border-red-400' : 'border-gray-300'
              } focus:outline-none focus:ring-2 focus:ring-primary bg-white`}
            >
              <option value="">{loadingKategori ? 'Memuat kategori...' : 'Pilih kategori'}</option>
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
              placeholder="Contoh: Sampah menumpuk di RT 03"
              className={`w-full min-h-[44px] px-3 rounded-lg border ${
                errors.judul ? 'border-red-400' : 'border-gray-300'
              } focus:outline-none focus:ring-2 focus:ring-primary`}
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
              placeholder="Contoh: Jl. Merdeka RT 03/RW 05"
              className={`w-full min-h-[44px] px-3 rounded-lg border ${
                errors.lokasi ? 'border-red-400' : 'border-gray-300'
              } focus:outline-none focus:ring-2 focus:ring-primary`}
            />
            {errors.lokasi && <p className="text-xs text-red-500 mt-1">{errors.lokasi}</p>}
          </div>

          <LocationPicker
            latitude={koordinat.latitude}
            longitude={koordinat.longitude}
            onChange={(lat, lng) => setKoordinat({ latitude: lat, longitude: lng })}
          />

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Deskripsi</label>
            <textarea
              name="deskripsi"
              value={form.deskripsi}
              onChange={handleChange}
              rows={4}
              placeholder="Jelaskan detail masalahnya..."
              className={`w-full px-3 py-2 rounded-lg border ${
                errors.deskripsi ? 'border-red-400' : 'border-gray-300'
              } focus:outline-none focus:ring-2 focus:ring-primary`}
            />
            {errors.deskripsi && <p className="text-xs text-red-500 mt-1">{errors.deskripsi}</p>}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Foto (opsional)</label>
            <input
              type="file"
              accept="image/*"
              onChange={handleFotoChange}
              className="w-full text-sm text-gray-600 file:mr-3 file:min-h-[44px] file:px-4 file:rounded-lg file:border-0 file:bg-green-50 file:text-primary file:font-medium"
            />
          </div>

          <label className="flex items-center gap-2 min-h-[44px] cursor-pointer">
            <input
              type="checkbox"
              checked={isAnonim}
              onChange={(e) => setIsAnonim(e.target.checked)}
              className="w-4 h-4 accent-primary"
            />
            <span className="text-sm text-gray-600">Kirim sebagai anonim (identitas disembunyikan)</span>
          </label>

          <button
            type="submit"
            disabled={submitting}
            className="w-full min-h-[44px] bg-primary hover:bg-primary/90 disabled:bg-primary/40 text-white font-medium rounded-lg transition-colors"
          >
            {submitting ? 'Mengirim...' : 'Kirim Pengaduan'}
          </button>
        </form>
      </div>
    </DashboardLayout>
  );
}