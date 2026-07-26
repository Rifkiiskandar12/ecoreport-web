import { useState, useEffect } from 'react';
import DashboardLayout from '../components/DashboardLayout';
import LoadingSpinner from '../components/LoadingSpinner';
import { kategoriService } from '../services/pengaduanService';

export default function KelolaKategori() {
  const [list, setList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [form, setForm] = useState({ nama: '', deskripsi: '' });
  const [editingId, setEditingId] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    loadData();
  }, []);

  async function loadData() {
    setLoading(true);
    setError('');
    try {
      const data = await kategoriService.getAll();
      setList(data);
    } catch (err) {
      setError('Gagal memuat data: ' + err.message);
    } finally {
      setLoading(false);
    }
  }

  function handleEdit(kategori) {
    setEditingId(kategori.id);
    setForm({ nama: kategori.nama, deskripsi: kategori.deskripsi || '' });
  }

  function handleCancelEdit() {
    setEditingId(null);
    setForm({ nama: '', deskripsi: '' });
  }

  async function handleSubmit(e) {
    e.preventDefault();
    if (!form.nama.trim()) return;

    setSubmitting(true);
    setError('');
    try {
      if (editingId) {
        await kategoriService.update(editingId, form.nama, form.deskripsi);
      } else {
        await kategoriService.create(form.nama, form.deskripsi);
      }
      setForm({ nama: '', deskripsi: '' });
      setEditingId(null);
      await loadData();
    } catch (err) {
      setError('Gagal menyimpan: ' + err.message);
    } finally {
      setSubmitting(false);
    }
  }

  async function handleDelete(id) {
    if (!confirm('Hapus kategori ini?')) return;
    try {
      await kategoriService.delete(id);
      await loadData();
    } catch (err) {
      setError('Gagal menghapus (kemungkinan masih dipakai laporan): ' + err.message);
    }
  }

  return (
    <DashboardLayout>
      <h2 className="text-lg sm:text-xl font-bold text-gray-800 mb-1">Kelola Kategori</h2>
      <p className="text-sm text-gray-500 mb-6">Tambah, ubah, atau hapus kategori pengaduan</p>

      {error && (
        <div className="mb-4 text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg px-3 py-2">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="bg-white rounded-bubble shadow-sm border border-gray-100 p-4 sm:p-6 mb-6 space-y-3">
        <div className="grid sm:grid-cols-2 gap-3">
          <input
            type="text"
            placeholder="Nama kategori"
            value={form.nama}
            onChange={(e) => setForm((prev) => ({ ...prev, nama: e.target.value }))}
            className="min-h-[44px] px-3 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-primary"
          />
          <input
            type="text"
            placeholder="Deskripsi (opsional)"
            value={form.deskripsi}
            onChange={(e) => setForm((prev) => ({ ...prev, deskripsi: e.target.value }))}
            className="min-h-[44px] px-3 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-primary"
          />
        </div>
        <div className="flex gap-2">
          <button
            type="submit"
            disabled={submitting}
            className="min-h-[44px] px-5 bg-primary hover:bg-primary/90 disabled:bg-primary/40 text-white text-sm font-medium rounded-lg transition-colors"
          >
            {submitting ? 'Menyimpan...' : editingId ? 'Update Kategori' : 'Tambah Kategori'}
          </button>
          {editingId && (
            <button
              type="button"
              onClick={handleCancelEdit}
              className="min-h-[44px] px-5 border border-gray-300 text-gray-600 text-sm font-medium rounded-lg"
            >
              Batal
            </button>
          )}
        </div>
      </form>

      <div className="bg-white rounded-bubble shadow-sm border border-gray-100 overflow-hidden">
        {loading ? (
          <LoadingSpinner label="Memuat kategori..." />
        ) : list.length === 0 ? (
          <div className="p-8 text-center text-sm text-gray-400">Belum ada kategori</div>
        ) : (
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-gray-50 text-left text-gray-500 text-xs uppercase">
                <th className="px-4 py-3 font-medium">Nama</th>
                <th className="px-4 py-3 font-medium">Deskripsi</th>
                <th className="px-4 py-3 font-medium">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {list.map((k) => (
                <tr key={k.id} className="hover:bg-gray-50">
                  <td className="px-4 py-3 text-gray-800 font-medium">{k.nama}</td>
                  <td className="px-4 py-3 text-gray-600">{k.deskripsi || '-'}</td>
                  <td className="px-4 py-3 space-x-3">
                    <button onClick={() => handleEdit(k)} className="text-xs text-secondary hover:underline">
                      Edit
                    </button>
                    <button onClick={() => handleDelete(k.id)} className="text-xs text-danger hover:underline">
                      Hapus
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </DashboardLayout>
  );
}