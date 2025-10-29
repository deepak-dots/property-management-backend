const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const User = require('../models/User');
const sendEmail = require('../utils/sendEmail'); 
const crypto = require('crypto');

// Forgot Password
const forgotPassword = async (req, res) => {
  const { email } = req.body;
  if (!email) return res.status(400).json({ message: 'Email is required' });

  try {
    const user = await User.findOne({ email });
    if (!user) return res.status(404).json({ message: 'User not found' });

    const resetToken = crypto.randomBytes(32).toString('hex');
    user.resetPasswordToken = resetToken;
    user.resetPasswordExpiry = Date.now() + 60 * 60 * 1000; // 1 hour
    await user.save();

    const resetUrl = `${process.env.FRONTEND_URL}/user/reset-password?token=${resetToken}&email=${email}`;
    const message = `You requested a password reset. Click here: ${resetUrl}`;

    await sendEmail({ to: email, subject: 'Password Reset Request', text: message });

    return res.json({ message: 'Reset link sent to your email. Please check your inbox and spam folder.' });
  } catch (err) {
    console.error('Forgot password error:', err.message);
    return res.status(500).json({ message: 'Error sending reset link' });
  }
};

// Reset Password
const resetPassword = async (req, res) => {
  const { token, password } = req.body;
  if (!token || !password) return res.status(400).json({ message: 'Token and password are required' });

  try {
    const user = await User.findOne({ resetPasswordToken: token });
    if (!user) return res.status(400).json({ message: 'Invalid token' });

    if (user.resetPasswordExpiry < Date.now()) return res.status(400).json({ message: 'Token has expired' });

    user.password = password; // pre('save') hashes it
    user.resetPasswordToken = undefined;
    user.resetPasswordExpiry = undefined;
    await user.save();

    res.json({ message: 'Password has been reset successfully' });
  } catch (err) {
    console.error('Reset password error:', err.message);
    res.status(500).json({ message: 'Error resetting password' });
  }
};

// Signup
const signupUser = async (req, res) => {
  try {
    const user = await User.create(req.body);
    res.status(201).json(user);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

// Login → Updated with JWT
const loginUser = async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) return res.status(400).json({ message: 'Email and password are required' });

  try {
    const user = await User.findOne({ email }).select('+password');
    if (!user) return res.status(401).json({ message: 'Invalid email or password' });

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(401).json({ message: 'Invalid email or password' });

    // Generate JWT
    const token = jwt.sign(
      { _id: user._id, email: user.email, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: '7d' } // 7 days token
    );

    res.json({
      message: 'Login successful',
      token,
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        role: user.role,
      },
    });
  } catch (err) {
    console.error('Login error:', err.message);
    res.status(500).json({ message: 'Server error' });
  }
};

// Profile (legacy)
const getUserProfile = async (req, res) => res.json(req.user);

const updateUserProfile = async (req, res) => {
  try {
    const updatedUser = await User.findByIdAndUpdate(req.user._id, req.body, { new: true });
    res.json(updatedUser);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

// Dashboard fetch
const getUserDashboard = async (req, res) => {
  try {
    const id = req.user._id || req.user.id || req.user;
    const user = await User.findById(id).select('-password');
    if (!user) return res.status(404).json({ message: 'User not found' });
    res.json(user);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

// Dashboard update
const updateUserDashboard = async (req, res) => {
  try {
    const { name, email, phone, currentPassword, password } = req.body;
    const user = await User.findById(req.user._id).select('+password');
    if (!user) return res.status(404).json({ message: 'User not found' });

    if (password) {
      if (!currentPassword) return res.status(400).json({ message: 'Current password is required' });
      const isMatch = await user.matchPassword(currentPassword);
      if (!isMatch) return res.status(400).json({ message: 'Current password is incorrect' });
      user.password = password;
    }

    if (name) user.name = name;
    if (email) user.email = email;
    if (phone) user.phone = phone;

    await user.save();

    res.json({
      message: 'Profile updated successfully!',
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        phone: user.phone,
      },
    });
  } catch (err) {
    console.error('Update profile error:', err);
    res.status(400).json({ message: err.message });
  }
};

// Me → frontend auto-fill
const getMe = async (req, res) => res.json(req.user || null);


// Send OTP
const sendLoginOTP = async (req, res) => {
  const { email } = req.body;
  if (!email) return res.status(400).json({ message: 'Email is required' });

  try {
    const user = await User.findOne({ email });
    if (!user) return res.status(404).json({ message: 'User not found' });

    const otp = Math.floor(100000 + Math.random() * 900000).toString(); // 6-digit OTP
    user.otp = otp;
    user.otpExpiry = Date.now() + 10 * 60 * 1000; // 10 mins
    await user.save();

    await sendEmail({
      to: email,
      subject: 'Your Login OTP',
      text: `Your OTP is ${otp}. It expires in 10 minutes.`,
    });

    res.json({ message: 'OTP sent successfully. Check your email.' });
  } catch (err) {
    console.error('Send OTP error:', err);
    res.status(500).json({ message: 'Error sending OTP' });
  }
};

// Verify OTP
const verifyLoginOTP = async (req, res) => {
  const { email, otp } = req.body;
  if (!email || !otp) return res.status(400).json({ message: 'Email and OTP are required' });

  try {
    const user = await User.findOne({ email });
    if (!user) return res.status(404).json({ message: 'User not found' });

    if (user.otp !== otp) return res.status(400).json({ message: 'Invalid OTP' });
    if (user.otpExpiry < Date.now()) return res.status(400).json({ message: 'OTP has expired' });

    user.otp = undefined;
    user.otpExpiry = undefined;
    await user.save();

    const token = jwt.sign(
      { _id: user._id, email: user.email, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    );

    res.json({
      message: 'Login successful via OTP',
      token,
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        role: user.role,
      },
    });
  } catch (err) {
    console.error('Verify OTP error:', err);
    res.status(500).json({ message: 'Server error verifying OTP' });
  }
};

module.exports = {
  signupUser,
  loginUser,
  getUserProfile,
  updateUserProfile,
  getUserDashboard,
  updateUserDashboard,
  getMe,
  forgotPassword,
  resetPassword,
  sendLoginOTP,
  verifyLoginOTP,
};
