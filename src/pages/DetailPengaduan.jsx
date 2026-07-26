import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import DashboardLayout from '../components/DashboardLayout';
import { MapContainer, TileLayer, Marker } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import { pengaduanService } from '../services/pengaduanService';
import { Pengaduan } from '../models/Pengaduan';

export default function DetailPengaduan() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [row, setRow] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    async function loadDetail() {
      setLoading(true);
      setError('');
      try {
        const data = await pengaduanService.getById(id);
        setRow(data);
      } catch (err) {
        setError('Gagal memuat detail: ' + err.message);
      } finally {
        setLoading(false);
      }
    }
    loadDetail();
  }, [id]);

  function formatTanggal(dateStr) {
    return new Date(dateStr).toLocaleDateString('id-ID', {
      day: 'numeric', month: 'long', year: 'numeric', hour: '2-digit', minute: '2-digit',
    });
  }

  return (
    <DashboardLayout>
      <button
        onClick={() => navigate(-1)}
        className="text-sm text-gray-500 hover:text-gray-700 mb-4 flex items-center gap-1"
      >
        ← Kembali
      </button>

      {loading ? (
        <div className="bg-white rounded-bubble border border-gray-100 p-8 text-center text-sm text-gray-400">
          Memuat detail...
        </div>
      ) : error ? (
        <div className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg px-3 py-2">
          {error}
        </div>
      ) : row ? (
        (() => {
          const p = Pengaduan.fromDb(row);
          return (
            <div className="max-w-2xl bg-white rounded-bubble shadow-sm border border-gray-100 p-4 sm:p-6">
              <div className="flex items-start justify-between gap-3 mb-4">
                <h2 className="text-lg font-bold text-gray-800">{p.judul}</h2>
                <span className={`shrink-0 px-2.5 py-1 rounded-full text-xs font-medium ${p.getStatusColor()}`}>
                  {p.getStatusLabel()}
                </span>
              </div>

              <dl className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm mb-4">
                <div>
                  <dt className="text-gray-400 text-xs">Pelapor</dt>
                  <dd className="text-gray-700 font-medium">
                    {p.getNamaPelapor(row.profiles?.nama_lengkap)}
                  </dd>
                </div>
                <div>
                  <dt className="text-gray-400 text-xs">Kategori</dt>
                  <dd className="text-gray-700 font-medium">{row.kategori?.nama || '-'}</dd>
                </div>
                <div>
                  <dt className="text-gray-400 text-xs">Lokasi</dt>
                  <dd className="text-gray-700 font-medium">{p.lokasi}</dd>
                </div>
                <div>
                  <dt className="text-gray-400 text-xs">Tanggal Lapor</dt>
                  <dd className="text-gray-700 font-medium">{formatTanggal(p.createdAt)}</dd>
                </div>
              </dl>

              <div className="mb-4">
                <p className="text-gray-400 text-xs mb-1">Deskripsi</p>
                <p className="text-gray-700 text-sm whitespace-pre-line">{p.deskripsi}</p>
              </div>

              {p.fotoUrl && (
                <div className="mb-4">
                  <p className="text-gray-400 text-xs mb-1">Foto Bukti</p>
                  <img
                    src={p.fotoUrl}
                    alt="Bukti pengaduan"
                    className="rounded-xl border border-gray-200 max-h-80 object-cover"
                  />
                </div>
              )}

              {p.latitude && p.longitude && (
                <div className="mb-4">
                  <p className="text-gray-400 text-xs mb-1">Lokasi di Peta</p>
                  <div className="rounded-bubble overflow-hidden border border-gray-200 h-56">
                    <MapContainer center={[p.latitude, p.longitude]} zoom={15} className="w-full h-full" dragging={false} scrollWheelZoom={false}>
                      <TileLayer
                        attribution='&copy; OpenStreetMap contributors'
                        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                      />
                      <Marker position={[p.latitude, p.longitude]} />
                    </MapContainer>
                  </div>
                </div>
              )}

              {row.catatan_petugas && (
                <div className="bg-blue-50 border border-blue-100 rounded-xl p-3">
                  <p className="text-xs text-secondary font-medium mb-1">Catatan Petugas</p>
                  <p className="text-sm text-blue-700">{row.catatan_petugas}</p>
                </div>
              )}
            </div>
          );
        })()
      ) : null}
    </DashboardLayout>
  );
}