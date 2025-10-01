// routes/adminRoutes.js
const express = require('express');
const { signupAdmin, loginAdmin, getAdminProfile } = require('../controllers/adminController');
const { protectAdmin } = require('../middleware/adminAuth');

const router = express.Router();

// Public routes
router.post('/signup', signupAdmin);
router.post('/login', loginAdmin);

// Protected routes
router.get('/profile', protectAdmin, getAdminProfile);

module.exports = router;



