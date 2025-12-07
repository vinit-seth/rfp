const nodemailer = require('nodemailer');
const logger = require('../utils/logger');

const transport = nodemailer.createTransport({
  host: process.env.SMTP_HOST || 'smtp.gmail.com',
  port: Number(process.env.SMTP_PORT || 587),
  secure: false,
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS
  }
});

async function sendRfpEmail(rfp, vendor) {
  const html = `
    <p>Hi ${vendor.contactPerson || vendor.name},</p>
    <p>We'd like to invite you to respond to the following RFP:</p>
    <h3>${rfp.title}</h3>
    <p>${rfp.description}</p>
    <p>Please reply with your proposal to this email address.</p>
    <hr/>
    <pre>${JSON.stringify(rfp, null, 2)}</pre>
  `;

  const mail = {
    from: process.env.EMAIL_FROM,
    to: vendor.email,
    subject: `RFP: ${rfp.title}`,
    text: `${rfp.title}\n\n${rfp.description}\n\n${JSON.stringify(rfp, null, 2)}`,
    html
  };

  try {
    const result = await transport.sendMail(mail);
    logger.info('Sent RFP email', result.messageId);
    return result;
  } catch (err) {
    logger.error('Error sending RFP email', err);
    throw err;
  }
}

module.exports = { sendRfpEmail };