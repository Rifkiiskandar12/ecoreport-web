import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import DashboardLayout from '../components/DashboardLayout';
import LoadingSpinner from '../components/LoadingSpinner';
import { useAuth } from '../context/AuthContext';
import { pengaduanService } from '../services/pengaduanService';

export default function TrackingStatus() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [pengaduanList, setPengaduanList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [deletingId, setDeletingId] = useState(null);
  const [search, setSearch] = useState('');
  const [filterStatus, setFilterStatus] = useState('semua');

  useEffect(() => {
    if (user) loadData();
  }, [user]);

  async function loadData() {
    setLoading(true);
    setError('');
    try {
      const data = await pengaduanService.getByUser(user.id);
      setPengaduanList(data);
    } catch (err) {
      setError('Gagal memuat data: ' + err.message);
    } finally {
      setLoading(false);
    }
  }

  async function handleDelete(id, e) {
    e.stopPropagation();
    if (!confirm('Hapus pengaduan ini? Tindakan tidak bisa dibatalkan.')) return;
    setDeletingId(id);
    try {
      await pengaduanService.delete(id);
      setPengaduanList((prev) => prev.filter((p) => p.id !== id));
    } catch (err) {
      setError('Gagal menghapus: ' + err.message);
    } finally {
      setDeletingId(null);
    }
  }

  function formatTanggal(dateStr) {
    return new Date(dateStr).toLocaleDateString('id-ID', {
      day: 'numeric', month: 'short', year: 'numeric',
    });
  }

  // Filter berdasarkan judul/lokasi (search) dan status
  const filteredList = pengaduanList.filter((p) => {
    const cocokSearch =
      p.judul.toLowerCase().includes(search.toLowerCase()) ||
      p.lokasi.toLowerCase().includes(search.toLowerCase());
    const cocokStatus = filterStatus === 'semua' || p.status === filterStatus;
    return cocokSearch && cocokStatus;
  });

  return (
    <DashboardLayout>
      <h2 className="text-lg sm:text-xl font-bold text-gray-800 mb-1">Tracking Status Pengaduan</h2>
      <p className="text-sm text-gray-500 mb-6">Riwayat dan status pengaduan yang pernah Anda buat</p>

      {error && (
        <div className="mb-4 text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg px-3 py-2">
          {error}
        </div>
      )}

      {/* Search & filter */}
      <div className="flex flex-col sm:flex-row gap-3 mb-4">
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Cari judul atau lokasi..."
          className="flex-1 min-h-[44px] px-3 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-primary"
        />
        <select
          value={filterStatus}
          onChange={(e) => setFilterStatus(e.target.value)}
          className="min-h-[44px] px-3 rounded-lg border border-gray-300 bg-white focus:outline-none focus:ring-2 focus:ring-primary"
        >
          <option value="semua">Semua Status</option>
          <option value="menunggu">Menunggu</option>
          <option value="diproses">Diproses</option>
          <option value="selesai">Selesai</option>
          <option value="ditolak">Ditolak</option>
        </select>
      </div>

      <div className="bg-white rounded-bubble shadow-sm border border-gray-100 overflow-hidden">
        {loading ? (
          <LoadingSpinner label="Memuat data pengaduan..." />
        ) : filteredList.length === 0 ? (
          <div className="p-8 text-center text-sm text-gray-400">
            {pengaduanList.length === 0 ? 'Belum ada pengaduan' : 'Tidak ada hasil yang cocok'}
          </div>
        ) : (
          <>
            {/* Table untuk desktop */}
            <table className="w-full text-sm hidden sm:table">
              <thead>
                <tr className="bg-gray-50 text-left text-gray-500 text-xs uppercase">
                  <th className="px-4 py-3 font-medium">Judul</th>
                  <th className="px-4 py-3 font-medium">Kategori</th>
                  <th className="px-4 py-3 font-medium">Lokasi</th>
                  <th className="px-4 py-3 font-medium">Tanggal</th>
                  <th className="px-4 py-3 font-medium">Status</th>
                  <th className="px-4 py-3 font-medium">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {filteredList.map((p) => (
                  <tr key={p.id} onClick={() => navigate(`/pengaduan/${p.id}`)} className="hover:bg-gray-50 cursor-pointer">
                    <td className="px-4 py-3 text-gray-800 font-medium">{p.judul}</td>
                    <td className="px-4 py-3 text-gray-600">{p.kategori?.nama || '-'}</td>
                    <td className="px-4 py-3 text-gray-600">{p.lokasi}</td>
                    <td className="px-4 py-3 text-gray-500">{formatTanggal(p.createdAt)}</td>
                    <td className="px-4 py-3">
                      <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${p.getStatusColor()}`}>
                        {p.getStatusLabel()}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      {p.status === 'menunggu' && (
                        <button
                          onClick={(e) => handleDelete(p.id, e)}
                          disabled={deletingId === p.id}
                          className="text-xs text-danger hover:underline disabled:opacity-50"
                        >
                          {deletingId === p.id ? 'Menghapus...' : 'Hapus'}
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            {/* Card list untuk mobile */}
            <div className="sm:hidden divide-y divide-gray-100">
              {filteredList.map((p) => (
                <div key={p.id} onClick={() => navigate(`/pengaduan/${p.id}`)} className="p-4 cursor-pointer active:bg-gray-50">
                  <div className="flex items-start justify-between gap-2 mb-1">
                    <h3 className="font-medium text-gray-800 text-sm">{p.judul}</h3>
                    <span className={`shrink-0 px-2.5 py-1 rounded-full text-xs font-medium ${p.getStatusColor()}`}>
                      {p.getStatusLabel()}
                    </span>
                  </div>
                  <p className="text-xs text-gray-500">{p.kategori?.nama || '-'} • {p.lokasi}</p>
                  <div className="flex items-center justify-between mt-1">
                    <p className="text-xs text-gray-400">{formatTanggal(p.createdAt)}</p>
                    {p.status === 'menunggu' && (
                      <button
                        onClick={(e) => handleDelete(p.id, e)}
                        disabled={deletingId === p.id}
                        className="text-xs text-danger hover:underline disabled:opacity-50"
                      >
                        {deletingId === p.id ? 'Menghapus...' : 'Hapus'}
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </>
        )}
      </div>
    </DashboardLayout>
  );
}