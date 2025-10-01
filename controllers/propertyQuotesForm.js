const PropertyQuoteForm = require("../models/PropertyQuoteForm");

// Create new quote
const createQuote = async (req, res) => {
  try {
    const data = req.body;

    if (req.user) {
      data.userId = req.user._id; // attach logged-in user
    }

    const quote = await PropertyQuoteForm.create(data);
    res.status(201).json(quote);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error creating quote", error: error.message });
  }
};

// Get all quotes (for admin)
const getAllQuotes = async (req, res) => {
  try {
    const quotes = await PropertyQuoteForm.find()
      .populate("userId", "name email")
      .populate("propertyId", "title city"); // populate property info

    // Format to include URL
    const formattedQuotes = quotes.map((q) => ({
      _id: q._id,
      name: q.name,
      email: q.email,
      contactNumber: q.contactNumber,
      message: q.message,
      createdAt: q.createdAt,
      propertyId: q.propertyId
        ? {
            _id: q.propertyId._id,
            title: q.propertyId.title || "No Title",
            city: q.propertyId.city || "",
            url: `/properties/${q.propertyId._id}`,
          }
        : null,
    }));

    res.status(200).json(formattedQuotes);
  } catch (error) {
    console.error("Error fetching quotes:", error);
    res.status(500).json({ message: "Error fetching quotes", error: error.message });
  }
};

// Get my quotes (for user)
const getMyQuotes = async (req, res) => {
  try {
    const quotes = await PropertyQuoteForm.find({ userId: req.user._id })
      .populate("propertyId", "title city");

    // Include URL for frontend
    const formattedQuotes = quotes.map((q) => ({
      _id: q._id,
      name: q.name,
      email: q.email,
      contactNumber: q.contactNumber,
      message: q.message,
      createdAt: q.createdAt,
      propertyId: q.propertyId
        ? {
            _id: q.propertyId._id,
            title: q.propertyId.title || "No Title",
            city: q.propertyId.city || "",
            url: `/properties/${q.propertyId._id}`,
          }
        : null,
    }));

    res.status(200).json(formattedQuotes);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error fetching my quotes", error: error.message });
  }
};

// Get single quote
const getQuoteById = async (req, res) => {
  try {
    const quote = await PropertyQuoteForm.findById(req.params.id)
      .populate("userId", "name email")
      .populate("propertyId", "title city");

    if (!quote) return res.status(404).json({ message: "Quote not found" });

    const formattedQuote = {
      _id: quote._id,
      name: quote.name,
      email: quote.email,
      contactNumber: quote.contactNumber,
      message: quote.message,
      createdAt: quote.createdAt,
      propertyId: quote.propertyId
        ? {
            _id: quote.propertyId._id,
            title: quote.propertyId.title || "No Title",
            city: quote.propertyId.city || "",
            url: `/properties/${quote.propertyId._id}`,
          }
        : null,
    };

    res.status(200).json(formattedQuote);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error fetching quote", error: error.message });
  }
};

// Delete quote
const deleteQuoteById = async (req, res) => {
  try {
    const quote = await PropertyQuoteForm.findByIdAndDelete(req.params.id);
    if (!quote) return res.status(404).json({ message: "Quote not found" });
    res.status(200).json({ message: "Quote deleted" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error deleting quote", error: error.message });
  }
};

module.exports = {
  createQuote,
  getAllQuotes,
  getMyQuotes,
  getQuoteById,
  deleteQuoteById,
};
