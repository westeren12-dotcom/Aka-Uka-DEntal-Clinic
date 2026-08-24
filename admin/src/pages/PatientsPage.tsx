import { useEffect, useState } from 'react';
import { patientsApi } from '../services/api';
import { formatDate } from '../lib/utils';
import { Search } from 'lucide-react';

interface Patient {
  id: string;
  telegramId: string;
  firstName: string;
  lastName: string;
  username: string;
  phoneNumber: string;
  createdAt: string;
  appointments: { id: string }[];
}

export default function PatientsPage() {
  const [patients, setPatients] = useState<Patient[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  const loadPatients = () => {
    setLoading(true);
    const params: Record<string, string> = { take: '100' };
    if (search) params.search = search;
    patientsApi.list(params)
      .then((res) => {
        setPatients(res.data.data.patients);
        setTotal(res.data.data.total);
      })
      .finally(() => setLoading(false));
  };

  useEffect(() => { loadPatients(); }, [search]);

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search patients..."
            className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none text-sm"
          />
        </div>
        <span className="text-sm text-gray-500">{total} patients total</span>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        {loading ? (
          <div className="flex items-center justify-center h-64"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div></div>
        ) : patients.length === 0 ? (
          <p className="text-center text-gray-500 py-12">No patients found</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Patient</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Telegram</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Phone</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Appointments</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Joined</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {patients.map((p) => (
                  <tr key={p.id} className="hover:bg-gray-50">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 bg-primary-100 rounded-full flex items-center justify-center text-primary-700 font-bold text-sm">
                          {p.firstName?.[0] || '?'}
                        </div>
                        <div>
                          <p className="text-sm font-medium text-gray-900">{p.firstName} {p.lastName}</p>
                          {p.username && <p className="text-xs text-gray-500">@{p.username}</p>}
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-600">{String(p.telegramId)}</td>
                    <td className="px-4 py-3 text-sm text-gray-600">{p.phoneNumber || '—'}</td>
                    <td className="px-4 py-3 text-sm text-gray-600">{p.appointments.length}</td>
                    <td className="px-4 py-3 text-sm text-gray-600">{formatDate(p.createdAt)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
