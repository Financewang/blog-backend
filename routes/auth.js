const express = require('express');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const User = require('../models/User');

const router = express.Router();

// 注册用户（仅限你自己用一次）
router.post('/register', async (req, res) => {
  try {
    const hashedPassword = await bcrypt.hash(req.body.password, 10);
    const user = new User({ username: req.body.username, password: hashedPassword });
    await user.save();
    res.status(201).send('User registered');
  } catch (error) {
    res.status(500).send(error.message);
  }
});

// 登录
router.post('/login', async (req, res) => {
  try {
    const user = await User.findOne({ username: req.body.username });
    if (!user) return res.status(404).send('User not found');

    const isPasswordValid = await bcrypt.compare(req.body.password, user.password);
    if (!isPasswordValid) return res.status(401).send('Invalid credentials');

    const token = jwt.sign({ userId: user._id }, 'your-secret-key', { expiresIn: '1h' });
    res.status(200).json({ token });
  } catch (error) {
    res.status(500).send(error.message);
  }
});

module.exports = router;
