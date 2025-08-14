const mongoose = require('mongoose');

const PropertySchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: String,
  price: Number,
  city: String,
  location: String,
  address: String,
  bhkType: { type: String, enum: ['1 BHK', '2 BHK', '3 BHK', '4 BHK'] },
  furnishing: { type: String, enum: ['Furnished', 'Semi-Furnished', 'Unfurnished'] },
  bedrooms: { type: Number },
  bathrooms: { type: Number },
  superBuiltupArea: String, // or camelCase: superBuiltUpArea (pick one)
  developer: String,
  project: String,
  transactionType: { type: String, enum: ['New', 'Resale'] },
  status: {
    type: String,
    enum: ['Ready to Move', 'Under Construction'],
  },
  reraId: String,
  images: [{ type: String }], 
  activeStatus: { type: String, enum: ['Active', 'Draft'], default: 'Draft' }
}, { timestamps: true });

module.exports = mongoose.model('Property', PropertySchema);
