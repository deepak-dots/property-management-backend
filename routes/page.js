const express = require('express');
const router = express.Router();
const Page = require('../models/Page');




// Get all pages
router.get('/', async (req, res) => {
  try {
    const pages = await Page.find();
    res.json(pages);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Get page by slug
router.get('/:slug', async (req, res) => {
  try {
    const page = await Page.findOne({ slug: req.params.slug });
    if (!page) return res.status(404).json({ message: 'Page not found' });
    res.json(page);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});


// Get page by ID
router.get('/id/:id', async (req, res) => {
    try {
      const page = await Page.findById(req.params.id);
      if (!page) return res.status(404).json({ message: 'Page not found' });
      res.json(page);
    } catch (err) {
      res.status(500).json({ message: err.message });
    }
  });
  

// Create a new page
router.post('/', async (req, res) => {
  try {
    const page = new Page(req.body);
    await page.save();
    res.json(page);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// Update page
router.put('/:id', async (req, res) => {
  try {
    const page = await Page.findByIdAndUpdate(req.params.id, req.body, { new: true });
    res.json(page);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});


// Delete page
router.delete('/:id', async (req, res) => {
  try {
    await Page.findByIdAndDelete(req.params.id);
    res.json({ message: 'Page deleted' });
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

module.exports = router;
