// routes/prepertyQuotesForm.js
const express = require("express");
const router = express.Router();
const verifyToken = require("../middleware/auth"); // user auth
const {
  createQuote,
  getAllQuotes,
  getMyQuotes,
  getQuoteById,
  deleteQuoteById,
} = require("../controllers/propertyQuotesForm");

// Create new quote (any user, optional auth)
router.post("/", createQuote);

// Admin: Get all quotes (protected)
router.get("/", verifyToken, getAllQuotes);

// User: Get my quotes (protected)
router.get("/my", verifyToken, getMyQuotes);

// Get by ID (protected)
router.get("/:id", verifyToken, getQuoteById);

// Delete quote by ID (protected)
router.delete("/:id", verifyToken, deleteQuoteById);

module.exports = router;





