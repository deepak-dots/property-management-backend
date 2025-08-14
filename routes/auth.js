const express = require('express');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const router = express.Router();
const Admin = require('../models/Admin');
const authMiddleware = require('../middleware/auth'); 

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
    return res
      .status(400)
      .json({ message: 'Name, email and password are required' });
  }

  try {
    const existingAdmin = await Admin.findOne({ email });
    if (existingAdmin) {
      return res.status(409).json({ message: 'Email already exists' });
    }

    // Create new admin
    const admin = new Admin({ name, email, password });
    await admin.save();

    res.status(201).json({ message: 'Admin registered successfully' });
  } catch (err) {
    console.error('Signup error:', err);
    res.status(500).json({ message: 'Server error' });
  }
});

// ----------------------
// LOGIN
// ----------------------
router.post('/login', async (req, res) => {
  const { email, password } = req.body;

  try {
    const admin = await Admin.findOne({ email }).select('+password');
    if (!admin) {
      return res.status(401).json({ message: 'Invalid email or password' });
    }

    const isMatch = await bcrypt.compare(password, admin.password);
    if (!isMatch) {
      return res.status(401).json({ message: 'Invalid email or password' });
    }

    const token = jwt.sign(
      { id: admin._id, email: admin.email, name: admin.name },
      process.env.JWT_SECRET,
      { expiresIn: '1d' }
    );

    res.json({
      token,
      user: { id: admin._id, name: admin.name, email: admin.email },
    });
  } catch (err) {
    console.error('Login error:', err);
    res.status(500).json({ message: 'Server error' });
  }
});

// ----------------------
// PROFILE (Protected)
// ----------------------
router.get('/profile', authMiddleware, async (req, res) => {
  try {
    const adminId = req.user.id;

    const admin = await Admin.findById(adminId).select('-password');
    if (!admin) {
      return res.status(404).json({ message: 'Admin not found' });
    }

    res.json(admin);
  } catch (err) {
    console.error('Profile fetch error:', err);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
