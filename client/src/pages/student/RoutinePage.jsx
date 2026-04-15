import { useState, useEffect } from 'react';
import api from '../../services/api';
import toast from 'react-hot-toast';
import { ListTodo, CheckCircle, Circle, Clock, Plus } from 'lucide-react';
import { format } from 'date-fns';

const TYPE_STYLE = {
  class:   'border-l-4 border-blue-400 bg-blue-50',
  free:    'border-l-4 border-amber-400 bg-amber-50',
  goal:    'border-l-4 border-purple-400 bg-purple-50',
  break:   'border-l-4 border-green-400 bg-green-50',
  custom:  'border-l-4 border-gray-300 bg-gray-50',
};

export default function RoutinePage() {
  const [routine, setRoutine] = useState(null);
  const [loading, setLoading] = useState(true);
  const [reflection, setReflection] = useState('');
  const [showAddForm, setShowAddForm] = useState(false);
  const [newItem, setNewItem] = useState({ timeSlot: '', title: '', type: 'custom' });

  useEffect(() => {
    api.get('/routine/today').then(({ data }) => {
      setRoutine(data.data.routine);
      setReflection(data.data.routine?.reflection || '');
    }).finally(() => setLoading(false));
  }, []);

  const toggleStatus = async (idx, currentStatus) => {
    const newStatus = currentStatus === 'completed' ? 'pending' : 'completed';
    try {
      const { data } = await api.put(`/routine/today/item/${idx}`, { status: newStatus });
      setRoutine(data.data.routine);
    } catch {
      toast.error('Failed to update');
    }
  };

  const addItem = async () => {
    if (!newItem.timeSlot || !newItem.title) return toast.error('Time slot and title required');
    try {
      const { data } = await api.post('/routine/today/item', newItem);
      setRoutine(data.data.routine);
      setShowAddForm(false);
      setNewItem({ timeSlot: '', title: '', type: 'custom' });
      toast.success('Item added');
    } catch {
      toast.error('Failed to add item');
    }
  };

  const saveReflection = async () => {
    try {
      await api.post('/routine/today/reflection', { reflection });
      toast.success('Reflection saved');
    } catch {
      toast.error('Failed to save');
    }
  };

  const score = routine?.productivityScore || 0;
  const completed = routine?.schedule.filter((s) => s.status === 'completed').length || 0;
  const total = routine?.schedule.length || 0;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <ListTodo className="w-6 h-6 text-primary-600" />
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Daily Routine</h1>
            <p className="text-sm text-gray-400">{format(new Date(), 'EEEE, MMMM d')}</p>
          </div>
        </div>
        <div className="text-right">
          <p className="text-2xl font-bold text-primary-600">{score}%</p>
          <p className="text-xs text-gray-400">Productivity score</p>
        </div>
      </div>

      {/* Progress bar */}
      <div className="card py-4">
        <div className="flex justify-between text-sm text-gray-600 mb-2">
          <span>{completed} of {total} tasks completed</span>
          <span>{score}%</span>
        </div>
        <div className="h-3 bg-gray-100 rounded-full overflow-hidden">
          <div className="h-full bg-primary-500 rounded-full transition-all" style={{ width: `${score}%` }} />
        </div>
      </div>

      {/* Schedule items */}
      <div className="space-y-3">
        {loading ? (
          [1,2,3,4,5].map((i) => <div key={i} className="h-16 bg-gray-100 rounded-xl animate-pulse" />)
        ) : routine?.schedule.map((item, idx) => (
          <div key={idx} className={`rounded-xl p-4 flex items-center gap-4 ${TYPE_STYLE[item.type] || TYPE_STYLE.custom}`}>
            <button
              onClick={() => item.type !== 'class' && toggleStatus(idx, item.status)}
              className={`flex-shrink-0 ${item.type === 'class' ? 'opacity-30 cursor-default' : 'cursor-pointer'}`}
            >
              {item.status === 'completed'
                ? <CheckCircle className="w-5 h-5 text-green-600" />
                : <Circle className="w-5 h-5 text-gray-400" />}
            </button>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <span className="text-xs font-mono text-gray-400 flex-shrink-0">
                  <Clock className="w-3 h-3 inline mr-1" />{item.timeSlot}
                </span>
                <span className={`text-xs px-1.5 py-0.5 rounded capitalize ${
                  { class:'bg-blue-100 text-blue-700', free:'bg-amber-100 text-amber-700',
                    goal:'bg-purple-100 text-purple-700', custom:'bg-gray-100 text-gray-600' }[item.type]}`}>
                  {item.type}
                </span>
              </div>
              <p className={`font-medium text-sm mt-0.5 ${item.status === 'completed' ? 'line-through opacity-50' : ''}`}>
                {item.title}
              </p>
            </div>
          </div>
        ))}
      </div>

      {/* Add custom item */}
      <button
        onClick={() => setShowAddForm(!showAddForm)}
        className="btn-secondary w-full flex items-center justify-center gap-2"
      >
        <Plus className="w-4 h-4" />
        Add Custom Task
      </button>

      {showAddForm && (
        <div className="card space-y-3">
          <h3 className="font-semibold text-gray-900">Add Task</h3>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs text-gray-500 mb-1 block">Time Slot</label>
              <input className="input" placeholder="14:00-14:30" value={newItem.timeSlot}
                onChange={(e) => setNewItem({ ...newItem, timeSlot: e.target.value })} />
            </div>
            <div>
              <label className="text-xs text-gray-500 mb-1 block">Type</label>
              <select className="input" value={newItem.type}
                onChange={(e) => setNewItem({ ...newItem, type: e.target.value })}>
                <option value="custom">Custom</option>
                <option value="goal">Goal</option>
                <option value="break">Break</option>
              </select>
            </div>
            <div className="col-span-2">
              <label className="text-xs text-gray-500 mb-1 block">Title</label>
              <input className="input" placeholder="Task description" value={newItem.title}
                onChange={(e) => setNewItem({ ...newItem, title: e.target.value })} />
            </div>
          </div>
          <div className="flex gap-2">
            <button onClick={addItem} className="btn-primary">Add</button>
            <button onClick={() => setShowAddForm(false)} className="btn-secondary">Cancel</button>
          </div>
        </div>
      )}

      {/* Reflection */}
      <div className="card">
        <h3 className="font-semibold text-gray-900 mb-3">End-of-Day Reflection</h3>
        <textarea
          className="input resize-none h-24"
          placeholder="What went well today? What could be better?"
          value={reflection}
          onChange={(e) => setReflection(e.target.value)}
        />
        <button onClick={saveReflection} className="btn-primary mt-3">Save Reflection</button>
      </div>
    </div>
  );
}
