import { MapContainer, TileLayer, Marker, useMapEvents } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import markerIcon2x from 'leaflet/dist/images/marker-icon-2x.png';
import markerIcon from 'leaflet/dist/images/marker-icon.png';
import markerShadow from 'leaflet/dist/images/marker-shadow.png';

// Fix default icon Leaflet yang sering hilang di bundler Vite
L.Icon.Default.mergeOptions({
  iconRetinaUrl: markerIcon2x,
  iconUrl: markerIcon,
  shadowUrl: markerShadow,
});

// Koordinat default: Kelurahan Tanjungpura (perkiraan pusat), sesuaikan jika perlu
const DEFAULT_CENTER = [-6.9, 107.55];

function ClickHandler({ onSelect }) {
  useMapEvents({
    click(e) {
      onSelect(e.latlng.lat, e.latlng.lng);
    },
  });
  return null;
}

export default function LocationPicker({ latitude, longitude, onChange }) {
  const position = latitude && longitude ? [latitude, longitude] : DEFAULT_CENTER;

  return (
    <div>
      <div className="rounded-bubble overflow-hidden border border-gray-200 h-56">
        <MapContainer center={position} zoom={14} className="w-full h-full">
          <TileLayer
            attribution='&copy; OpenStreetMap contributors'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />
          <ClickHandler onSelect={onChange} />
          {latitude && longitude && <Marker position={[latitude, longitude]} />}
        </MapContainer>
      </div>
      <p className="text-xs text-gray-400 mt-1">
        Klik pada peta untuk menandai lokasi pengaduan (opsional)
      </p>
    </div>
  );
}