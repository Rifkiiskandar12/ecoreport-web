import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function Navbar({ onToggleSidebar }) {
  const { profile, logout } = useAuth();
  const navigate = useNavigate();
  const [menuOpen, setMenuOpen] = useState(false);

  async function handleLogout() {
    try {
      await logout();
      navigate('/login');
    } catch (err) {
      console.error('Gagal logout:', err.message);
    }
  }

  return (
    <header className="h-16 bg-white border-b border-gray-200 flex items-center justify-between px-4 sm:px-6 sticky top-0 z-30">
      <div className="flex items-center gap-3">
        {/* Tombol buka sidebar - hanya tampil di mobile */}
        <button
          onClick={onToggleSidebar}
          className="lg:hidden min-w-[44px] min-h-[44px] flex items-center justify-center rounded-lg hover:bg-gray-100"
          aria-label="Buka menu"
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
          </svg>
        </button>
        <h1 className="font-bold text-gray-800 text-sm sm:text-lg">
          Pengaduan Sampah <span className="hidden sm:inline">- Tanjungpura</span>
        </h1>
      </div>

      <div className="relative">
        <button
          onClick={() => setMenuOpen((prev) => !prev)}
          className="flex items-center gap-2 min-h-[44px] px-2 rounded-lg hover:bg-gray-100"
        >
          <div className="w-9 h-9 rounded-full bg-primary text-white flex items-center justify-center font-semibold">
            {profile?.nama_lengkap?.charAt(0).toUpperCase() || 'U'}
          </div>
          <span className="hidden sm:block text-sm text-gray-700 font-medium">
            {profile?.nama_lengkap || 'User'}
          </span>
        </button>

        {menuOpen && (
          <div className="absolute right-0 mt-2 w-44 bg-white rounded-xl shadow-lg border border-gray-100 overflow-hidden">
            <div className="px-4 py-2 text-xs text-gray-500 border-b border-gray-100">
              {profile?.role || 'warga'}
            </div>
            <button
              onClick={handleLogout}
              className="w-full text-left px-4 py-3 text-sm text-red-500 hover:bg-red-50"
            >
              Keluar
            </button>
          </div>
        )}
      </div>
    </header>
  );
}