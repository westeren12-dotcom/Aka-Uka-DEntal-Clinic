import { useEffect, useState } from 'react';
import { settingsApi } from '../services/api';
import { Plus, Edit2, Trash2, X, Save } from 'lucide-react';

interface FAQ {
  id: string;
  question: string;
  answer: string;
  category: string;
  isActive: boolean;
}

export default function SettingsPage() {
  const [settings, setSettings] = useState<Record<string, string>>({});
  const [faqs, setFaqs] = useState<FAQ[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [showFaqModal, setShowFaqModal] = useState(false);
  const [editingFaqId, setEditingFaqId] = useState<string | null>(null);
  const [faqForm, setFaqForm] = useState({ question: '', answer: '', category: '' });

  useEffect(() => {
    Promise.all([settingsApi.get(), settingsApi.faqs()])
      .then(([settingsRes, faqRes]) => {
        setSettings(settingsRes.data.data);
        setFaqs(faqRes.data.data);
      })
      .finally(() => setLoading(false));
  }, []);

  const handleSaveSettings = async () => {
    setSaving(true);
    try {
      for (const [key, value] of Object.entries(settings)) {
        await settingsApi.update(key, value);
      }
    } finally {
      setSaving(false);
    }
  };

  const handleSaveFaq = async (e: React.FormEvent) => {
    e.preventDefault();
    if (editingFaqId) {
      await settingsApi.updateFaq(editingFaqId, faqForm);
    } else {
      await settingsApi.createFaq(faqForm);
    }
    setShowFaqModal(false);
    const res = await settingsApi.faqs();
    setFaqs(res.data.data);
  };

  const handleDeleteFaq = async (id: string) => {
    if (confirm('Delete this FAQ?')) {
      await settingsApi.deleteFaq(id);
      setFaqs(faqs.filter(f => f.id !== id));
    }
  };

  const openEditFaq = (faq: FAQ) => {
    setFaqForm({ question: faq.question, answer: faq.answer, category: faq.category || '' });
    setEditingFaqId(faq.id);
    setShowFaqModal(true);
  };

  const openCreateFaq = () => {
    setFaqForm({ question: '', answer: '', category: '' });
    setEditingFaqId(null);
    setShowFaqModal(true);
  };

  if (loading) {
    return <div className="flex items-center justify-center h-64"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div></div>;
  }

  const settingFields = [
    { key: 'clinic_name', label: 'Clinic Name', type: 'text' },
    { key: 'clinic_phone', label: 'Phone', type: 'text' },
    { key: 'clinic_address', label: 'Address', type: 'text' },
    { key: 'clinic_google_maps', label: 'Google Maps URL', type: 'url' },
    { key: 'clinic_working_hours', label: 'Working Hours', type: 'text' },
    { key: 'clinic_description', label: 'Description', type: 'textarea' },
  ];

  return (
    <div className="space-y-8">
      {/* Clinic Settings */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Clinic Information</h3>
        <div className="space-y-4">
          {settingFields.map((field) => (
            <div key={field.key}>
              <label className="block text-sm font-medium text-gray-700 mb-1">{field.label}</label>
              {field.type === 'textarea' ? (
                <textarea
                  value={settings[field.key] || ''}
                  onChange={(e) => setSettings({ ...settings, [field.key]: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 outline-none text-sm"
                  rows={3}
                />
              ) : (
                <input
                  type={field.type}
                  value={settings[field.key] || ''}
                  onChange={(e) => setSettings({ ...settings, [field.key]: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 outline-none text-sm"
                />
              )}
            </div>
          ))}
          <button
            onClick={handleSaveSettings}
            disabled={saving}
            className="flex items-center gap-2 bg-primary-600 text-white px-4 py-2.5 rounded-lg text-sm font-medium hover:bg-primary-700 disabled:opacity-50 transition-colors"
          >
            <Save className="w-4 h-4" /> {saving ? 'Saving...' : 'Save Settings'}
          </button>
        </div>
      </div>

      {/* FAQ Management */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-900">FAQ Management</h3>
          <button onClick={openCreateFaq} className="flex items-center gap-2 bg-primary-600 text-white px-4 py-2.5 rounded-lg text-sm font-medium hover:bg-primary-700 transition-colors">
            <Plus className="w-4 h-4" /> Add FAQ
          </button>
        </div>
        <div className="space-y-3">
          {faqs.map((faq) => (
            <div key={faq.id} className="border border-gray-200 rounded-lg p-4">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <p className="font-medium text-gray-900">{faq.question}</p>
                  <p className="text-sm text-gray-600 mt-1">{faq.answer}</p>
                  {faq.category && <span className="inline-block mt-1 px-2 py-0.5 bg-gray-100 text-gray-600 rounded-full text-xs">{faq.category}</span>}
                </div>
                <div className="flex gap-1 ml-4">
                  <button onClick={() => openEditFaq(faq)} className="p-1.5 text-gray-600 hover:text-primary-600 hover:bg-gray-100 rounded-lg"><Edit2 className="w-4 h-4" /></button>
                  <button onClick={() => handleDeleteFaq(faq.id)} className="p-1.5 text-gray-600 hover:text-red-600 hover:bg-red-50 rounded-lg"><Trash2 className="w-4 h-4" /></button>
                </div>
              </div>
            </div>
          ))}
          {faqs.length === 0 && <p className="text-center text-gray-500 py-4">No FAQs yet</p>}
        </div>
      </div>

      {/* FAQ Modal */}
      {showFaqModal && (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl max-w-lg w-full p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold">{editingFaqId ? 'Edit FAQ' : 'Add FAQ'}</h2>
              <button onClick={() => setShowFaqModal(false)} className="p-2 hover:bg-gray-100 rounded-lg"><X className="w-4 h-4" /></button>
            </div>
            <form onSubmit={handleSaveFaq} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Question</label>
                <input type="text" value={faqForm.question} onChange={(e) => setFaqForm({ ...faqForm, question: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 outline-none text-sm" required />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Answer</label>
                <textarea value={faqForm.answer} onChange={(e) => setFaqForm({ ...faqForm, answer: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 outline-none text-sm" rows={3} required />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
                <input type="text" value={faqForm.category} onChange={(e) => setFaqForm({ ...faqForm, category: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 outline-none text-sm" placeholder="e.g. General, Booking, Pricing" />
              </div>
              <div className="flex gap-3 pt-2">
                <button type="submit" className="flex-1 bg-primary-600 text-white py-2.5 rounded-lg font-medium hover:bg-primary-700 transition-colors">
                  {editingFaqId ? 'Update' : 'Create'}
                </button>
                <button type="button" onClick={() => setShowFaqModal(false)} className="px-4 py-2.5 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors">
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
