import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { validateRegisterForm } from '../utils/validation';

export default function Register() {
  const { register } = useAuth();
  const navigate = useNavigate();

  const [form, setForm] = useState({
    namaLengkap: '', email: '', password: '', confirmPassword: '',
  });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [serverError, setServerError] = useState('');
  const [success, setSuccess] = useState(false);

  function handleChange(e) {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) setErrors((prev) => ({ ...prev, [name]: '' }));
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setServerError('');

    const validationErrors = validateRegisterForm(form);
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }

    setLoading(true);
    try {
      await register(form.email, form.password, form.namaLengkap);
      setSuccess(true);
      setTimeout(() => navigate('/login'), 1500);
    } catch (err) {
      setServerError(err.message || 'Registrasi gagal, coba lagi');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
      <div className="w-full max-w-md bg-white rounded-bubble shadow-sm p-6 sm:p-8">
        <div className="text-center mb-6">
          <h1 className="text-xl sm:text-2xl font-bold text-gray-800">Buat Akun</h1>
          <p className="text-sm text-gray-500 mt-1">Sistem Pengaduan Sampah Tanjungpura</p>
        </div>

        {success && (
          <div className="mb-4 text-sm text-green-700 bg-green-50 border border-green-200 rounded-lg px-3 py-2">
            Akun berhasil dibuat, mengalihkan ke login...
          </div>
        )}
        {serverError && (
          <div className="mb-4 text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg px-3 py-2">
            {serverError}
          </div>
        )}

        <form onSubmit={handleSubmit} noValidate className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Nama Lengkap</label>
            <input
              type="text"
              name="namaLengkap"
              value={form.namaLengkap}
              onChange={handleChange}
              placeholder="Nama sesuai KTP"
              className={`w-full min-h-[44px] px-3 rounded-lg border ${
                errors.namaLengkap ? 'border-red-400' : 'border-gray-300'
              } focus:outline-none focus:ring-2 focus:ring-primary`}
            />
            {errors.namaLengkap && <p className="text-xs text-red-500 mt-1">{errors.namaLengkap}</p>}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
            <input
              type="email"
              name="email"
              value={form.email}
              onChange={handleChange}
              placeholder="nama@email.com"
              className={`w-full min-h-[44px] px-3 rounded-lg border ${
                errors.email ? 'border-red-400' : 'border-gray-300'
              } focus:outline-none focus:ring-2 focus:ring-primary`}
            />
            {errors.email && <p className="text-xs text-red-500 mt-1">{errors.email}</p>}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Password</label>
            <input
              type="password"
              name="password"
              value={form.password}
              onChange={handleChange}
              placeholder="Minimal 6 karakter"
              className={`w-full min-h-[44px] px-3 rounded-lg border ${
                errors.password ? 'border-red-400' : 'border-gray-300'
              } focus:outline-none focus:ring-2 focus:ring-primary`}
            />
            {errors.password && <p className="text-xs text-red-500 mt-1">{errors.password}</p>}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Konfirmasi Password</label>
            <input
              type="password"
              name="confirmPassword"
              value={form.confirmPassword}
              onChange={handleChange}
              placeholder="Ulangi password"
              className={`w-full min-h-[44px] px-3 rounded-lg border ${
                errors.confirmPassword ? 'border-red-400' : 'border-gray-300'
              } focus:outline-none focus:ring-2 focus:ring-primary`}
            />
            {errors.confirmPassword && <p className="text-xs text-red-500 mt-1">{errors.confirmPassword}</p>}
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full min-h-[44px] bg-primary hover:bg-primary/90 disabled:bg-primary/40 text-white font-medium rounded-lg transition-colors"
          >
            {loading ? 'Memproses...' : 'Daftar'}
          </button>
        </form>

        <p className="text-center text-sm text-gray-500 mt-4">
          Sudah punya akun?{' '}
          <Link to="/login" className="text-secondary hover:underline">
            Masuk
          </Link>
        </p>
      </div>
    </div>
  );
}