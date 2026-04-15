import { useState, useEffect } from 'react';
import api from '../../services/api';
import { Calendar } from 'lucide-react';

const DAYS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

export default function TimetablePage() {
  const [timetables, setTimetables] = useState({});
  const [loading, setLoading] = useState(true);
  const [activeDay, setActiveDay] = useState(new Date().toLocaleDateString('en-US', { weekday: 'long' }));

  useEffect(() => {
    api.get('/timetable').then(({ data }) => {
      const map = {};
      data.data.timetables.forEach((tt) => { map[tt.weekDay] = tt.periods; });
      setTimetables(map);
    }).finally(() => setLoading(false));
  }, []);

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <Calendar className="w-6 h-6 text-primary-600" />
        <h1 className="text-2xl font-bold text-gray-900">Weekly Timetable</h1>
      </div>

      {/* Day tabs */}
      <div className="flex gap-2 flex-wrap">
        {DAYS.map((day) => (
          <button
            key={day}
            onClick={() => setActiveDay(day)}
            className={`px-4 py-1.5 rounded-full text-sm font-medium transition-colors ${
              activeDay === day ? 'bg-primary-600 text-white' : 'bg-white border border-gray-200 text-gray-600 hover:bg-gray-50'
            }`}
          >
            {day.slice(0, 3)}
          </button>
        ))}
      </div>

      {/* Periods */}
      <div className="card">
        <h2 className="font-semibold text-gray-900 mb-4">{activeDay}</h2>
        {loading ? (
          <div className="space-y-3">{[1,2,3,4,5].map((i) => <div key={i} className="h-14 bg-gray-100 rounded-lg animate-pulse" />)}</div>
        ) : !timetables[activeDay] || timetables[activeDay].length === 0 ? (
          <p className="text-gray-400 text-center py-8">No schedule for {activeDay}</p>
        ) : (
          <div className="space-y-3">
            {timetables[activeDay].map((period, i) => (
              <div key={i} className={`flex items-center gap-4 p-4 rounded-xl border ${period.isFree ? 'border-amber-200 bg-amber-50' : 'border-gray-100 bg-gray-50'}`}>
                <div className="text-center min-w-[80px]">
                  <p className="text-xs text-gray-400">{period.startTime}</p>
                  <div className="w-px h-3 bg-gray-300 mx-auto my-0.5" />
                  <p className="text-xs text-gray-400">{period.endTime}</p>
                </div>
                <div className="flex-1">
                  <p className={`font-medium text-sm ${period.isFree ? 'text-amber-700' : 'text-gray-800'}`}>
                    {period.isFree ? 'Free Period' : period.subject}
                  </p>
                  {period.teacherId && (
                    <p className="text-xs text-gray-400 mt-0.5">
                      {period.teacherId.name} · Room {period.roomNo}
                    </p>
                  )}
                  {!period.teacherId && period.roomNo && (
                    <p className="text-xs text-gray-400 mt-0.5">Room {period.roomNo}</p>
                  )}
                </div>
                <div className={`w-2 h-2 rounded-full ${period.isFree ? 'bg-amber-400' : 'bg-primary-500'}`} />
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
