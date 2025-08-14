// routes/filterRoutes.js

const express = require('express');
const router = express.Router();
const Property = require('../models/Property');

// Get distinct cities from properties
router.get('/cities', async (req, res) => {
  try {
    const cities = await Property.distinct('city');
    res.json(cities);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch cities' });
  }
});

// Get distinct BHK types from properties
router.get('/bhkTypes', async (req, res) => {
  try {
    const bhkTypes = await Property.distinct('bhkType');
    res.json(bhkTypes);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch BHK types' });
  }
});

module.exports = router;
