require('dotenv').config();
const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const mongoose = require('mongoose');
const cors = require('cors');
const path = require('path');

const authRoutes = require('./routes/auth');
const chatRoutes = require('./routes/chat');
const { initSocket } = require('./socket');

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: { origin: '*', methods: ['GET', 'POST'] },
});

// Middleware
app.use(cors());
app.use(express.json());

// Serve frontend static files
app.use(express.static(path.join(__dirname, '../frontend')));

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/chat', chatRoutes);

// Health check
app.get('/api/health', (req, res) => res.json({ status: 'ok' }));

// Fallback to frontend index
app.use((req, res) => {
  res.sendFile(path.join(__dirname, '../frontend/index.html'));
});

// Initialize Socket.IO
initSocket(io);

// Connect to MongoDB and start server
const PORT = process.env.PORT || 3000;
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/chat-saas';

mongoose
  .connect(MONGODB_URI)
  .then(() => {
    console.log('[DB] Connected to MongoDB');
    server.listen(PORT, () => {
      console.log(`[Server] Running on http://localhost:${PORT}`);
    });
  })
  .catch((err) => {
    console.error('[DB] Connection failed:', err.message);
    process.exit(1);
  });
