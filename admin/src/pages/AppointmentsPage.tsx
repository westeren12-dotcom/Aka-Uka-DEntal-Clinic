import { useEffect, useState } from 'react';
import { appointmentsApi } from '../services/api';
import { formatDate, statusColors } from '../lib/utils';
import { Check, X, Clock, RefreshCw } from 'lucide-react';

interface Appointment {
  id: string;
  date: string;
  time: string;
  status: string;
  notes: string;
  patient: { firstName: string; lastName: string; phoneNumber: string };
  doctor: { name: string; specialty: string };
  service: { name: string; price: string | number };
  payment?: { status: string; amount: string | number };
}

export default function AppointmentsPage() {
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');
  const [updating, setUpdating] = useState<string | null>(null);

  const loadAppointments = () => {
    setLoading(true);
    const params: Record<string, string> = { take: '100' };
    if (filter !== 'all') params.status = filter;
    appointmentsApi.list(params)
      .then((res) => setAppointments(res.data.data.appointments))
      .finally(() => setLoading(false));
  };

  useEffect(() => { loadAppointments(); }, [filter]);

  const updateStatus = async (id: string, status: string) => {
    setUpdating(id);
    try {
      await appointmentsApi.updateStatus(id, status);
      loadAppointments();
    } finally { setUpdating(null); }
  };

  const statuses = ['all', 'PENDING', 'CONFIRMED', 'COMPLETED', 'CANCELLED', 'NO_SHOW'];

  return (
    <div className="space-y-6">
      {/* Filters */}
      <div className="flex flex-wrap gap-2">
        {statuses.map((s) => (
          <button
            key={s}
            onClick={() => setFilter(s)}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              filter === s ? 'bg-primary-600 text-white' : 'bg-white border border-gray-200 text-gray-700 hover:bg-gray-50'
            }`}
          >
            {s === 'all' ? 'All' : s.replace('_', ' ')}
          </button>
        ))}
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        {loading ? (
          <div className="flex items-center justify-center h-64"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div></div>
        ) : appointments.length === 0 ? (
          <p className="text-center text-gray-500 py-12">No appointments found</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Date & Time</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Patient</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Doctor</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Service</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {appointments.map((appt) => (
                  <tr key={appt.id} className="hover:bg-gray-50">
                    <td className="px-4 py-3">
                      <p className="text-sm font-medium text-gray-900">{formatDate(appt.date)}</p>
                      <p className="text-xs text-gray-500">{appt.time}</p>
                    </td>
                    <td className="px-4 py-3">
                      <p className="text-sm font-medium text-gray-900">{appt.patient.firstName} {appt.patient.lastName}</p>
                      <p className="text-xs text-gray-500">{appt.patient.phoneNumber}</p>
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-900">{appt.doctor.name}</td>
                    <td className="px-4 py-3 text-sm text-gray-900">{appt.service.name}</td>
                    <td className="px-4 py-3">
                      <span className={`inline-flex px-2.5 py-0.5 rounded-full text-xs font-medium ${statusColors[appt.status] || ''}`}>
                        {appt.status}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex gap-1">
                        {appt.status === 'PENDING' && (
                          <button
                            onClick={() => updateStatus(appt.id, 'CONFIRMED')}
                            disabled={updating === appt.id}
                            className="p-1.5 text-green-600 hover:bg-green-50 rounded-lg"
                            title="Confirm"
                          >
                            <Check className="w-4 h-4" />
                          </button>
                        )}
                        {(appt.status === 'PENDING' || appt.status === 'CONFIRMED') && (
                          <button
                            onClick={() => updateStatus(appt.id, 'COMPLETED')}
                            disabled={updating === appt.id}
                            className="p-1.5 text-blue-600 hover:bg-blue-50 rounded-lg"
                            title="Complete"
                          >
                            <Clock className="w-4 h-4" />
                          </button>
                        )}
                        {(appt.status === 'PENDING' || appt.status === 'CONFIRMED') && (
                          <button
                            onClick={() => updateStatus(appt.id, 'CANCELLED')}
                            disabled={updating === appt.id}
                            className="p-1.5 text-red-600 hover:bg-red-50 rounded-lg"
                            title="Cancel"
                          >
                            <X className="w-4 h-4" />
                          </button>
                        )}
                      </div>
                    </td>
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
