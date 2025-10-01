// routes/userRoutes.js
const express = require('express');
const router = express.Router();
const {
  signupUser,
  loginUser,
  getUserProfile,
  updateUserProfile,
  getUserDashboard,
  updateUserDashboard,
  getMe,
  forgotPassword,
  resetPassword,
} = require('../controllers/userController');

const { userAuth, optional } = require('../middleware/userAuth');
const {
  getFavorites,
  toggleFavorite,
  clearFavorites,
} = require('../controllers/favoritesController');

// Auth
router.post('/signup', signupUser);
router.post('/login', loginUser);

// Profile
router.get('/profile', userAuth, getUserProfile);
router.put('/profile', userAuth, updateUserProfile);

// Dashboard
router.get('/dashboard', userAuth, getUserDashboard);
router.put('/dashboard', userAuth, updateUserDashboard);

// Favorites
router.get('/favorites', userAuth, getFavorites);
router.post('/favorites', userAuth, toggleFavorite);
router.delete('/favorites', userAuth, clearFavorites);

// Me
router.get('/me', optional, getMe);

// Forgot & Reset Password
router.post('/forgot-password', forgotPassword);
router.post('/reset-password', resetPassword);

module.exports = router;
