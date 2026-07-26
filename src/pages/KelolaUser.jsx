import { useState, useEffect } from 'react';
import DashboardLayout from '../components/DashboardLayout';
import { userService } from '../services/pengaduanService';

const ROLE_OPTIONS = ['warga', 'petugas', 'admin'];

export default function KelolaUser() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [updatingId, setUpdatingId] = useState(null);

  useEffect(() => {
    loadData();
  }, []);

  async function loadData() {
    setLoading(true);
    setError('');
    try {
      const data = await userService.getAll();
      setUsers(data);
    } catch (err) {
      setError('Gagal memuat data: ' + err.message);
    } finally {
      setLoading(false);
    }
  }

  async function handleChangeRole(id, role) {
    setUpdatingId(id);
    try {
      await userService.updateRole(id, role);
      setUsers((prev) => prev.map((u) => (u.id === id ? { ...u, role } : u)));
    } catch (err) {
      setError('Gagal update role: ' + err.message);
    } finally {
      setUpdatingId(null);
    }
  }

  return (
    <DashboardLayout>
      <h2 className="text-lg sm:text-xl font-bold text-gray-800 mb-1">Kelola User</h2>
      <p className="text-sm text-gray-500 mb-6">Atur peran (role) setiap pengguna sistem</p>

      {error && (
        <div className="mb-4 text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg px-3 py-2">
          {error}
        </div>
      )}

      <div className="bg-white rounded-bubble shadow-sm border border-gray-100 overflow-hidden">
        {loading ? (
          <div className="p-8 text-center text-sm text-gray-400">Memuat data...</div>
        ) : users.length === 0 ? (
          <div className="p-8 text-center text-sm text-gray-400">Belum ada user</div>
        ) : (
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-gray-50 text-left text-gray-500 text-xs uppercase">
                <th className="px-4 py-3 font-medium">Nama</th>
                <th className="px-4 py-3 font-medium">No. HP</th>
                <th className="px-4 py-3 font-medium">Role</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {users.map((u) => (
                <tr key={u.id} className="hover:bg-gray-50">
                  <td className="px-4 py-3 text-gray-800 font-medium">{u.nama_lengkap}</td>
                  <td className="px-4 py-3 text-gray-600">{u.no_hp || '-'}</td>
                  <td className="px-4 py-3">
                    <select
                      value={u.role}
                      disabled={updatingId === u.id}
                      onChange={(e) => handleChangeRole(u.id, e.target.value)}
                      className="min-h-[36px] text-xs border border-gray-300 rounded-lg px-2 focus:outline-none focus:ring-2 focus:ring-primary"
                    >
                      {ROLE_OPTIONS.map((r) => (
                        <option key={r} value={r}>{r}</option>
                      ))}
                    </select>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </DashboardLayout>
  );
}