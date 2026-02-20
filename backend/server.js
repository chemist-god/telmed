require('dotenv').config();
const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const cors = require('cors');
const rateLimit = require('express-rate-limit');
const connectDB = require('./src/config/db');
const authRoutes = require('./src/routes/auth');
const consultationRoutes = require('./src/routes/consultations');
const messageRoutes = require('./src/routes/messages');
const healthRecordRoutes = require('./src/routes/healthRecords');
const socketHandlers = require('./src/socket/handlers');
const jwt = require('jsonwebtoken');

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: { origin: '*', methods: ['GET', 'POST'] }
});

connectDB();

app.use(cors());
app.use(express.json());

const apiLimiter = rateLimit({ windowMs: 15 * 60 * 1000, max: 200, message: { message: 'Too many requests, please try again later' } });
app.use('/api/', apiLimiter);

app.use('/api/auth', authRoutes);
app.use('/api/consultations', consultationRoutes);
app.use('/api/messages', messageRoutes);
app.use('/api/health-records', healthRecordRoutes);

app.get('/api/health', (req, res) => res.json({ status: 'ok', app: 'CELMED' }));

io.use((socket, next) => {
  const token = socket.handshake.auth.token;
  if (!token) return next(new Error('Authentication error'));
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    socket.user = decoded;
    next();
  } catch (err) {
    next(new Error('Authentication error'));
  }
});

io.on('connection', (socket) => socketHandlers(io, socket));

const PORT = process.env.PORT || 5000;
server.listen(PORT, () => console.log(`CELMED server running on port ${PORT}`));
