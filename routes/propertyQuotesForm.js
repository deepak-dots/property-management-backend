// routes/propertQuotesForm.js
const express = require('express');
const router = express.Router();
const quoteController = require('../controllers/propertQuotesForm');

router.post('/', quoteController.createQuote);
router.get('/', quoteController.getAllQuotes);
router.get('/:id', quoteController.getQuoteById);
router.delete('/:id', quoteController.deleteQuoteById);

module.exports = router;
