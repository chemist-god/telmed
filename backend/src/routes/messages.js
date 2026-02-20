const express = require('express');
const Message = require('../models/Message');
const Consultation = require('../models/Consultation');
const auth = require('../middleware/auth');

const router = express.Router();

router.use(auth);

router.get('/:consultationId', async (req, res) => {
  try {
    const messages = await Message.find({ consultation: req.params.consultationId })
      .populate('sender', '-password')
      .sort({ createdAt: 1 });
    res.json(messages);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.post('/:consultationId', async (req, res) => {
  try {
    const { content, type } = req.body;
    const message = await Message.create({
      consultation: req.params.consultationId,
      sender: req.user._id,
      content,
      type: type || 'text'
    });
    await message.populate('sender', '-password');
    res.status(201).json(message);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;
