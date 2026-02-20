const express = require('express');
const HealthRecord = require('../models/HealthRecord');
const auth = require('../middleware/auth');

const router = express.Router();

router.use(auth);

router.get('/', async (req, res) => {
  try {
    let query = {};
    if (req.user.role === 'patient') query.patient = req.user._id;
    else if (req.user.role === 'doctor') query.doctor = req.user._id;
    const records = await HealthRecord.find(query)
      .populate('patient', '-password')
      .populate('doctor', '-password')
      .sort({ recordDate: -1 });
    res.json(records);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.post('/', async (req, res) => {
  try {
    if (req.user.role !== 'doctor') return res.status(403).json({ message: 'Only doctors can create health records' });
    const { patientId, diagnosis, prescription, notes, attachments, recordDate } = req.body;
    const record = await HealthRecord.create({
      patient: patientId,
      doctor: req.user._id,
      diagnosis,
      prescription,
      notes,
      attachments,
      recordDate
    });
    await record.populate(['patient', 'doctor']);
    res.status(201).json(record);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;
