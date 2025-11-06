const ContactUs = require('../models/ContactUs');

// POST - Save contact form
exports.submitContact = async (req, res) => {
  try {
    const { name, email, phone, budget, message } = req.body;

    if (!name || !email || !phone) {
      return res.status(400).json({
        success: false,
        message: 'Name, email, and phone are required.',
      });
    }

    const newContact = new ContactUs({
      name,
      email,
      phone,
      budget,
      message,
    });

    await newContact.save();

    res.status(201).json({
      success: true,
      message:
        'Thank you for contacting us! Your message has been received and our real estate team will get in touch shortly.',
      contact: newContact,
    });
  } catch (error) {
    console.error('❌ Error saving contact form:', error);
    res.status(500).json({
      success: false,
      message: 'Server error. Please try again later.',
    });
  }
};

// GET - Fetch all contact submissions (Admin)
exports.getAllContacts = async (req, res) => {
  try {
    const contacts = await ContactUs.find().sort({ createdAt: -1 });
    res.status(200).json({
      success: true,
      message: 'All contact form submissions fetched successfully.',
      contacts,
    });
  } catch (error) {
    console.error('❌ Error fetching contacts:', error);
    res.status(500).json({
      success: false,
      message: 'Server error. Please try again later.',
    });
  }
};
