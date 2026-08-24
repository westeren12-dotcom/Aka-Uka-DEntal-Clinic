import { useEffect, useState } from 'react';
import { adminsApi } from '../services/api';
import { roleColors, formatDate } from '../lib/utils';
import { Shield } from 'lucide-react';

interface AdminUser {
  id: string;
  telegramId: string;
  username: string;
  firstName: string;
  lastName: string;
  role: string;
  isActive: boolean;
  createdAt: string;
}

export default function AdminUsersPage() {
  const [admins, setAdmins] = useState<AdminUser[]>([]);
  const [loading, setLoading] = useState(true);

  const loadAdmins = () => {
    setLoading(true);
    adminsApi.list()
      .then((res) => setAdmins(res.data.data))
      .finally(() => setLoading(false));
  };

  useEffect(() => { loadAdmins(); }, []);

  const handleRoleChange = async (id: string, role: string) => {
    await adminsApi.updateRole(id, role);
    loadAdmins();
  };

  const handleToggleActive = async (id: string) => {
    await adminsApi.toggleActive(id);
    loadAdmins();
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <span className="text-sm text-gray-500">{admins.length} admin users</span>
        <div className="text-sm text-gray-500 flex items-center gap-2">
          <Shield className="w-4 h-4" />
          New admins can be registered via Telegram bot or API
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        {loading ? (
          <div className="flex items-center justify-center h-64"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div></div>
        ) : admins.length === 0 ? (
          <p className="text-center text-gray-500 py-12">No admin users</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Admin</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Telegram ID</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Role</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Joined</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {admins.map((admin) => (
                  <tr key={admin.id} className="hover:bg-gray-50">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 bg-primary-100 rounded-full flex items-center justify-center text-primary-700 font-bold text-sm">
                          {admin.firstName?.[0] || admin.username?.[0] || '?'}
                        </div>
                        <div>
                          <p className="text-sm font-medium text-gray-900">{admin.firstName} {admin.lastName}</p>
                          {admin.username && <p className="text-xs text-gray-500">@{admin.username}</p>}
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-600 font-mono">{admin.telegramId}</td>
                    <td className="px-4 py-3">
                      <select
                        value={admin.role}
                        onChange={(e) => handleRoleChange(admin.id, e.target.value)}
                        className={`text-xs font-medium px-2.5 py-1 rounded-full border-0 focus:ring-2 focus:ring-primary-500 ${roleColors[admin.role] || ''}`}
                      >
                        <option value="OWNER">OWNER</option>
                        <option value="MANAGER">MANAGER</option>
                        <option value="RECEPTIONIST">RECEPTIONIST</option>
                      </select>
                    </td>
                    <td className="px-4 py-3">
                      <button
                        onClick={() => handleToggleActive(admin.id)}
                        className={`w-10 h-5 rounded-full relative transition-colors ${admin.isActive ? 'bg-green-500' : 'bg-gray-300'}`}
                      >
                        <div className={`w-4 h-4 bg-white rounded-full absolute top-0.5 transition-transform ${admin.isActive ? 'translate-x-5' : 'translate-x-0.5'}`} />
                      </button>
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-600">{formatDate(admin.createdAt)}</td>
                    <td className="px-4 py-3 text-sm text-gray-500">
                      {admin.isActive ? 'Active' : 'Disabled'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Role descriptions */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Role Permissions</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="border border-purple-200 rounded-lg p-4">
            <h4 className="font-medium text-purple-700 mb-2">OWNER</h4>
            <p className="text-sm text-gray-600">Full access to all features including admin management and settings.</p>
          </div>
          <div className="border border-blue-200 rounded-lg p-4">
            <h4 className="font-medium text-blue-700 mb-2">MANAGER</h4>
            <p className="text-sm text-gray-600">Can manage appointments, patients, doctors, services, and view analytics.</p>
          </div>
          <div className="border border-green-200 rounded-lg p-4">
            <h4 className="font-medium text-green-700 mb-2">RECEPTIONIST</h4>
            <p className="text-sm text-gray-600">Can manage appointments and patients. Basic booking operations.</p>
          </div>
        </div>
      </div>
    </div>
  );
}
