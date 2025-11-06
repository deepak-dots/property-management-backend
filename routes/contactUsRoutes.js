const express = require('express');
const router = express.Router();
const { submitContact, getAllContacts } = require('../controllers/contactUsController');

// POST - Submit contact form
router.post('/', submitContact);

// GET - Fetch all submissions (for admin)
router.get('/', getAllContacts);

module.exports = router;
