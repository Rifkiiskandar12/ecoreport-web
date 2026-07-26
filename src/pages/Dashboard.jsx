import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import DashboardLayout from '../components/DashboardLayout';
import LoadingSpinner from '../components/LoadingSpinner';
import { useAuth } from '../context/AuthContext';
import { pengaduanService } from '../services/pengaduanService';
import { Pengaduan } from '../models/Pengaduan';

const STATUS_CARDS = [
  { key: 'menunggu', label: 'Menunggu', color: 'bg-amber-50 text-amber-700 border-amber-100' },
  { key: 'diproses', label: 'Diproses', color: 'bg-blue-50 text-blue-700 border-blue-100' },
  { key: 'selesai', label: 'Selesai', color: 'bg-green-50 text-green-700 border-green-100' },
  { key: 'ditotal', label: 'Total Laporan', color: 'bg-gray-50 text-gray-700 border-gray-100' },
];

export default function Dashboard() {
  const { profile } = useAuth();
  const navigate = useNavigate();
  const [rawData, setRawData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [updatingId, setUpdatingId] = useState(null);
  const [search, setSearch] = useState('');

  const isPetugas = profile?.role === 'petugas' || profile?.role === 'admin';

  useEffect(() => {
    loadData();
  }, []);

  async function loadData() {
    setLoading(true);
    setError('');
    try {
      const data = await pengaduanService.getAll();
      setRawData(data);
    } catch (err) {
      setError('Gagal memuat data: ' + err.message);
    } finally {
      setLoading(false);
    }
  }

  // Hitung rekap dari array pakai reduce (function + array)
  const stats = rawData.reduce(
    (acc, item) => {
      acc[item.status] = (acc[item.status] || 0) + 1;
      acc.ditotal += 1;
      return acc;
    },
    { menunggu: 0, diproses: 0, selesai: 0, ditotal: 0 }
  );

  async function handleUpdateStatus(id, newStatus) {
    setUpdatingId(id);
    try {
      await pengaduanService.updateStatus(id, newStatus);
      await loadData();
    } catch (err) {
      setError('Gagal update status: ' + err.message);
    } finally {
      setUpdatingId(null);
    }
  }

  // Filter pencarian judul/pelapor/lokasi
  const filteredData = rawData.filter((row) => {
    const keyword = search.toLowerCase();
    return (
      row.judul.toLowerCase().includes(keyword) ||
      row.lokasi.toLowerCase().includes(keyword) ||
      (row.profiles?.nama_lengkap || '').toLowerCase().includes(keyword)
    );
  });

  return (
    <DashboardLayout>
      <h2 className="text-lg sm:text-xl font-bold text-gray-800 mb-1">Dashboard Laporan</h2>
      <p className="text-sm text-gray-500 mb-6">Rekap pengaduan sampah Kelurahan Tanjungpura</p>

      {error && (
        <div className="mb-4 text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg px-3 py-2">
          {error}
        </div>
      )}

      {/* Kartu statistik */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 mb-6">
        {STATUS_CARDS.map((card) => (
          <div key={card.key} className={`rounded-bubble border p-4 ${card.color}`}>
            <p className="text-xs font-medium opacity-80">{card.label}</p>
            <p className="text-2xl font-bold mt-1">
              {loading ? '-' : stats[card.key]}
            </p>
          </div>
        ))}
      </div>

      {/* Tabel semua laporan */}
      <div className="bg-white rounded-bubble shadow-sm border border-gray-100 overflow-hidden">
        <div className="px-4 py-3 border-b border-gray-100 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <h3 className="font-semibold text-gray-800 text-sm">Semua Laporan</h3>
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Cari judul, lokasi, pelapor..."
            className="min-h-[40px] px-3 rounded-lg border border-gray-300 text-sm focus:outline-none focus:ring-2 focus:ring-primary sm:w-64"
          />
        </div>

        {loading ? (
          <div className="p-8 text-center text-sm text-gray-400"><LoadingSpinner label="Memuat laporan..." /></div>
        ) : filteredData.length === 0 ? (
          <div className="p-8 text-center text-sm text-gray-400">
            {rawData.length === 0 ? 'Belum ada laporan' : 'Tidak ada hasil yang cocok'}
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm min-w-[640px]">
              <thead>
                <tr className="bg-gray-50 text-left text-gray-500 text-xs uppercase">
                  <th className="px-4 py-3 font-medium">Judul</th>
                  <th className="px-4 py-3 font-medium">Pelapor</th>
                  <th className="px-4 py-3 font-medium">Kategori</th>
                  <th className="px-4 py-3 font-medium">Status</th>
                  {isPetugas && <th className="px-4 py-3 font-medium">Aksi</th>}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {filteredData.map((row) => {
                  const p = Pengaduan.fromDb(row);
                  return (
                    <tr key={row.id} onClick={() => navigate(`/pengaduan/${row.id}`)} className="hover:bg-gray-50 cursor-pointer">
                      <td className="px-4 py-3 text-gray-800 font-medium">{p.judul}</td>
                      <td className="px-4 py-3 text-gray-600">{p.getNamaPelapor(row.profiles?.nama_lengkap)}</td>
                      <td className="px-4 py-3 text-gray-600">{row.kategori?.nama || '-'}</td>
                      <td className="px-4 py-3">
                        <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${p.getStatusColor()}`}>
                          {p.getStatusLabel()}
                        </span>
                      </td>
                      {isPetugas && (
                        <td className="px-4 py-3" onClick={(e) => e.stopPropagation()}>
                          <select
                            value={row.status}
                            disabled={updatingId === row.id}
                            onChange={(e) => handleUpdateStatus(row.id, e.target.value)}
                            className="min-h-[36px] text-xs border border-gray-300 rounded-lg px-2 focus:outline-none focus:ring-2 focus:ring-primary"
                          >
                            <option value="menunggu">Menunggu</option>
                            <option value="diproses">Diproses</option>
                            <option value="selesai">Selesai</option>
                            <option value="ditolak">Ditolak</option>
                          </select>
                        </td>
                      )}
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}