// models/Property.js
const mongoose = require('mongoose');

const PropertySchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: String,
  price: { type: Number, required: true },
  city: { type: String, required: true },
  address: String,

  location: {
    type: { type: String, enum: ["Point"], default: "Point" },
    coordinates: { type: [Number], default: [0, 0] } // [lng, lat]
  },

  propertyType: { type: String, enum: ["Flat", "Villa", "Duplex"] },
  bhkType: { type: String, enum: ['1 BHK', '2 BHK', '3 BHK', '4 BHK'] },
  furnishing: { type: String, enum: ['Furnished', 'Semi-Furnished', 'Unfurnished'] },
  bedrooms: { type: Number },
  bathrooms: { type: Number },
  superBuiltupArea: String,
  developer: String,
  project: String,
  transactionType: { type: String, enum: ['New', 'Resale'] },
  status: { type: String, enum: ['Ready to Move', 'Under Construction'] },
  reraId: String,
  images: [{ type: String }],
  amenities: [{ type: String }],
  activeStatus: { type: String, enum: ['Active', 'Draft'], default: 'Draft' },

  // --- Reviews ---
  reviews: [
    {
      name: { type: String, required: true },
      message: { type: String },
      rating: { type: Number, required: true, min: 1, max: 5 },
      createdAt: { type: Date, default: Date.now }
    }
  ],
  averageRating: { type: Number, default: 0 }

}, { timestamps: true });

// 2dsphere index
PropertySchema.index({ location: "2dsphere" });

module.exports = mongoose.model('Property', PropertySchema);
