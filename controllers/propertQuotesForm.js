const Quote = require('../models/PreopertQuoteForm');
const nodemailer = require('nodemailer');

// NodeMailer transporter
const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: Number(process.env.SMTP_PORT),
  secure: process.env.SMTP_SECURE === 'true', // false for 587
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
});

// Create Quote & send email
exports.createQuote = async (req, res) => {
  const { propertyId, name, email, contactNumber, message } = req.body;

  if (!name || !email || !contactNumber || !message) {
    return res.status(400).json({ error: 'All fields are required' });
  }

  try {
    // Save quote to DB
    const quote = new Quote({ propertyId, name, email, contactNumber, message });
    await quote.save();

    // Send email to admin
    try {
      await transporter.sendMail({
        from: `"Quote Request" <${process.env.SMTP_USER}>`,
        to: process.env.ADMIN_EMAIL,
        subject: `New Quote Request${propertyId ? ` for Property ${propertyId}` : ''}`,
        html: `
          <h3>New Quote Request</h3>
          <p><strong>Name:</strong> ${name}</p>
          <p><strong>Email:</strong> ${email}</p>
          <p><strong>Contact Number:</strong> ${contactNumber}</p>
          <p><strong>Message:</strong> ${message}</p>
          ${propertyId ? `<p><strong>Property ID:</strong> ${propertyId}</p>` : ''}
        `,
      });
    } catch (emailErr) {
      console.error('Admin email sending error:', emailErr);
    }

    //  Send confirmation email to user
    try {
      await transporter.sendMail({
        from: `"Property Quotes" <${process.env.SMTP_USER}>`,
        to: email, // user's email
        subject: 'Your Quote Request Received',
        html: `
          <h3>Thank you for your quote request!</h3>
          <p>Hi ${name},</p>
          <p>We have received your request regarding ${
            propertyId ? `Property ID: ${propertyId}` : 'our properties'
          }.</p>
          <p>Our team will contact you shortly.</p>
          <p>Here’s a copy of your message:</p>
          <p>${message}</p>
          <br/>
          <p>Best Regards,<br/>Property Management Team</p>
        `,
      });
    } catch (userEmailErr) {
      console.error('User email sending error:', userEmailErr);
    }

    res.status(201).json({ message: 'Quote request submitted successfully', quote });
  } catch (error) {
    console.error('Error saving quote:', error);
    res.status(500).json({ error: 'Server error' });
  }
};

// Fetch all quotes
exports.getAllQuotes = async (req, res) => {
  try {
    const quotes = await Quote.find().sort({ createdAt: -1 });
    res.json(quotes);
  } catch (error) {
    console.error('Error fetching quotes:', error);
    res.status(500).json({ error: 'Server error' });
  }
};

// Fetch single quote
exports.getQuoteById = async (req, res) => {
  const { id } = req.params;
  try {
    const quote = await Quote.findById(id);
    if (!quote) return res.status(404).json({ error: 'Quote not found' });
    res.json(quote);
  } catch (error) {
    console.error('Error fetching quote:', error);
    res.status(500).json({ error: 'Server error' });
  }
};

// Delete quote
exports.deleteQuoteById = async (req, res) => {
  const { id } = req.params;
  try {
    const deleted = await Quote.findByIdAndDelete(id);
    if (!deleted) return res.status(404).json({ error: 'Quote not found' });
    res.json({ message: 'Quote deleted successfully' });
  } catch (error) {
    console.error('Error deleting quote:', error);
    res.status(500).json({ error: 'Server error' });
  }
};
