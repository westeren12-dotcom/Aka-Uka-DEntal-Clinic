import { useEffect, useState } from 'react';
import { doctorsApi } from '../services/api';
import { Plus, Edit2, Trash2, X } from 'lucide-react';

interface Doctor {
  id: string;
  name: string;
  specialty: string;
  description: string;
  workingDays: string;
  workingHoursStart: string;
  workingHoursEnd: string;
  isActive: boolean;
  services: { service: { id: string; name: string } }[];
}

interface DoctorForm {
  name: string;
  specialty: string;
  description: string;
  workingDays: string;
  workingHoursStart: string;
  workingHoursEnd: string;
}

const emptyForm: DoctorForm = {
  name: '', specialty: '', description: '',
  workingDays: 'Mon,Tue,Wed,Thu,Fri',
  workingHoursStart: '09:00', workingHoursEnd: '18:00',
};

export default function DoctorsPage() {
  const [doctors, setDoctors] = useState<Doctor[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState<DoctorForm>(emptyForm);

  const loadDoctors = () => {
    setLoading(true);
    doctorsApi.list()
      .then((res) => setDoctors(res.data.data))
      .finally(() => setLoading(false));
  };

  useEffect(() => { loadDoctors(); }, []);

  const openCreate = () => { setForm(emptyForm); setEditingId(null); setShowModal(true); };
  const openEdit = (d: Doctor) => {
    setForm({
      name: d.name, specialty: d.specialty, description: d.description || '',
      workingDays: d.workingDays, workingHoursStart: d.workingHoursStart, workingHoursEnd: d.workingHoursEnd,
    });
    setEditingId(d.id);
    setShowModal(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (editingId) {
      await doctorsApi.update(editingId, form);
    } else {
      await doctorsApi.create(form);
    }
    setShowModal(false);
    loadDoctors();
  };

  const handleDelete = async (id: string) => {
    if (confirm('Are you sure you want to delete this doctor?')) {
      await doctorsApi.delete(id);
      loadDoctors();
    }
  };

  const handleToggleActive = async (doctor: Doctor) => {
    await doctorsApi.update(doctor.id, { isActive: !doctor.isActive });
    loadDoctors();
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <span className="text-sm text-gray-500">{doctors.length} doctors</span>
        <button onClick={openCreate} className="flex items-center gap-2 bg-primary-600 text-white px-4 py-2.5 rounded-lg text-sm font-medium hover:bg-primary-700 transition-colors">
          <Plus className="w-4 h-4" /> Add Doctor
        </button>
      </div>

      {loading ? (
        <div className="flex items-center justify-center h-64"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div></div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {doctors.map((doctor) => (
            <div key={doctor.id} className={`bg-white rounded-xl shadow-sm border p-5 ${doctor.isActive ? 'border-gray-100' : 'border-red-200 opacity-75'}`}>
              <div className="flex items-start justify-between mb-3">
                <div>
                  <h3 className="font-semibold text-gray-900">{doctor.name}</h3>
                  <p className="text-sm text-primary-600">{doctor.specialty}</p>
                </div>
                <button
                  onClick={() => handleToggleActive(doctor)}
                  className={`w-10 h-5 rounded-full relative transition-colors ${doctor.isActive ? 'bg-green-500' : 'bg-gray-300'}`}
                >
                  <div className={`w-4 h-4 bg-white rounded-full absolute top-0.5 transition-transform ${doctor.isActive ? 'translate-x-5' : 'translate-x-0.5'}`} />
                </button>
              </div>
              {doctor.description && <p className="text-sm text-gray-600 mb-3">{doctor.description}</p>}
              <div className="text-xs text-gray-500 space-y-1 mb-3">
                <p>📅 {doctor.workingDays}</p>
                <p>🕐 {doctor.workingHoursStart} - {doctor.workingHoursEnd}</p>
              </div>
              {doctor.services.length > 0 && (
                <div className="flex flex-wrap gap-1 mb-3">
                  {doctor.services.map((ds) => (
                    <span key={ds.service.id} className="px-2 py-0.5 bg-blue-50 text-blue-700 rounded-full text-xs">{ds.service.name}</span>
                  ))}
                </div>
              )}
              <div className="flex gap-2">
                <button onClick={() => openEdit(doctor)} className="flex items-center gap-1 text-sm text-gray-600 hover:text-primary-600">
                  <Edit2 className="w-3.5 h-3.5" /> Edit
                </button>
                <button onClick={() => handleDelete(doctor.id)} className="flex items-center gap-1 text-sm text-gray-600 hover:text-red-600">
                  <Trash2 className="w-3.5 h-3.5" /> Delete
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl max-w-lg w-full p-6 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold">{editingId ? 'Edit Doctor' : 'Add Doctor'}</h2>
              <button onClick={() => setShowModal(false)} className="p-2 hover:bg-gray-100 rounded-lg"><X className="w-4 h-4" /></button>
            </div>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Name</label>
                <input type="text" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 outline-none text-sm" required />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Specialty</label>
                <input type="text" value={form.specialty} onChange={(e) => setForm({ ...form, specialty: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 outline-none text-sm" required />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                <textarea value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 outline-none text-sm" rows={2} />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Working Days (comma-separated)</label>
                <input type="text" value={form.workingDays} onChange={(e) => setForm({ ...form, workingDays: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 outline-none text-sm" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Start Time</label>
                  <input type="time" value={form.workingHoursStart} onChange={(e) => setForm({ ...form, workingHoursStart: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 outline-none text-sm" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">End Time</label>
                  <input type="time" value={form.workingHoursEnd} onChange={(e) => setForm({ ...form, workingHoursEnd: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 outline-none text-sm" />
                </div>
              </div>
              <div className="flex gap-3 pt-2">
                <button type="submit" className="flex-1 bg-primary-600 text-white py-2.5 rounded-lg font-medium hover:bg-primary-700 transition-colors">
                  {editingId ? 'Update' : 'Create'}
                </button>
                <button type="button" onClick={() => setShowModal(false)} className="px-4 py-2.5 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors">
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
