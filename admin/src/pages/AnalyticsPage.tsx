import { useEffect, useState } from 'react';
import { dashboardApi } from '../services/api';
import { formatCurrency } from '../lib/utils';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, LineChart, Line, Legend } from 'recharts';

const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899', '#06b6d4'];

export default function AnalyticsPage() {
  const [revenue, setRevenue] = useState<any>(null);
  const [appointments, setAppointments] = useState<any>(null);
  const [weeklyRevenue, setWeeklyRevenue] = useState<any[]>([]);
  const [patients, setPatients] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      dashboardApi.revenue(),
      dashboardApi.appointmentStats(),
      dashboardApi.weeklyRevenue(),
      dashboardApi.patientStats(),
    ]).then(([revRes, apptRes, weekRes, patRes]) => {
      setRevenue(revRes.data.data);
      setAppointments(apptRes.data.data);
      setWeeklyRevenue(weekRes.data.data);
      setPatients(patRes.data.data);
    }).finally(() => setLoading(false));
  }, []);

  if (loading) {
    return <div className="flex items-center justify-center h-64"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div></div>;
  }

  const appointmentPieData = appointments ? [
    { name: 'Completed', value: appointments.completed },
    { name: 'Cancelled', value: appointments.cancelled },
    { name: 'No-Show', value: appointments.noShow },
  ].filter(d => d.value > 0) : [];

  return (
    <div className="space-y-6">
      {/* Revenue Overview */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5">
          <p className="text-sm text-gray-500">Today's Revenue</p>
          <p className="text-2xl font-bold text-gray-900">{formatCurrency(revenue?.today ?? 0)}</p>
        </div>
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5">
          <p className="text-sm text-gray-500">Weekly Revenue</p>
          <p className="text-2xl font-bold text-gray-900">{formatCurrency(revenue?.week ?? 0)}</p>
        </div>
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5">
          <p className="text-sm text-gray-500">Monthly Revenue</p>
          <p className="text-2xl font-bold text-gray-900">{formatCurrency(revenue?.month ?? 0)}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Weekly Revenue Chart */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Revenue Trend</h3>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={weeklyRevenue}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis dataKey="day" fontSize={12} />
              <YAxis fontSize={12} />
              <Tooltip formatter={(value: number) => formatCurrency(value)} />
              <Legend />
              <Line type="monotone" dataKey="revenue" stroke="#3b82f6" strokeWidth={2} name="Revenue" />
            </LineChart>
          </ResponsiveContainer>
        </div>

        {/* Revenue by Service */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Revenue by Service</h3>
          {revenue?.byService?.length > 0 ? (
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={revenue.byService}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis dataKey="name" fontSize={11} />
                <YAxis fontSize={12} />
                <Tooltip formatter={(value: number) => formatCurrency(value)} />
                <Bar dataKey="revenue" name="Revenue" radius={[4, 4, 0, 0]}>
                  {revenue.byService.map((_: any, i: number) => (
                    <Cell key={i} fill={COLORS[i % COLORS.length]} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <p className="text-center text-gray-500 py-12">No revenue data</p>
          )}
        </div>

        {/* Appointment Stats */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Appointments (Month)</h3>
          <div className="grid grid-cols-2 gap-4 mb-4">
            <div className="bg-blue-50 rounded-lg p-3 text-center">
              <p className="text-2xl font-bold text-blue-700">{appointments?.total ?? 0}</p>
              <p className="text-xs text-blue-600">Total</p>
            </div>
            <div className="bg-green-50 rounded-lg p-3 text-center">
              <p className="text-2xl font-bold text-green-700">{appointments?.completed ?? 0}</p>
              <p className="text-xs text-green-600">Completed</p>
            </div>
            <div className="bg-red-50 rounded-lg p-3 text-center">
              <p className="text-2xl font-bold text-red-700">{appointments?.cancelled ?? 0}</p>
              <p className="text-xs text-red-600">Cancelled</p>
            </div>
            <div className="bg-gray-50 rounded-lg p-3 text-center">
              <p className="text-2xl font-bold text-gray-700">{appointments?.noShow ?? 0}</p>
              <p className="text-xs text-gray-600">No-Show</p>
            </div>
          </div>
          {appointmentPieData.length > 0 && (
            <ResponsiveContainer width="100%" height={200}>
              <PieChart>
                <Pie data={appointmentPieData} cx="50%" cy="50%" innerRadius={50} outerRadius={80} paddingAngle={5} dataKey="value" label={({ name, value }) => `${name}: ${value}`}>
                  {appointmentPieData.map((_: any, i: number) => (
                    <Cell key={i} fill={COLORS[i % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          )}
        </div>

        {/* Patient Stats */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Patient Statistics</h3>
          <div className="space-y-4">
            <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
              <span className="text-sm text-gray-600">Total Patients</span>
              <span className="text-lg font-bold text-gray-900">{patients?.total ?? 0}</span>
            </div>
            <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
              <span className="text-sm text-green-600">New Today</span>
              <span className="text-lg font-bold text-green-700">{patients?.newToday ?? 0}</span>
            </div>
            <div className="flex items-center justify-between p-3 bg-blue-50 rounded-lg">
              <span className="text-sm text-blue-600">Returning Today</span>
              <span className="text-lg font-bold text-blue-700">{patients?.returning ?? 0}</span>
            </div>
            <div className="flex items-center justify-between p-3 bg-purple-50 rounded-lg">
              <span className="text-sm text-purple-600">Today's Patients</span>
              <span className="text-lg font-bold text-purple-700">{patients?.todayPatients ?? 0}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
