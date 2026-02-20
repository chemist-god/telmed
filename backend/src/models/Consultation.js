const mongoose = require('mongoose');

const consultationSchema = new mongoose.Schema({
  patient: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  doctor: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  status: { type: String, enum: ['pending', 'active', 'completed', 'cancelled'], default: 'pending' },
  type: { type: String, enum: ['chat', 'video', 'voice'], default: 'chat' },
  symptoms: { type: String },
  notes: { type: String },
  scheduledAt: { type: Date },
  startedAt: { type: Date },
  endedAt: { type: Date },
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Consultation', consultationSchema);
