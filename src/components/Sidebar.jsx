import { NavLink } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const menuItems = [
  { path: '/dashboard', label: 'Dashboard', icon: 'M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6' },
  { path: '/pengaduan/baru', label: 'Buat Pengaduan', icon: 'M12 4v16m8-8H4' },
  { path: '/pengaduan/tracking', label: 'Tracking Status', icon: 'M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2' },
  { path: '/kelola-user', label: 'Kelola User', icon: 'M17 20h5v-2a4 4 0 00-3-3.87M9 20H4v-2a4 4 0 013-3.87m6-4a4 4 0 10-4-4 4 4 0 004 4zm6 0a4 4 0 10-4-4', adminOnly: true },
];

export default function Sidebar({ open, onClose }) {
  const { profile } = useAuth();

  return (
    <>
      {/* Overlay untuk mobile saat sidebar terbuka */}
      {open && (
        <div
          onClick={onClose}
          className="fixed inset-0 bg-black/40 z-30 lg:hidden"
        />
      )}

      <aside
        className={`fixed top-0 left-0 h-full w-64 bg-white border-r border-gray-200 z-40 transform transition-transform duration-200
          lg:translate-x-0 lg:static lg:z-0
          ${open ? 'translate-x-0' : '-translate-x-full'}`}
      >
        <div className="h-16 flex items-center px-6 border-b border-gray-200">
          <span className="font-bold text-primary text-lg">🗑️ Tanjungpura</span>
        </div>

        <nav className="p-3 space-y-1">
          {menuItems.map((item) => {
            // Sembunyikan menu "Buat Pengaduan" untuk petugas/admin
            if (item.path === '/pengaduan/baru' && profile?.role !== 'warga') return null;
            if (item.adminOnly && profile?.role !== 'admin') return null;

            return (
              <NavLink
                key={item.path}
                to={item.path}
                onClick={onClose}
                className={({ isActive }) =>
                  `flex items-center gap-3 min-h-[44px] px-3 rounded-lg text-sm font-medium transition-colors ${
                    isActive
                      ? 'bg-green-50 text-primary'
                      : 'text-gray-600 hover:bg-gray-100'
                  }`
                }
              >
                <svg className="w-5 h-5 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={item.icon} />
                </svg>
                {item.label}
              </NavLink>
            );
          })}
        </nav>
      </aside>
    </>
  );
}