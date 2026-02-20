const Message = require('../models/Message');

module.exports = function socketHandlers(io, socket) {
  console.log(`User connected: ${socket.user.id}`);

  socket.on('join-consultation', (consultationId) => {
    socket.join(consultationId);
    console.log(`User ${socket.user.id} joined consultation ${consultationId}`);
  });

  socket.on('send-message', async (data) => {
    try {
      const { consultationId, content, type } = data;
      const message = await Message.create({
        consultation: consultationId,
        sender: socket.user.id,
        content,
        type: type || 'text'
      });
      await message.populate('sender', '-password');
      io.to(consultationId).emit('new-message', message);
    } catch (error) {
      socket.emit('error', { message: error.message });
    }
  });

  socket.on('video-signal', (data) => {
    const { consultationId, signal } = data;
    socket.to(consultationId).emit('video-signal', { signal, from: socket.user.id });
  });

  socket.on('typing', (data) => {
    socket.to(data.consultationId).emit('typing', { userId: socket.user.id, isTyping: data.isTyping });
  });

  socket.on('disconnect', () => {
    console.log(`User disconnected: ${socket.user.id}`);
  });
};
