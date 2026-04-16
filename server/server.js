require('dotenv').config();
const http = require('http');
const { Server } = require('socket.io');
const app = require('./app');
const connectDB = require('./config/db');

const PORT =  5001;

// Create HTTP server
const server = http.createServer(app);

// Attach Socket.IO
const io = new Server(server, {
  cors: {
    origin: process.env.CLIENT_URL || 'http://localhost:5173',
    methods: ['GET', 'POST'],
    credentials: true,
  },
});
console.log(process.env.CLIENT_URL , PORT)

// Make io accessible in controllers via req.app.get('io')
app.set('io', io);

// Socket.IO connection handling
io.on('connection', (socket) => {
  console.log(`Socket connected: ${socket.id}`);

  // Teacher/screen joins classroom room to receive attendance updates
  socket.on('join:classroom', ({ timetableId, periodNumber }) => {
    const room = `classroom-${timetableId}-${periodNumber}`;
    socket.join(room);
    console.log(`Socket ${socket.id} joined room: ${room}`);
  });

  // Student joins their personal room for notifications
  socket.on('join:student', ({ studentId }) => {
    socket.join(`student-${studentId}`);
  });

  // Teacher ends period — revoke QR
  socket.on('period:end', ({ timetableId, periodNumber, token }) => {
    const { revokeQRSession } = require('./services/qrService');
    if (token) revokeQRSession(token);
    io.to(`classroom-${timetableId}-${periodNumber}`).emit('period:ended', { timetableId, periodNumber });
  });

  socket.on('disconnect', () => {
    console.log(`Socket disconnected: ${socket.id}`);
  });
});

// Start server
connectDB().then(() => {
  server.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
    console.log(`Environment: ${process.env.NODE_ENV || 'development'}`);
  });
});
