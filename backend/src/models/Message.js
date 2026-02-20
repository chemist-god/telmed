const mongoose = require('mongoose');

const messageSchema = new mongoose.Schema({
  consultation: { type: mongoose.Schema.Types.ObjectId, ref: 'Consultation', required: true },
  sender: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  content: { type: String, required: true },
  type: { type: String, enum: ['text', 'file'], default: 'text' },
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Message', messageSchema);
