import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { validateEmail } from '../utils/validation';

export default function ForgotPassword() {
  const { resetPassword } = useAuth();
  const [email, setEmail] = useState('');
  const [error, setError] = useState('');
  const [serverError, setServerError] = useState('');
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    setServerError('');

    const emailError = validateEmail(email);
    if (emailError) {
      setError(emailError);
      return;
    }
    setError('');

    setLoading(true);
    try {
      await resetPassword(email);
      setSent(true);
    } catch (err) {
      setServerError(err.message || 'Gagal mengirim link reset password');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
      <div className="w-full max-w-md bg-white rounded-bubble shadow-sm border border-gray-100 p-6 sm:p-8">
        <div className="text-center mb-6">
          <h1 className="text-xl font-bold text-gray-800">Lupa Password</h1>
          <p className="text-sm text-gray-500 mt-1">
            Masukkan email untuk menerima link reset password
          </p>
        </div>

        {sent ? (
          <div className="text-sm text-green-700 bg-green-50 border border-green-200 rounded-lg px-3 py-2">
            Link reset password sudah dikirim ke email kamu. Silakan cek inbox (atau folder spam).
          </div>
        ) : (
          <form onSubmit={handleSubmit} noValidate className="space-y-4">
            {serverError && (
              <div className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg px-3 py-2">
                {serverError}
              </div>
            )}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
              <input
                type="email"
                value={email}
                onChange={(e) => { setEmail(e.target.value); setError(''); }}
                placeholder="nama@email.com"
                className={`w-full min-h-[44px] px-3 rounded-lg border ${
                  error ? 'border-red-400' : 'border-gray-300'
                } focus:outline-none focus:ring-2 focus:ring-primary`}
              />
              {error && <p className="text-xs text-red-500 mt-1">{error}</p>}
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full min-h-[44px] bg-primary hover:bg-primary/90 disabled:bg-primary/40 text-white font-medium rounded-lg transition-colors"
            >
              {loading ? 'Mengirim...' : 'Kirim Link Reset'}
            </button>
          </form>
        )}

        <p className="text-center text-sm text-gray-500 mt-4">
          <Link to="/login" className="text-secondary hover:underline">
            Kembali ke Login
          </Link>
        </p>
      </div>
    </div>
  );
}