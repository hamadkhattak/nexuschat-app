const jwt = require('jsonwebtoken');
const Business = require('./models/Business');
const chatService = require('./services/chatService');

const initSocket = (io) => {
  // Authenticate socket connections via JWT
  io.use(async (socket, next) => {
    try {
      const token = socket.handshake.auth.token;
      if (!token) return next(new Error('Authentication token required'));

      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      const business = await Business.findById(decoded.id);
      if (!business) return next(new Error('Business not found'));

      // Attach business to socket
      socket.business = business;
      next();
    } catch (err) {
      next(new Error('Invalid or expired token'));
    }
  });

  io.on('connection', async (socket) => {
    const { business } = socket;
    const roomId = `business:${business._id}`;

    console.log(`[Socket] ${business.name} connected — joining room ${roomId}`);
    socket.join(roomId);

    // Send recent message history to the newly connected client
    try {
      const history = await chatService.getRecentMessages(business._id);
      socket.emit('history', history);
    } catch (err) {
      console.error('[Socket] Failed to load history:', err.message);
    }

    // Notify others in the room
    socket.to(roomId).emit('user_joined', {
      businessName: business.name,
      timestamp: new Date(),
    });

    // Handle incoming messages
    socket.on('message', async (data) => {
      try {
        const { sender, text } = data;

        if (!sender || typeof sender !== 'string' || sender.trim().length === 0) {
          return socket.emit('error', { message: 'Sender name is required' });
        }
        if (!text || typeof text !== 'string' || text.trim().length === 0) {
          return socket.emit('error', { message: 'Message text is required' });
        }
        if (text.trim().length > 2000) {
          return socket.emit('error', { message: 'Message too long (max 2000 chars)' });
        }

        const saved = await chatService.saveMessage({
          businessId: business._id,
          sender: sender.trim(),
          text: text.trim(),
        });

        // Broadcast to everyone in the business room (including sender)
        io.to(roomId).emit('message', {
          _id: saved._id,
          sender: saved.sender,
          text: saved.text,
          createdAt: saved.createdAt,
        });
      } catch (err) {
        console.error('[Socket] Message error:', err.message);
        socket.emit('error', { message: 'Failed to send message' });
      }
    });

    socket.on('disconnect', () => {
      console.log(`[Socket] ${business.name} disconnected from ${roomId}`);
      socket.to(roomId).emit('user_left', {
        businessName: business.name,
        timestamp: new Date(),
      });
    });
  });
};

module.exports = { initSocket };
