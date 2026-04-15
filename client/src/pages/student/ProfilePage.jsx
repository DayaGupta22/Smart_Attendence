import { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import api from '../../services/api';
import toast from 'react-hot-toast';
import { User, Save } from 'lucide-react';

export default function ProfilePage() {
  const { user, updateUser } = useAuth();
  const [form, setForm] = useState({
    name: user?.name || '',
    interests: (user?.interests || []).join(', '),
    strengths: (user?.strengths || []).join(', '),
    careerGoals: (user?.careerGoals || []).join(', '),
    weakSubjects: (user?.weakSubjects || []).join(', '),
  });
  const [saving, setSaving] = useState(false);

  const handleSave = async () => {
    setSaving(true);
    try {
      const payload = {
        name: form.name,
        interests: form.interests.split(',').map((s) => s.trim()).filter(Boolean),
        strengths: form.strengths.split(',').map((s) => s.trim()).filter(Boolean),
        careerGoals: form.careerGoals.split(',').map((s) => s.trim()).filter(Boolean),
        weakSubjects: form.weakSubjects.split(',').map((s) => s.trim()).filter(Boolean),
      };
      const { data } = await api.put('/auth/profile', payload);
      updateUser(data.data.user);
      toast.success('Profile updated!');
    } catch {
      toast.error('Failed to update profile');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-6 max-w-2xl">
      <div className="flex items-center gap-3">
        <User className="w-6 h-6 text-primary-600" />
        <h1 className="text-2xl font-bold text-gray-900">Profile</h1>
      </div>

      {/* Avatar */}
      <div className="card flex items-center gap-5">
        <div className="w-16 h-16 rounded-full bg-primary-100 flex items-center justify-center text-primary-700 text-2xl font-bold">
          {user?.name?.[0]?.toUpperCase()}
        </div>
        <div>
          <p className="font-semibold text-gray-900 text-lg">{user?.name}</p>
          <p className="text-sm text-gray-400">{user?.email}</p>
          <div className="flex gap-2 mt-1">
            <span className="text-xs bg-primary-50 text-primary-700 px-2 py-0.5 rounded-full capitalize">{user?.role}</span>
            <span className="text-xs bg-gray-100 text-gray-600 px-2 py-0.5 rounded-full">{user?.department}</span>
            {user?.semester && (
              <span className="text-xs bg-gray-100 text-gray-600 px-2 py-0.5 rounded-full">Sem {user?.semester}</span>
            )}
          </div>
        </div>
      </div>

      {/* Editable fields */}
      <div className="card space-y-5">
        <h2 className="font-semibold text-gray-900">Personal Details</h2>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Full Name</label>
          <input className="input" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Interests <span className="text-gray-400 font-normal">(comma-separated)</span>
          </label>
          <input className="input" placeholder="AI, Machine Learning, Web Dev"
            value={form.interests} onChange={(e) => setForm({ ...form, interests: e.target.value })} />
          <p className="text-xs text-gray-400 mt-1">Used to personalize free-period suggestions</p>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Strengths <span className="text-gray-400 font-normal">(comma-separated)</span>
          </label>
          <input className="input" placeholder="Python, Problem Solving, Communication"
            value={form.strengths} onChange={(e) => setForm({ ...form, strengths: e.target.value })} />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Subjects to Improve <span className="text-gray-400 font-normal">(comma-separated)</span>
          </label>
          <input className="input" placeholder="Mathematics, DBMS"
            value={form.weakSubjects} onChange={(e) => setForm({ ...form, weakSubjects: e.target.value })} />
          <p className="text-xs text-gray-400 mt-1">AI will prioritize these in suggestions</p>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Career Goals <span className="text-gray-400 font-normal">(comma-separated)</span>
          </label>
          <input className="input" placeholder="Software Engineer at FAANG, Research Scientist"
            value={form.careerGoals} onChange={(e) => setForm({ ...form, careerGoals: e.target.value })} />
        </div>

        <button onClick={handleSave} disabled={saving} className="btn-primary flex items-center gap-2">
          <Save className="w-4 h-4" />
          {saving ? 'Saving...' : 'Save Changes'}
        </button>
      </div>

      {/* Read-only academic info */}
      <div className="card">
        <h2 className="font-semibold text-gray-900 mb-4">Academic Info</h2>
        <div className="grid grid-cols-2 gap-4 text-sm">
          {[
            { label: 'Roll Number', value: user?.rollNumber || '—' },
            { label: 'Department', value: user?.department },
            { label: 'Semester', value: user?.semester ? `Semester ${user.semester}` : '—' },
            { label: 'Role', value: user?.role },
          ].map(({ label, value }) => (
            <div key={label}>
              <p className="text-gray-400 text-xs">{label}</p>
              <p className="font-medium text-gray-800 capitalize">{value}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
