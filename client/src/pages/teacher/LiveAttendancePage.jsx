import { useState, useEffect } from 'react';
import api from '../../services/api';
import { useSocket } from '../../context/SocketContext';
import { joinClassroom } from '../../services/socketClient';
import toast from 'react-hot-toast';
import { QrCode, Users, RefreshCw } from 'lucide-react';
import { QRCodeSVG } from 'qrcode.react';

export default function LiveAttendancePage() {
  const { socket } = useSocket();
  const [timetables, setTimetables] = useState([]);
  const [selected, setSelected] = useState({ timetableId: '', periodNumber: '' });
  const [qrSession, setQrSession] = useState(null);
  const [attendance, setAttendance] = useState([]);
  const [summary, setSummary] = useState({ present: 0, total: 0 });
  const [loading, setLoading] = useState(false);

  // Load timetables
  useEffect(() => {
    api.get('/timetable').then(({ data }) => setTimetables(data.data.timetables));
  }, []);

  // Listen to real-time attendance updates
  useEffect(() => {
    if (!socket) return;
    const handler = (payload) => {
      setAttendance((prev) => {
        const updated = prev.map((s) =>
          String(s.studentId) === String(payload.studentId)
            ? { ...s, isPresent: true, method: payload.method }
            : s
        );
        return updated;
      });
      setSummary((prev) => ({ ...prev, present: prev.present + 1 }));
      toast.success(`${payload.studentName} marked present`);
    };
    socket.on('attendance:marked', handler);
    return () => socket.off('attendance:marked', handler);
  }, [socket]);

  const generateQR = async () => {
    if (!selected.timetableId || !selected.periodNumber) {
      return toast.error('Select timetable and period first');
    }
    setLoading(true);
    try {
      const { data } = await api.post('/attendance/qr-generate', {
        timetableId: selected.timetableId,
        periodNumber: Number(selected.periodNumber),
      });
      setQrSession(data.data);
      joinClassroom(selected.timetableId, selected.periodNumber);
      // Load current attendance
      const attRes = await api.get(`/attendance/today/${selected.timetableId}/${selected.periodNumber}`);
      setAttendance(attRes.data.data.summary);
      setSummary({ present: attRes.data.data.presentCount, total: attRes.data.data.totalCount });
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to generate QR');
    } finally {
      setLoading(false);
    }
  };

  const selectedTimetable = timetables.find((t) => t._id === selected.timetableId);
  const presentPct = summary.total ? Math.round((summary.present / summary.total) * 100) : 0;

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <Users className="w-6 h-6 text-primary-600" />
        <h1 className="text-2xl font-bold text-gray-900">Live Attendance</h1>
      </div>

      {/* Setup panel */}
      <div className="card">
        <h2 className="font-semibold text-gray-900 mb-4">Start Session</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Class / Timetable</label>
            <select
              className="input"
              value={selected.timetableId}
              onChange={(e) => setSelected({ ...selected, timetableId: e.target.value, periodNumber: '' })}
            >
              <option value="">Select class...</option>
              {timetables.map((t) => (
                <option key={t._id} value={t._id}>
                  {t.department} – Sem {t.semester} – {t.weekDay}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Period</label>
            <select
              className="input"
              value={selected.periodNumber}
              onChange={(e) => setSelected({ ...selected, periodNumber: e.target.value })}
              disabled={!selectedTimetable}
            >
              <option value="">Select period...</option>
              {selectedTimetable?.periods.filter((p) => !p.isFree).map((p) => (
                <option key={p.periodNumber} value={p.periodNumber}>
                  P{p.periodNumber} – {p.subject} ({p.startTime}–{p.endTime})
                </option>
              ))}
            </select>
          </div>

          <div className="flex items-end">
            <button onClick={generateQR} disabled={loading} className="btn-primary w-full flex items-center justify-center gap-2">
              <QrCode className="w-4 h-4" />
              {loading ? 'Generating...' : 'Generate QR'}
            </button>
          </div>
        </div>
      </div>

      {qrSession && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* QR Code display */}
          <div className="card flex flex-col items-center gap-4">
            <h2 className="font-semibold text-gray-900 w-full">QR Code</h2>
            <QRCodeSVG
              value={JSON.stringify({ token: qrSession.token, timetableId: selected.timetableId, periodNumber: Number(selected.periodNumber) })}
              size={240}
              level="H"
            />
            <p className="text-xs text-gray-400">
              Expires: {new Date(qrSession.expiresAt).toLocaleTimeString()}
            </p>
            <button onClick={generateQR} className="btn-secondary flex items-center gap-2 text-sm">
              <RefreshCw className="w-3.5 h-3.5" /> Regenerate
            </button>
          </div>

          {/* Live summary */}
          <div className="card space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="font-semibold text-gray-900">Live Summary</h2>
              <span className="text-2xl font-bold text-primary-600">{presentPct}%</span>
            </div>
            <div className="h-3 bg-gray-100 rounded-full overflow-hidden">
              <div className="h-full bg-primary-500 rounded-full transition-all" style={{ width: `${presentPct}%` }} />
            </div>
            <p className="text-sm text-gray-500">{summary.present} / {summary.total} students present</p>

            <div className="max-h-64 overflow-y-auto space-y-2 mt-2">
              {attendance.map((s) => (
                <div key={s.studentId} className="flex items-center justify-between py-1.5 border-b border-gray-50">
                  <div>
                    <p className="text-sm font-medium text-gray-800">{s.name}</p>
                    <p className="text-xs text-gray-400">{s.rollNumber}</p>
                  </div>
                  {s.isPresent
                    ? <span className="badge-present">{s.method}</span>
                    : <span className="badge-absent">Absent</span>}
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
