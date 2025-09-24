// routes/prepertyQuotesForm.js
const express = require("express");
const router = express.Router();
const quoteController = require("../controllers/propertyQuotesForm");
const { optional, authenticateUser } = require("../middleware/userAuth"); // destructure functions

// Create quote → login optional
router.post("/", optional, quoteController.createQuote);

// Logged-in user's quotes
router.get("/my", authenticateUser, quoteController.getMyQuotes);

// Admin routes
router.get("/", quoteController.getAllQuotes);
router.get("/:id", quoteController.getQuoteById);
router.delete("/:id", quoteController.deleteQuoteById);

module.exports = router;



