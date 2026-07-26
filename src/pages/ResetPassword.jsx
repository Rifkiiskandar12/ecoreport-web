import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { validatePassword } from '../utils/validation';

export default function ResetPassword() {
  const { updatePassword } = useAuth();
  const navigate = useNavigate();

  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [errors, setErrors] = useState({});
  const [serverError, setServerError] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    setServerError('');

    const newErrors = {};
    const passError = validatePassword(password);
    if (passError) newErrors.password = passError;
    if (password !== confirmPassword) newErrors.confirmPassword = 'Password tidak sama';

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }
    setErrors({});

    setLoading(true);
    try {
      await updatePassword(password);
      setSuccess(true);
      setTimeout(() => navigate('/login'), 1500);
    } catch (err) {
      setServerError(err.message || 'Gagal mengubah password');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
      <div className="w-full max-w-md bg-white rounded-bubble shadow-sm border border-gray-100 p-6 sm:p-8">
        <div className="text-center mb-6">
          <h1 className="text-xl font-bold text-gray-800">Buat Password Baru</h1>
        </div>

        {success ? (
          <div className="text-sm text-green-700 bg-green-50 border border-green-200 rounded-lg px-3 py-2">
            Password berhasil diubah, mengalihkan ke login...
          </div>
        ) : (
          <form onSubmit={handleSubmit} noValidate className="space-y-4">
            {serverError && (
              <div className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg px-3 py-2">
                {serverError}
              </div>
            )}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Password Baru</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
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
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Ulangi password baru"
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
              {loading ? 'Menyimpan...' : 'Simpan Password'}
            </button>
          </form>
        )}
      </div>
    </div>
  );
}