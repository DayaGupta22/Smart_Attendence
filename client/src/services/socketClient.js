import { io } from 'socket.io-client';

let socket = null;

export const getSocket = () => {
  if (!socket) {
    socket = io('/', {
      autoConnect: false,
      withCredentials: true,
    });
  }
  return socket;
};

export const connectSocket = (userId) => {
  const s = getSocket();
  if (!s.connected) {
    s.connect();
    s.on('connect', () => {
      s.emit('join:student', { studentId: userId });
    });
  }
  return s;
};

export const joinClassroom = (timetableId, periodNumber) => {
  getSocket().emit('join:classroom', { timetableId, periodNumber });
};

export const disconnectSocket = () => {
  if (socket?.connected) socket.disconnect();
};
