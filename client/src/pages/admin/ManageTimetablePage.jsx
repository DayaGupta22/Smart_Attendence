import { useState, useEffect } from 'react';
import api from '../../services/api';
import toast from 'react-hot-toast';
import { Calendar, Plus, Trash2 } from 'lucide-react';

const DAYS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
const DEPARTMENTS = ['Computer Science', 'Electronics', 'Mechanical', 'Civil', 'MBA', 'BCA', 'MCA'];

const emptyPeriod = () => ({
  periodNumber: 1,
  startTime: '09:00',
  endTime: '10:00',
  subject: '',
  roomNo: '',
  isFree: false,
});

export default function ManageTimetablePage() {
  const [timetables, setTimetables] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({
    department: '', semester: '1', section: 'A',
    weekDay: 'Monday', academicYear: '2025-26', periods: [emptyPeriod()],
  });

  const fetchTimetables = () => api.get('/timetable').then(({ data }) => setTimetables(data.data.timetables));
  useEffect(() => { fetchTimetables(); }, []);

  const addPeriod = () => setForm({ ...form, periods: [...form.periods, { ...emptyPeriod(), periodNumber: form.periods.length + 1 }] });
  const removePeriod = (i) => setForm({ ...form, periods: form.periods.filter((_, idx) => idx !== i) });
  const updatePeriod = (i, field, value) => {
    const periods = [...form.periods];
    periods[i] = { ...periods[i], [field]: field === 'isFree' ? value : value };
    setForm({ ...form, periods });
  };

  const handleSubmit = async () => {
    if (!form.department || !form.semester || !form.weekDay) return toast.error('Fill all required fields');
    try {
      await api.post('/timetable', { ...form, semester: Number(form.semester) });
      toast.success('Timetable saved!');
      setShowForm(false);
      fetchTimetables();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to save');
    }
  };

  const deleteTimetable = async (id) => {
    try {
      await api.delete(`/timetable/${id}`);
      toast.success('Timetable removed');
      fetchTimetables();
    } catch {
      toast.error('Failed to delete');
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Calendar className="w-6 h-6 text-primary-600" />
          <h1 className="text-2xl font-bold text-gray-900">Manage Timetables</h1>
        </div>
        <button onClick={() => setShowForm(!showForm)} className="btn-primary flex items-center gap-2">
          <Plus className="w-4 h-4" /> New Timetable
        </button>
      </div>

      {/* Create Form */}
      {showForm && (
        <div className="card space-y-5">
          <h2 className="font-semibold text-gray-900">Create / Update Timetable</h2>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div>
              <label className="text-xs text-gray-500 mb-1 block">Department *</label>
              <select className="input" value={form.department} onChange={(e) => setForm({ ...form, department: e.target.value })}>
                <option value="">Select...</option>
                {DEPARTMENTS.map((d) => <option key={d} value={d}>{d}</option>)}
              </select>
            </div>
            <div>
              <label className="text-xs text-gray-500 mb-1 block">Semester *</label>
              <select className="input" value={form.semester} onChange={(e) => setForm({ ...form, semester: e.target.value })}>
                {[1,2,3,4,5,6,7,8].map((s) => <option key={s} value={s}>Sem {s}</option>)}
              </select>
            </div>
            <div>
              <label className="text-xs text-gray-500 mb-1 block">Day *</label>
              <select className="input" value={form.weekDay} onChange={(e) => setForm({ ...form, weekDay: e.target.value })}>
                {DAYS.map((d) => <option key={d} value={d}>{d}</option>)}
              </select>
            </div>
            <div>
              <label className="text-xs text-gray-500 mb-1 block">Academic Year</label>
              <input className="input" value={form.academicYear} onChange={(e) => setForm({ ...form, academicYear: e.target.value })} />
            </div>
          </div>

          <div>
            <div className="flex items-center justify-between mb-3">
              <h3 className="font-medium text-gray-800">Periods</h3>
              <button onClick={addPeriod} className="text-sm text-primary-600 hover:underline flex items-center gap-1">
                <Plus className="w-3.5 h-3.5" /> Add Period
              </button>
            </div>

            <div className="space-y-3">
              {form.periods.map((period, i) => (
                <div key={i} className="grid grid-cols-6 gap-3 items-center p-3 bg-gray-50 rounded-lg">
                  <div>
                    <label className="text-xs text-gray-400 block mb-0.5">P#</label>
                    <input type="number" className="input text-center" value={period.periodNumber}
                      onChange={(e) => updatePeriod(i, 'periodNumber', Number(e.target.value))} />
                  </div>
                  <div>
                    <label className="text-xs text-gray-400 block mb-0.5">Start</label>
                    <input type="time" className="input" value={period.startTime}
                      onChange={(e) => updatePeriod(i, 'startTime', e.target.value)} />
                  </div>
                  <div>
                    <label className="text-xs text-gray-400 block mb-0.5">End</label>
                    <input type="time" className="input" value={period.endTime}
                      onChange={(e) => updatePeriod(i, 'endTime', e.target.value)} />
                  </div>
                  <div>
                    <label className="text-xs text-gray-400 block mb-0.5">Subject</label>
                    <input className="input" placeholder="e.g. DSA" value={period.subject}
                      onChange={(e) => updatePeriod(i, 'subject', e.target.value)}
                      disabled={period.isFree} />
                  </div>
                  <div>
                    <label className="text-xs text-gray-400 block mb-0.5">Free?</label>
                    <input type="checkbox" className="w-4 h-4 mt-2" checked={period.isFree}
                      onChange={(e) => updatePeriod(i, 'isFree', e.target.checked)} />
                  </div>
                  <div className="flex items-end pb-1">
                    <button onClick={() => removePeriod(i)} className="text-red-400 hover:text-red-600">
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="flex gap-2">
            <button onClick={handleSubmit} className="btn-primary">Save Timetable</button>
            <button onClick={() => setShowForm(false)} className="btn-secondary">Cancel</button>
          </div>
        </div>
      )}

      {/* Existing timetables */}
      <div className="space-y-3">
        {timetables.map((tt) => (
          <div key={tt._id} className="card flex items-center justify-between">
            <div>
              <p className="font-medium text-gray-900">{tt.department} — Semester {tt.semester}, Section {tt.section}</p>
              <p className="text-sm text-gray-400">{tt.weekDay} · {tt.periods.length} periods · {tt.academicYear}</p>
            </div>
            <button onClick={() => deleteTimetable(tt._id)} className="text-gray-300 hover:text-red-500 transition-colors">
              <Trash2 className="w-4 h-4" />
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
