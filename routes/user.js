const express = require('express');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const router = express.Router();
const User = require('../models/User');
authMiddleware = require('../middleware/auth');

const ADMIN_EMAIL = 'admin@example.com';
const ADMIN_PASSWORD_HASH = bcrypt.hashSync('admin123', 10);

// router.post('/login', (req, res) => {
//   const { email, password } = req.body;

//   if (email !== ADMIN_EMAIL) return res.status(401).json({ message: 'Invalid email' });

//   const isPasswordValid = bcrypt.compareSync(password, ADMIN_PASSWORD_HASH);
//   if (!isPasswordValid) return res.status(401).json({ message: 'Invalid password' });

//   const token = jwt.sign({ email }, process.env.JWT_SECRET, { expiresIn: '1d' });
//   res.json({ token });
// });


router.post('/signup', async (req, res) => {
  const { name, email, password } = req.body;

  if (!name || !email || !password) {
    return res.status(400).json({ message: 'Name, email and password are required' });
  }

  try {
    const existingUser = await User.findOne({ email });
    if (existingUser) return res.status(409).json({ message: 'Email already exists' });

    // Create new user
    const user = new User({ name, email, password });
    await user.save();

    res.status(201).json({ message: 'User registered successfully' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});

router.post('/login', async (req, res) => {
  const { email, password } = req.body;

  try {
    const user = await User.findOne({ email }).select('+password');
    if (!user) return res.status(401).json({ message: 'Invalid email or password' });

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(401).json({ message: 'Invalid email or password' });

    const token = jwt.sign(
      { id: user._id, email: user.email, name: user.name },
      process.env.JWT_SECRET,
      { expiresIn: '1d' }
    );

    res.json({ token, user: { id: user._id, name: user.name, email: user.email } });
  } catch (err) {
    console.error('Login error:', err);
    res.status(500).json({ message: 'Server error' });
  }
});

router.get('/profile', authMiddleware, async (req, res) => {
  try {
    const userId = req.user.id;

    // Fetch user from DB excluding password
    const user = await User.findById(userId).select('-password');
    if (!user) return res.status(404).json({ message: 'User not found' });

    res.json(user);
  } catch (err) {
    console.error('Profile fetch error:', err);
    res.status(500).json({ message: 'Server error' });
  }
});


module.exports = router;
