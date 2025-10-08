// utils/sendEmail.js

const nodemailer = require('nodemailer');

const sendEmail = async ({ to, subject, text }) => {
  try {
    const transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: parseInt(process.env.SMTP_PORT, 10),
      secure: process.env.SMTP_SECURE === 'true', // false for 587
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      },
      tls: {
        rejectUnauthorized: false, // add this for live hosting SSL issues
      },
    });

    const info = await transporter.sendMail({
      from: `"Property Catalogue" <${process.env.SMTP_USER}>`,
      to,
      subject,
      text,
    });

    console.log('Email sent:', info.messageId);
  } catch (err) {
    console.error('sendEmail error:', err.message);
    throw err;
  }
};

module.exports = sendEmail;