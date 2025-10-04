// routes/prepertyQuotesForm.js
const express = require("express");
const router = express.Router();
const { userAuth, optional } = require("../middleware/userAuth");
const { protectAdmin } = require("../middleware/adminAuth"); // <-- added for admin protection
const {
  createQuote,
  getAllQuotes,
  getMyQuotes,
  getQuoteById,
  deleteQuoteById,
} = require("../controllers/propertyQuotesForm");

// Create new quote (guest or logged-in user)
router.post("/", optional, createQuote);

// Admin: Get all quotes (protected with admin auth)
router.get("/", protectAdmin, getAllQuotes); // <-- updated from userAuth to protectAdmin

// User: Get my quotes
router.get("/my", userAuth, getMyQuotes);

// Get single quote (currently for logged-in user)
router.get("/:id", userAuth, getQuoteById);

// Delete quote (currently for logged-in user)
router.delete("/:id", userAuth, deleteQuoteById);

module.exports = router;
