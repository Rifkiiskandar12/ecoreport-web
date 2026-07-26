import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from '../context/AuthContext';
import Login from '../pages/Login';
import Register from '../pages/Register';
import ForgotPassword from '../pages/ForgotPassword';
import ResetPassword from '../pages/ResetPassword';
import NotFound from '../pages/NotFound';
import KelolaUser from '../pages/KelolaUser';
import Dashboard from '../pages/Dashboard';
import InputPengaduan from '../pages/InputPengaduan';
import TrackingStatus from '../pages/TrackingStatus';
import DetailPengaduan from '../pages/DetailPengaduan';

// Middleware sederhana: cek user login sebelum akses halaman terproteksi
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

          <Route
            path="/dashboard"
            element={
              <ProtectedRoute>
                <Dashboard />
              </ProtectedRoute>
            }
          />
          <Route
            path="/pengaduan/baru"
            element={
              <ProtectedRoute>
                <InputPengaduan />
              </ProtectedRoute>
            }
          />
          <Route
            path="/pengaduan/tracking"
            element={
              <ProtectedRoute>
                <TrackingStatus />
              </ProtectedRoute>
            }
          />
          <Route
            path="/pengaduan/:id"
            element={
              <ProtectedRoute>
                <DetailPengaduan />
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

          <Route path="/" element={<Navigate to="/dashboard" replace />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  );
}