const mongoose = require("mongoose");

const QuoteSchema = new mongoose.Schema({
  propertyId: { type: mongoose.Schema.Types.ObjectId, required: true },
  name: { type: String, required: true },
  email: { type: String, required: true },
  contactNumber: { type: String, required: true },
  message: { type: String, required: true },
  createdAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model("Quote", QuoteSchema);
