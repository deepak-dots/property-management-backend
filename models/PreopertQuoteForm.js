const mongoose = require("mongoose");

const QuoteSchema = new mongoose.Schema(
  {
    propertyId: { 
      type: mongoose.Schema.Types.ObjectId, 
      ref: "Property", // optional: link to Property collection if exists
      required: false 
    },
    name: { type: String, required: true },
    email: { type: String, required: true },
    contactNumber: { type: String, required: true },
    message: { type: String, required: true },
  },
  { timestamps: true } // automatically adds createdAt and updatedAt
);

module.exports = mongoose.model("Quote", QuoteSchema);
