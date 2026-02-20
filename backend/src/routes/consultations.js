const express = require('express');
const Consultation = require('../models/Consultation');
const User = require('../models/User');
const auth = require('../middleware/auth');

const router = express.Router();

router.use(auth);

router.get('/available-doctors', async (req, res) => {
  try {
    const doctors = await User.find({ role: 'doctor' }).select('-password');
    res.json(doctors);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.post('/', async (req, res) => {
  try {
    const { symptoms, type, doctorId, scheduledAt } = req.body;
    const consultation = await Consultation.create({
      patient: req.user._id,
      doctor: doctorId || null,
      symptoms,
      type,
      scheduledAt
    });
    await consultation.populate(['patient', 'doctor']);
    res.status(201).json(consultation);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.get('/', async (req, res) => {
  try {
    let query = {};
    if (req.user.role === 'patient') {
      query.patient = req.user._id;
    } else if (req.user.role === 'doctor') {
      query.$or = [{ doctor: req.user._id }, { doctor: null, status: 'pending' }];
    }
    const consultations = await Consultation.find(query)
      .populate('patient', '-password')
      .populate('doctor', '-password')
      .sort({ createdAt: -1 });
    res.json(consultations);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.get('/:id', async (req, res) => {
  try {
    const consultation = await Consultation.findById(req.params.id)
      .populate('patient', '-password')
      .populate('doctor', '-password');
    if (!consultation) return res.status(404).json({ message: 'Consultation not found' });
    res.json(consultation);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.patch('/:id/status', async (req, res) => {
  try {
    const { status } = req.body;
    const consultation = await Consultation.findById(req.params.id);
    if (!consultation) return res.status(404).json({ message: 'Consultation not found' });
    consultation.status = status;
    if (status === 'active') {
      consultation.doctor = req.user._id;
      consultation.startedAt = new Date();
    }
    if (status === 'completed') consultation.endedAt = new Date();
    await consultation.save();
    await consultation.populate(['patient', 'doctor']);
    res.json(consultation);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;
