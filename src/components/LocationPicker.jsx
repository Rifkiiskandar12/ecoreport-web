import { useState, useEffect } from 'react';
import { MapContainer, TileLayer, Marker, useMap, useMapEvents } from 'react-leaflet';
import L from 'leaflet';

// Pakai icon dari CDN langsung (lebih stabil daripada import asset lewat bundler Vite)
const markerIcon = new L.Icon({
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41],
});

// Koordinat default: Kelurahan Tanjungpura (perkiraan pusat), sesuaikan jika perlu
const DEFAULT_CENTER = [-6.9, 107.55];

// Reverse geocoding: ubah koordinat jadi alamat pakai Nominatim (OpenStreetMap, gratis)
async function reverseGeocode(lat, lng) {
  try {
    const res = await fetch(
      `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&zoom=18&addressdetails=1`
    );
    const data = await res.json();
    return data.display_name || '';
  } catch {
    return '';
  }
}

function ClickHandler({ onSelect }) {
  useMapEvents({
    click(e) {
      onSelect(e.latlng.lat, e.latlng.lng);
    },
  });
  return null;
}

// Geser peta otomatis saat koordinat berubah dari luar (misal tombol GPS)
function RecenterMap({ latitude, longitude }) {
  const map = useMap();

  useEffect(() => {
    setTimeout(() => map.invalidateSize(), 100);
  }, [map]);

  if (latitude && longitude) {
    map.setView([latitude, longitude], 16);
  }
  return null;
}

export default function LocationPicker({ latitude, longitude, onChange, onAddressFound }) {
  const position = latitude && longitude ? [latitude, longitude] : DEFAULT_CENTER;
  const [locating, setLocating] = useState(false);
  const [gpsError, setGpsError] = useState('');

  // Bungkus onChange supaya setiap kali titik dipilih (klik/GPS), otomatis cari alamatnya
  async function handleSelect(lat, lng) {
    onChange(lat, lng);
    if (onAddressFound) {
      const alamat = await reverseGeocode(lat, lng);
      if (alamat) onAddressFound(alamat);
    }
  }

  function handleUseCurrentLocation() {
    if (!navigator.geolocation) {
      setGpsError('Browser tidak mendukung deteksi lokasi');
      return;
    }
    setLocating(true);
    setGpsError('');
    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        await handleSelect(pos.coords.latitude, pos.coords.longitude);
        setLocating(false);
      },
      (err) => {
        setGpsError(
          err.code === 1
            ? 'Izin lokasi ditolak, aktifkan izin lokasi di HP/browser kamu'
            : 'Gagal mendapatkan lokasi, coba lagi'
        );
        setLocating(false);
      },
      { enableHighAccuracy: true, timeout: 10000 }
    );
  }

  return (
    <div>
      <button
        type="button"
        onClick={handleUseCurrentLocation}
        disabled={locating}
        className="mb-2 min-h-[40px] px-3 flex items-center gap-2 text-sm text-primary border border-primary/30 bg-primary/5 hover:bg-primary/10 rounded-lg disabled:opacity-50"
      >
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
        {locating ? 'Mendeteksi lokasi...' : 'Gunakan Lokasi Saat Ini'}
      </button>
      {gpsError && <p className="text-xs text-danger mb-2">{gpsError}</p>}

      <div className="rounded-bubble overflow-hidden border border-gray-200 h-56">
        <MapContainer center={position} zoom={14} className="w-full h-full">
          <TileLayer
            attribution='&copy; OpenStreetMap contributors'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />
          <ClickHandler onSelect={handleSelect} />
          <RecenterMap latitude={latitude} longitude={longitude} />
          {latitude && longitude && <Marker position={[latitude, longitude]} icon={markerIcon} />}
        </MapContainer>
      </div>
      <p className="text-xs text-gray-400 mt-1">
        Klik pada peta atau gunakan tombol lokasi di atas — alamat akan terisi otomatis
      </p>
    </div>
  );
}