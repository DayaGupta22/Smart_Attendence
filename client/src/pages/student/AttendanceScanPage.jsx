import { useState, useEffect, useRef } from 'react';
import { Html5QrcodeScanner } from 'html5-qrcode';
import api from '../../services/api';
import toast from 'react-hot-toast';
import { ScanLine, CheckCircle, XCircle } from 'lucide-react';

export default function AttendanceScanPage() {
  const [scanResult, setScanResult] = useState(null); // 'success' | 'error' | null
  const [message, setMessage] = useState('');
  const [scanning, setScanning] = useState(false);
  const scannerRef = useRef(null);
  const scannerDivId = 'qr-reader';

  const startScanner = () => {
    setScanning(true);
    setScanResult(null);

    // Delay to ensure DOM is ready
    setTimeout(() => {
      const scanner = new Html5QrcodeScanner(scannerDivId, {
        fps: 10,
        qrbox: { width: 250, height: 250 },
        rememberLastUsedCamera: true,
      }, false);

      scanner.render(
        async (decodedText) => {
          try {
            const payload = JSON.parse(decodedText);
            await scanner.clear();
            setScanning(false);

            const { data } = await api.post('/attendance/qr-scan', { token: payload.token });
            setScanResult('success');
            setMessage(data.message);
            toast.success('Attendance marked!');
          } catch (err) {
            await scanner.clear();
            setScanning(false);
            setScanResult('error');
            setMessage(err.response?.data?.message || 'Invalid QR code');
            toast.error('Failed to mark attendance');
          }
        },
        () => {} // ignore scan errors during scanning
      );

      scannerRef.current = scanner;
    }, 100);
  };

  useEffect(() => {
    return () => {
      if (scannerRef.current) {
        scannerRef.current.clear().catch(() => {});
      }
    };
  }, []);

  return (
    <div className="space-y-6 max-w-lg mx-auto">
      <div className="flex items-center gap-3">
        <ScanLine className="w-6 h-6 text-primary-600" />
        <h1 className="text-2xl font-bold text-gray-900">Scan QR Code</h1>
      </div>

      <div className="card text-center">
        {!scanning && scanResult === null && (
          <div className="space-y-4 py-6">
            <div className="w-20 h-20 bg-primary-50 rounded-full flex items-center justify-center mx-auto">
              <ScanLine className="w-10 h-10 text-primary-600" />
            </div>
            <div>
              <p className="font-medium text-gray-900">Ready to mark attendance</p>
              <p className="text-sm text-gray-500 mt-1">Scan the QR code displayed by your teacher</p>
            </div>
            <button onClick={startScanner} className="btn-primary px-8">
              Open Camera
            </button>
          </div>
        )}

        {scanning && (
          <div className="space-y-4">
            <p className="text-sm text-gray-500">Position the QR code within the frame</p>
            <div id={scannerDivId} className="w-full" />
            <button
              onClick={() => {
                scannerRef.current?.clear().catch(() => {});
                setScanning(false);
              }}
              className="btn-secondary"
            >
              Cancel
            </button>
          </div>
        )}

        {scanResult === 'success' && (
          <div className="space-y-4 py-6">
            <CheckCircle className="w-16 h-16 text-green-500 mx-auto" />
            <div>
              <p className="font-semibold text-green-700 text-lg">Attendance Marked!</p>
              <p className="text-sm text-gray-500 mt-1">{message}</p>
            </div>
            <button onClick={() => { setScanResult(null); }} className="btn-secondary">
              Scan Another
            </button>
          </div>
        )}

        {scanResult === 'error' && (
          <div className="space-y-4 py-6">
            <XCircle className="w-16 h-16 text-red-500 mx-auto" />
            <div>
              <p className="font-semibold text-red-700 text-lg">Scan Failed</p>
              <p className="text-sm text-gray-500 mt-1">{message}</p>
            </div>
            <button onClick={startScanner} className="btn-primary">
              Try Again
            </button>
          </div>
        )}
      </div>

      <div className="card bg-blue-50 border-blue-100">
        <h3 className="font-medium text-blue-900 text-sm mb-2">How it works</h3>
        <ol className="text-sm text-blue-700 space-y-1 list-decimal list-inside">
          <li>Teacher generates a QR code for the class</li>
          <li>QR is displayed on the classroom screen</li>
          <li>Tap "Open Camera" and point at the QR code</li>
          <li>Your attendance is marked instantly</li>
        </ol>
      </div>
    </div>
  );
}
