/**
 * Returns today's date as "YYYY-MM-DD"
 */
const todayString = () => new Date().toISOString().split('T')[0];

/**
 * Returns the day name (e.g. "Monday") for a given date string or today
 */
const getDayName = (dateStr = null) => {
  const d = dateStr ? new Date(dateStr) : new Date();
  return d.toLocaleDateString('en-US', { weekday: 'long' });
};

/**
 * Checks if current time falls within a period's time range.
 * startTime / endTime: "HH:MM"
 */
const isCurrentPeriod = (startTime, endTime) => {
  const now = new Date();
  const [sh, sm] = startTime.split(':').map(Number);
  const [eh, em] = endTime.split(':').map(Number);
  const nowMins = now.getHours() * 60 + now.getMinutes();
  const startMins = sh * 60 + sm;
  const endMins = eh * 60 + em;
  return nowMins >= startMins && nowMins < endMins;
};

module.exports = { todayString, getDayName, isCurrentPeriod };
