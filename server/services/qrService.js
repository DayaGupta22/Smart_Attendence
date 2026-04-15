const QRCode = require('qrcode');
const { v4: uuidv4 } = require('uuid');

// In-memory store for active QR sessions (use Redis in production)
const activeQRSessions = new Map();

const QR_VALIDITY_MINUTES = 5;

/**
 * Generate a QR session for a class period.
 * Returns: { token, qrDataURL, expiresAt }
 */
const generateQRSession = async ({ timetableId, periodNumber, teacherId }) => {
  const token = uuidv4();
  const expiresAt = new Date(Date.now() + QR_VALIDITY_MINUTES * 60 * 1000);

  activeQRSessions.set(token, {
    timetableId: String(timetableId),
    periodNumber,
    teacherId: String(teacherId),
    expiresAt,
  });

  // Encode the token into a QR code data URL
  const qrPayload = JSON.stringify({ token, timetableId, periodNumber });
  const qrDataURL = await QRCode.toDataURL(qrPayload, { errorCorrectionLevel: 'H', width: 400 });

  return { token, qrDataURL, expiresAt };
};

/**
 * Validate a QR token. Returns session data or null.
 */
const validateQRToken = (token) => {
  const session = activeQRSessions.get(token);
  if (!session) return null;
  if (new Date() > session.expiresAt) {
    activeQRSessions.delete(token);
    return null;
  }
  return session;
};

/**
 * Revoke a QR session (e.g. teacher ends period).
 */
const revokeQRSession = (token) => {
  activeQRSessions.delete(token);
};

module.exports = { generateQRSession, validateQRToken, revokeQRSession };
