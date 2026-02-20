const mongoose = require('mongoose');

const healthRecordSchema = new mongoose.Schema({
  patient: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  doctor: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  diagnosis: { type: String, required: true },
  prescription: { type: String },
  notes: { type: String },
  attachments: [{ type: String }],
  recordDate: { type: Date, default: Date.now },
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('HealthRecord', healthRecordSchema);
