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
            onAddressFound={(alamat) => setForm((prev) => ({ ...prev, lokasi: alamat }))}
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
            <div className="flex flex-wrap gap-2">
              <label className="min-h-[44px] px-4 flex items-center gap-2 text-sm text-primary border border-primary/30 bg-primary/5 hover:bg-primary/10 rounded-lg cursor-pointer">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
                Ambil Foto
                <input type="file" accept="image/*" capture="environment" onChange={handleFotoChange} className="hidden" />
              </label>

              <label className="min-h-[44px] px-4 flex items-center gap-2 text-sm text-gray-600 border border-gray-300 hover:bg-gray-50 rounded-lg cursor-pointer">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14M14 8h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
                Pilih dari Galeri
                <input type="file" accept="image/*" onChange={handleFotoChange} className="hidden" />
              </label>
            </div>

            {foto && (
              <div className="mt-3 relative inline-block">
                <img src={URL.createObjectURL(foto)} alt="Preview" className="h-28 rounded-lg border border-gray-200 object-cover" />
                <button
                  type="button"
                  onClick={() => setFoto(null)}
                  className="absolute -top-2 -right-2 w-6 h-6 flex items-center justify-center bg-danger text-white rounded-full text-xs"
                >
                  ✕
                </button>
              </div>
            )}
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