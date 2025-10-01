// models/PropertyQuoteForm.js
const mongoose = require('mongoose');

const propertyQuoteSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null },
  propertyId: { type: mongoose.Schema.Types.ObjectId, ref: 'Property', required: true },
  name: { type: String, required: true, trim: true },
  email: { 
    type: String, 
    required: true, 
    trim: true, 
    match: [/^\S+@\S+\.\S+$/, 'Invalid email address']
  },
  contactNumber: { 
    type: String, 
    required: true, 
    match: [/^[0-9+\-()\s]{7,}$/, 'Invalid contact number']
  },
  message: { type: String, required: true },
  status: { type: String, enum: ['Pending', 'Reviewed'], default: 'Pending' },
}, { timestamps: true });

module.exports = mongoose.model('PropertyQuoteForm', propertyQuoteSchema);

