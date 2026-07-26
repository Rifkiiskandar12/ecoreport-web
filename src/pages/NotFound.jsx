import { Link } from 'react-router-dom';

export default function NotFound() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 px-4 text-center">
      <p className="text-6xl font-bold text-primary mb-2">404</p>
      <h1 className="text-lg font-semibold text-gray-800 mb-1">Halaman tidak ditemukan</h1>
      <p className="text-sm text-gray-500 mb-6">
        Halaman yang kamu cari tidak tersedia atau sudah dipindahkan.
      </p>
      <Link
        to="/dashboard"
        className="min-h-[44px] px-5 flex items-center bg-primary hover:bg-primary/90 text-white text-sm font-medium rounded-bubble transition-colors"
      >
        Kembali ke Dashboard
      </Link>
    </div>
  );
}