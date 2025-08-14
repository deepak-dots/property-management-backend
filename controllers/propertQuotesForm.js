const Quote = require('../models/PreopertQuoteForm');

exports.createQuote = async (req, res) => {
  const { propertyId, name, email, contactNumber, message } = req.body;

  if (!propertyId || !name || !email || !contactNumber || !message) {
    return res.status(400).json({ error: 'All fields are required' });
  }

  try {
    const quote = new Quote({ propertyId, name, email, contactNumber, message });
    await quote.save();
    res.status(201).json({ message: 'Quote request submitted successfully', quote });
  } catch (error) {
    console.error('Error saving quote:', error);
    res.status(500).json({ error: 'Server error' });
  }
};

exports.getAllQuotes = async (req, res) => {
  try {
    const quotes = await Quote.find().sort({ createdAt: -1 });
    res.json(quotes);
  } catch (error) {
    console.error('Error fetching quotes:', error);
    res.status(500).json({ error: 'Server error' });
  }
};

exports.getQuoteById = async (req, res) => {
  const { id } = req.params;
  try {
    const quote = await Quote.findById(id);
    if (!quote) {
      return res.status(404).json({ error: 'Quote not found' });
    }
    res.json(quote);
  } catch (error) {
    console.error('Error fetching quote:', error);
    res.status(500).json({ error: 'Server error' });
  }
};

exports.deleteQuoteById = async (req, res) => {
  const { id } = req.params;
  try {
    const deleted = await Quote.findByIdAndDelete(id);
    if (!deleted) {
      return res.status(404).json({ error: 'Quote not found' });
    }
    res.json({ message: 'Quote deleted successfully' });
  } catch (error) {
    console.error('Error deleting quote:', error);
    res.status(500).json({ error: 'Server error' });
  }
};
