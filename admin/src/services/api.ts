import axios from 'axios';

const api = axios.create({
  baseURL: '/api',
  timeout: 10000,
});

// Auth interceptor
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401 || error.response?.status === 403) {
      localStorage.removeItem('token');
      localStorage.removeItem('admin');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// Auth
export const authApi = {
  login: (data: { telegramId: number; password: string }) =>
    api.post('/auth/login', data),
  register: (data: { telegramId: number; password: string; username?: string; role?: string }) =>
    api.post('/auth/register', data),
  me: () => api.get('/auth/me'),
};

// Dashboard
export const dashboardApi = {
  stats: () => api.get('/dashboard/stats'),
  revenue: () => api.get('/dashboard/revenue'),
  weeklyRevenue: () => api.get('/dashboard/weekly-revenue'),
  appointmentStats: () => api.get('/dashboard/appointment-stats'),
  patientStats: () => api.get('/dashboard/patient-stats'),
  doctorStats: () => api.get('/dashboard/doctor-stats'),
};

// Appointments
export const appointmentsApi = {
  list: (params?: Record<string, string>) => api.get('/appointments', { params }),
  today: () => api.get('/appointments/today'),
  upcoming: () => api.get('/appointments/upcoming'),
  get: (id: string) => api.get(`/appointments/${id}`),
  create: (data: any) => api.post('/appointments', data),
  updateStatus: (id: string, status: string) => api.patch(`/appointments/${id}/status`, { status }),
  reschedule: (id: string, date: string, time: string) =>
    api.patch(`/appointments/${id}/reschedule`, { date, time }),
  cancel: (id: string) => api.delete(`/appointments/${id}`),
  slots: (doctorId: string, serviceId: string, date: string) =>
    api.get(`/appointments/slots/${doctorId}/${serviceId}/${date}`),
};

// Patients
export const patientsApi = {
  list: (params?: Record<string, string>) => api.get('/patients', { params }),
  stats: () => api.get('/patients/stats'),
  get: (id: string) => api.get(`/patients/${id}`),
};

// Doctors
export const doctorsApi = {
  list: () => api.get('/doctors'),
  active: () => api.get('/doctors/active'),
  get: (id: string) => api.get(`/doctors/${id}`),
  create: (data: any) => api.post('/doctors', data),
  update: (id: string, data: any) => api.put(`/doctors/${id}`, data),
  delete: (id: string) => api.delete(`/doctors/${id}`),
};

// Services
export const servicesApi = {
  list: () => api.get('/services'),
  active: () => api.get('/services/active'),
  get: (id: string) => api.get(`/services/${id}`),
  create: (data: any) => api.post('/services', data),
  update: (id: string, data: any) => api.put(`/services/${id}`, data),
  updatePrice: (id: string, price: number) => api.patch(`/services/${id}/price`, { price }),
  delete: (id: string) => api.delete(`/services/${id}`),
};

// Admins
export const adminsApi = {
  list: () => api.get('/admins'),
  get: (id: string) => api.get(`/admins/${id}`),
  updateRole: (id: string, role: string) => api.patch(`/admins/${id}/role`, { role }),
  toggleActive: (id: string) => api.patch(`/admins/${id}/toggle-active`),
};

// Settings
export const settingsApi = {
  get: () => api.get('/settings'),
  update: (key: string, value: string) => api.put('/settings', { key, value }),
  faqs: () => api.get('/settings/faqs'),
  createFaq: (data: any) => api.post('/settings/faqs', data),
  updateFaq: (id: string, data: any) => api.put(`/settings/faqs/${id}`, data),
  deleteFaq: (id: string) => api.delete(`/settings/faqs/${id}`),
};

export default api;
