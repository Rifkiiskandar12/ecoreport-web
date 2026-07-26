import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { validateLoginForm } from '../utils/validation';

export default function Login() {
  const { login, loginWithGoogle } = useAuth();
  const navigate = useNavigate();

  // useState: object untuk form data
  const [form, setForm] = useState({ email: '', password: '' });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [serverError, setServerError] = useState('');

  // Event handling: update form saat input berubah
  function handleChange(e) {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
    // hapus error field itu saat user mulai mengetik ulang
    if (errors[name]) setErrors((prev) => ({ ...prev, [name]: '' }));
  }

  // Async/await + error handling + loading state
  async function handleGoogleLogin() {
    setServerError('');
    try {
      await loginWithGoogle();
    } catch (err) {
      setServerError(err.message || 'Gagal login dengan Google');
    }
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setServerError('');

    const validationErrors = validateLoginForm(form);
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }

    setLoading(true);
    try {
      await login(form.email, form.password);
      navigate('/dashboard');
    } catch (err) {
      setServerError(err.message || 'Login gagal, periksa kembali email/password');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
      <div className="w-full max-w-md bg-white rounded-bubble shadow-sm p-6 sm:p-8">
        <div className="text-center mb-6">
          <h1 className="text-xl sm:text-2xl font-bold text-gray-800">
            Sistem Pengaduan Sampah
          </h1>
          <p className="text-sm text-gray-500 mt-1">Kelurahan Tanjungpura</p>
        </div>

        {serverError && (
          <div className="mb-4 text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg px-3 py-2">
            {serverError}
          </div>
        )}

        <form onSubmit={handleSubmit} noValidate className="space-y-4">
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
              placeholder="••••••••"
              className={`w-full min-h-[44px] px-3 rounded-lg border ${
                errors.password ? 'border-red-400' : 'border-gray-300'
              } focus:outline-none focus:ring-2 focus:ring-primary`}
            />
            {errors.password && <p className="text-xs text-red-500 mt-1">{errors.password}</p>}
          </div>

          <div className="text-right">
            <Link to="/forgot-password" className="text-xs text-secondary hover:underline">
              Lupa password?
            </Link>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full min-h-[44px] bg-primary hover:bg-primary/90 disabled:bg-primary/40 text-white font-medium rounded-lg transition-colors"
          >
            {loading ? 'Memproses...' : 'Masuk'}
          </button>
        </form>

        <div className="flex items-center gap-3 my-4">
          <div className="flex-1 h-px bg-gray-200" />
          <span className="text-xs text-gray-400">atau</span>
          <div className="flex-1 h-px bg-gray-200" />
        </div>

        <button
          type="button"
          onClick={handleGoogleLogin}
          className="w-full min-h-[44px] flex items-center justify-center gap-2 border border-gray-300 hover:bg-gray-50 rounded-lg text-sm font-medium text-gray-700"
        >
          <svg className="w-5 h-5" viewBox="0 0 24 24">
            <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
            <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
            <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
            <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
          </svg>
          Masuk dengan Google
        </button>

        <p className="text-center text-sm text-gray-500 mt-4">
          Belum punya akun?{' '}
          <Link to="/register" className="text-secondary hover:underline">
            Daftar
          </Link>
        </p>
      </div>
    </div>
  );
}