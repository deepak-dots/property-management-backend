// utils/resendEmail.js
const { Resend } = require('resend');
const resend = new Resend(process.env.RESEND_API_KEY);

const sendEmail = async ({ to, subject, text }) => {
  try {
    // ✅ In development/test — use Resend default email
    const fromEmail =
      process.env.NODE_ENV === 'production'
        ? process.env.EMAIL_FROM_LIVE
        : process.env.EMAIL_FROM_TEST || 'onboarding@resend.dev';

    // ✅ In production, send to real users
    // In dev, send only to your verified test email
    const recipient =
      process.env.NODE_ENV === 'production' ? to : process.env.TEST_EMAIL;

    const response = await resend.emails.send({
      from: fromEmail,
      to: recipient,
      subject,
      text,
    });

    console.log('✅ Email sent successfully:', response);
    return response;
  } catch (error) {
    console.error('❌ Error sending email:', error);
    throw error;
  }
};

module.exports = sendEmail;
