import { useEffect, useState } from 'react';
import { dashboardApi, appointmentsApi } from '../services/api';
import { formatCurrency } from '../lib/utils';
import { Calendar, Users, DollarSign, TrendingDown, Ban, XCircle } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';

interface DashboardStats {
  todayAppointments: number;
  todayPatients: number;
  todayRevenue: number;
  monthlyRevenue: number;
  cancelledAppointments: number;
  noShows: number;
}

interface TodayAppointment {
  id: string;
  time: string;
  patient: { firstName: string; lastName: string };
  doctor: { name: string };
  service: { name: string };
  status: string;
}

const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899'];

export default function DashboardPage() {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [todayAppointments, setTodayAppointments] = useState<TodayAppointment[]>([]);
  const [weeklyRevenue, setWeeklyRevenue] = useState<{ day: string; revenue: number }[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      dashboardApi.stats(),
      appointmentsApi.today(),
      dashboardApi.weeklyRevenue(),
    ]).then(([statsRes, todayRes, weeklyRes]) => {
      setStats(statsRes.data.data);
      setTodayAppointments(todayRes.data.data);
      setWeeklyRevenue(weeklyRes.data.data);
    }).finally(() => setLoading(false));
  }, []);

  if (loading) {
    return <div className="flex items-center justify-center h-64"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div></div>;
  }

  const statCards = [
    { label: "Today's Appointments", value: stats?.todayAppointments ?? 0, icon: Calendar, color: 'bg-blue-500' },
    { label: "Today's Patients", value: stats?.todayPatients ?? 0, icon: Users, color: 'bg-green-500' },
    { label: "Today's Revenue", value: formatCurrency(stats?.todayRevenue ?? 0), icon: DollarSign, color: 'bg-yellow-500' },
    { label: "Monthly Revenue", value: formatCurrency(stats?.monthlyRevenue ?? 0), icon: TrendingDown, color: 'bg-purple-500' },
    { label: "Cancelled", value: stats?.cancelledAppointments ?? 0, icon: XCircle, color: 'bg-red-500' },
    { label: "No-Shows", value: stats?.noShows ?? 0, icon: Ban, color: 'bg-gray-500' },
  ];

  return (
    <div className="space-y-6">
      {/* Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {statCards.map((card) => (
          <div key={card.label} className="bg-white rounded-xl shadow-sm border border-gray-100 p-5">
            <div className="flex items-center gap-4">
              <div className={`${card.color} p-3 rounded-lg`}>
                <card.icon className="w-6 h-6 text-white" />
              </div>
              <div>
                <p className="text-sm text-gray-500">{card.label}</p>
                <p className="text-2xl font-bold text-gray-900">{card.value}</p>
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Weekly Revenue Chart */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Weekly Revenue</h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={weeklyRevenue}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis dataKey="day" fontSize={12} />
              <YAxis fontSize={12} />
              <Tooltip formatter={(value: number) => formatCurrency(value)} />
              <Bar dataKey="revenue" fill="#3b82f6" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Today's Appointments */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Today's Appointments</h3>
          {todayAppointments.length === 0 ? (
            <p className="text-gray-500 text-center py-8">No appointments today</p>
          ) : (
            <div className="space-y-3 max-h-[300px] overflow-y-auto">
              {todayAppointments.map((appt) => (
                <div key={appt.id} className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                  <div className="text-sm font-mono text-primary-600 font-bold w-14">{appt.time}</div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900 truncate">
                      {appt.patient.firstName} {appt.patient.lastName}
                    </p>
                    <p className="text-xs text-gray-500">{appt.service.name} — {appt.doctor.name}</p>
                  </div>
                  <span className={`px-2 py-1 text-xs rounded-full font-medium ${
                    appt.status === 'CONFIRMED' ? 'bg-green-100 text-green-800' :
                    appt.status === 'PENDING' ? 'bg-yellow-100 text-yellow-800' :
                    'bg-gray-100 text-gray-800'
                  }`}>
                    {appt.status}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
