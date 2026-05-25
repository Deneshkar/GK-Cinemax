const nodemailer = require('nodemailer');

const emailTransporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS
  }
});

async function sendEmail({ to, subject, html }) {
  if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS) {
    throw new Error('Email service is not configured. Set EMAIL_USER and EMAIL_PASS in .env');
  }

  await emailTransporter.sendMail({
    from: process.env.EMAIL_USER,
    to,
    subject,
    html
  });
}

module.exports = { sendEmail };
