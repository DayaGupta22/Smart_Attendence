import { useState, useEffect } from 'react';
import api from '../../services/api';
import toast from 'react-hot-toast';
import { Target, Plus, CheckCircle, Circle, Trash2, ChevronDown, ChevronUp } from 'lucide-react';

const CATEGORIES = ['academic', 'career', 'personal', 'skill'];
const CAT_COLOR = {
  academic: 'bg-blue-100 text-blue-700',
  career:   'bg-purple-100 text-purple-700',
  personal: 'bg-pink-100 text-pink-700',
  skill:    'bg-orange-100 text-orange-700',
};

export default function GoalsPage() {
  const [goals, setGoals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [expanded, setExpanded] = useState({});
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ title: '', description: '', category: 'academic', deadline: '', milestones: '' });

  const fetchGoals = () => api.get('/goals').then(({ data }) => setGoals(data.data.goals)).finally(() => setLoading(false));
  useEffect(() => { fetchGoals(); }, []);

  const createGoal = async () => {
    if (!form.title) return toast.error('Title required');
    try {
      const payload = {
        ...form,
        milestones: form.milestones
          ? form.milestones.split('\n').filter(Boolean).map((m) => ({ title: m.trim() }))
          : [],
      };
      await api.post('/goals', payload);
      toast.success('Goal created!');
      setShowForm(false);
      setForm({ title: '', description: '', category: 'academic', deadline: '', milestones: '' });
      fetchGoals();
    } catch {
      toast.error('Failed to create goal');
    }
  };

  const toggleMilestone = async (goalId, milestoneIndex) => {
    try {
      const { data } = await api.patch(`/goals/${goalId}/milestone/${milestoneIndex}`);
      setGoals((prev) => prev.map((g) => g._id === goalId ? data.data.goal : g));
    } catch {
      toast.error('Failed to update milestone');
    }
  };

  const deleteGoal = async (goalId) => {
    try {
      await api.delete(`/goals/${goalId}`);
      setGoals((prev) => prev.filter((g) => g._id !== goalId));
      toast.success('Goal removed');
    } catch {
      toast.error('Failed to delete');
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Target className="w-6 h-6 text-primary-600" />
          <h1 className="text-2xl font-bold text-gray-900">My Goals</h1>
        </div>
        <button onClick={() => setShowForm(!showForm)} className="btn-primary flex items-center gap-2">
          <Plus className="w-4 h-4" /> New Goal
        </button>
      </div>

      {/* Create form */}
      {showForm && (
        <div className="card space-y-4">
          <h3 className="font-semibold text-gray-900">Create New Goal</h3>
          <div className="grid grid-cols-2 gap-4">
            <div className="col-span-2">
              <label className="text-xs text-gray-500 mb-1 block">Goal Title *</label>
              <input className="input" placeholder="e.g. Get internship at a tech company"
                value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} />
            </div>
            <div>
              <label className="text-xs text-gray-500 mb-1 block">Category</label>
              <select className="input" value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })}>
                {CATEGORIES.map((c) => <option key={c} value={c}>{c.charAt(0).toUpperCase() + c.slice(1)}</option>)}
              </select>
            </div>
            <div>
              <label className="text-xs text-gray-500 mb-1 block">Deadline</label>
              <input type="date" className="input" value={form.deadline}
                onChange={(e) => setForm({ ...form, deadline: e.target.value })} />
            </div>
            <div className="col-span-2">
              <label className="text-xs text-gray-500 mb-1 block">Description</label>
              <textarea className="input resize-none h-20" placeholder="Describe your goal..."
                value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} />
            </div>
            <div className="col-span-2">
              <label className="text-xs text-gray-500 mb-1 block">Milestones <span className="text-gray-400">(one per line)</span></label>
              <textarea className="input resize-none h-24 font-mono text-xs"
                placeholder={"Apply to 5 companies\nBuild portfolio project\nPrepare DSA sheet"}
                value={form.milestones} onChange={(e) => setForm({ ...form, milestones: e.target.value })} />
            </div>
          </div>
          <div className="flex gap-2">
            <button onClick={createGoal} className="btn-primary">Create Goal</button>
            <button onClick={() => setShowForm(false)} className="btn-secondary">Cancel</button>
          </div>
        </div>
      )}

      {/* Goals list */}
      {loading ? (
        <div className="space-y-4">{[1,2,3].map((i) => <div key={i} className="h-24 bg-gray-100 rounded-xl animate-pulse" />)}</div>
      ) : goals.length === 0 ? (
        <div className="card text-center py-12">
          <Target className="w-12 h-12 text-gray-300 mx-auto mb-3" />
          <p className="text-gray-500">No goals yet. Create your first goal!</p>
        </div>
      ) : (
        goals.map((goal) => (
          <div key={goal._id} className="card space-y-3">
            <div className="flex items-start justify-between gap-3">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <span className={`text-xs px-2 py-0.5 rounded-full font-medium capitalize ${CAT_COLOR[goal.category]}`}>
                    {goal.category}
                  </span>
                  {goal.deadline && (
                    <span className="text-xs text-gray-400">
                      Due: {new Date(goal.deadline).toLocaleDateString()}
                    </span>
                  )}
                </div>
                <h3 className="font-semibold text-gray-900">{goal.title}</h3>
                {goal.description && <p className="text-sm text-gray-500 mt-0.5">{goal.description}</p>}
              </div>
              <div className="flex items-center gap-2">
                <span className={`text-lg font-bold ${goal.progress === 100 ? 'text-green-600' : 'text-primary-600'}`}>
                  {goal.progress}%
                </span>
                <button onClick={() => deleteGoal(goal._id)} className="text-gray-300 hover:text-red-500 transition-colors">
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Progress bar */}
            <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
              <div
                className={`h-full rounded-full transition-all ${goal.progress === 100 ? 'bg-green-500' : 'bg-primary-500'}`}
                style={{ width: `${goal.progress}%` }}
              />
            </div>

            {/* Milestones */}
            {goal.milestones.length > 0 && (
              <div>
                <button
                  onClick={() => setExpanded({ ...expanded, [goal._id]: !expanded[goal._id] })}
                  className="flex items-center gap-1 text-xs text-gray-500 hover:text-gray-700"
                >
                  {expanded[goal._id] ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
                  {goal.milestones.filter((m) => m.isCompleted).length}/{goal.milestones.length} milestones
                </button>

                {expanded[goal._id] && (
                  <div className="mt-2 space-y-1.5">
                    {goal.milestones.map((m, mi) => (
                      <button
                        key={mi}
                        onClick={() => toggleMilestone(goal._id, mi)}
                        className="flex items-center gap-2 w-full text-left group"
                      >
                        {m.isCompleted
                          ? <CheckCircle className="w-4 h-4 text-green-500 flex-shrink-0" />
                          : <Circle className="w-4 h-4 text-gray-300 flex-shrink-0 group-hover:text-gray-500" />}
                        <span className={`text-sm ${m.isCompleted ? 'line-through text-gray-400' : 'text-gray-700'}`}>
                          {m.title}
                        </span>
                      </button>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
        ))
      )}
    </div>
  );
}
