// models/User.js (ensure you keep this)
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
  name: { type: String, required: [true, 'Name is required'], trim: true },
  email: { type: String, required: [true, 'Email is required'], unique: true, lowercase: true, match: [/^\S+@\S+\.\S+$/, 'Please enter a valid email'] },
  phone: { type: String, trim: true, match: [/^[0-9]{10,15}$/, 'Please enter a valid phone number'], default: '' },
  password: { type: String, required: [true, 'Password is required'], minlength: 6, select: false },
  role: { type: String, enum: ['user', 'admin'], default: 'user' },
  favorites: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Property' }],
  resetPasswordToken: { type: String },
  resetPasswordExpiry: { type: Date },
}, { timestamps: true });

// Virtuals
userSchema.virtual('isAdmin').get(function () { return this.role === 'admin'; });
userSchema.virtual('contactNumber').get(function () { return this.phone; });

// Password hashing
userSchema.pre('save', async function (next) {
  if (!this.isModified('password')) return next();
  this.password = await bcrypt.hash(this.password, 10);
  next();
});

// Password match
userSchema.methods.matchPassword = async function (enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

const User = mongoose.model('User', userSchema);
module.exports = User;

