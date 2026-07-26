import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from '../context/AuthContext';
import Login from '../pages/Login';
import Register from '../pages/Register';
import ForgotPassword from '../pages/ForgotPassword';
import ResetPassword from '../pages/ResetPassword';
import NotFound from '../pages/NotFound';
import KelolaUser from '../pages/KelolaUser';
import KelolaKategori from '../pages/KelolaKategori';
import Dashboard from '../pages/Dashboard';
import InputPengaduan from '../pages/InputPengaduan';
import EditPengaduan from '../pages/EditPengaduan';
import TrackingStatus from '../pages/TrackingStatus';
import DetailPengaduan from '../pages/DetailPengaduan';

// Middleware: hanya untuk aksi yang WAJIB login (buat/edit pengaduan, kelola data)
function ProtectedRoute({ children }) {
  const { user, loading } = useAuth();

  if (loading) {
    return <div className="min-h-screen flex items-center justify-center text-gray-400">Memuat...</div>;
  }
  if (!user) {
    return <Navigate to="/login" replace />;
  }
  return children;
}

function AdminRoute({ children }) {
  const { user, profile, loading } = useAuth();

  if (loading) {
    return <div className="min-h-screen flex items-center justify-center text-gray-400">Memuat...</div>;
  }
  if (!user) return <Navigate to="/login" replace />;
  if (profile?.role !== 'admin') return <Navigate to="/dashboard" replace />;
  return children;
}

export default function AppRouter() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />
          <Route path="/reset-password" element={<ResetPassword />} />

          {/* Bisa diakses tanpa login (guest / public view) */}
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/pengaduan/tracking" element={<TrackingStatus />} />
          <Route path="/pengaduan/:id" element={<DetailPengaduan />} />

          {/* Wajib login: aksi yang mengubah data */}
          <Route
            path="/pengaduan/baru"
            element={
              <ProtectedRoute>
                <InputPengaduan />
              </ProtectedRoute>
            }
          />
          <Route
            path="/pengaduan/edit/:id"
            element={
              <ProtectedRoute>
                <EditPengaduan />
              </ProtectedRoute>
            }
          />
          <Route
            path="/kelola-user"
            element={
              <AdminRoute>
                <KelolaUser />
              </AdminRoute>
            }
          />
          <Route
            path="/kelola-kategori"
            element={
              <ProtectedRoute>
                <KelolaKategori />
              </ProtectedRoute>
            }
          />

          <Route path="/" element={<Navigate to="/dashboard" replace />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  );
}