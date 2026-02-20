const express = require('express');
const jwt = require('jsonwebtoken');
const rateLimit = require('express-rate-limit');
const User = require('../models/User');
const auth = require('../middleware/auth');

const router = express.Router();

const authLimiter = rateLimit({ windowMs: 15 * 60 * 1000, max: 20, message: { message: 'Too many requests, please try again later' } });

const generateToken = (id) => jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: '7d' });

router.post('/register', authLimiter, async (req, res) => {
  try {
    const { name, email, password, role, specialization, phone } = req.body;
    const existing = await User.findOne({ email });
    if (existing) return res.status(400).json({ message: 'Email already registered' });
    const user = await User.create({ name, email, password, role, specialization, phone });
    const token = generateToken(user._id);
    res.status(201).json({ token, user: { id: user._id, name: user.name, email: user.email, role: user.role, specialization: user.specialization } });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.post('/login', authLimiter, async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email });
    if (!user || !(await user.comparePassword(password))) {
      return res.status(401).json({ message: 'Invalid email or password' });
    }
    const token = generateToken(user._id);
    res.json({ token, user: { id: user._id, name: user.name, email: user.email, role: user.role, specialization: user.specialization } });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.get('/me', auth, async (req, res) => {
  res.json(req.user);
});

module.exports = router;
