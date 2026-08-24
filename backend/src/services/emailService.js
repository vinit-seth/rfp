const nodemailer = require('nodemailer');
const logger = require('../utils/logger');

const transport = nodemailer.createTransport({
  host: process.env.SMTP_HOST || 'smtp.gmail.com',
  port: Number(process.env.SMTP_PORT || 587),
  secure: false,
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
});

async function sendRfpEmail(rfp, vendor) {
  const rfpId = rfp._id.toString();

  const subject =
    `RFP: ${rfp.title} | RFP ID: ${rfpId}`;

  const itemsHtml = Array.isArray(rfp.items)
    ? rfp.items
      .map(
        (item) => `
            <li>
              <strong>${item.name}</strong>
              — Quantity: ${item.qty || 1}
              ${item.specs
            ? ` — ${item.specs}`
            : ''
          }
            </li>
          `
      )
      .join('')
    : '';

  const itemsText = Array.isArray(rfp.items)
    ? rfp.items
      .map(
        (item) =>
          `- ${item.name} | Qty: ${item.qty || 1
          }${item.specs
            ? ` | ${item.specs}`
            : ''
          }`
      )
      .join('\n')
    : '';

  const html = `
    <p>Hi ${vendor.contactPerson || vendor.name},</p>

    <p>
      We'd like to invite you to submit a proposal
      for the following requirement.
    </p>

    <h2>${rfp.title}</h2>

    <p>${rfp.description}</p>

    ${itemsHtml
      ? `
          <h3>Requirements</h3>
          <ul>
            ${itemsHtml}
          </ul>
        `
      : ''
    }

    ${rfp.budget
      ? `<p><strong>Budget:</strong> ₹${rfp.budget}</p>`
      : ''
    }

    ${rfp.deliveryDays
      ? `<p><strong>Required delivery:</strong> ${rfp.deliveryDays} days</p>`
      : ''
    }

    ${rfp.paymentTerms
      ? `<p><strong>Payment terms:</strong> ${rfp.paymentTerms}</p>`
      : ''
    }

    ${rfp.warranty
      ? `<p><strong>Warranty:</strong> ${rfp.warranty}</p>`
      : ''
    }

    <hr />

    <p>
      <strong>RFP ID:</strong>
      ${rfpId}
    </p>

    <p>
      To submit your proposal, please reply to this email
      with the subject containing the word
      <strong>Proposal</strong> and the RFP ID
      <strong>${rfpId}</strong>.
    </p>

    <p>
      Please include your pricing, delivery timeline,
      payment terms and warranty information.
    </p>

    <p>Regards,<br />Team CoDunIt</p>
  `;

  const text = `
Hi ${vendor.contactPerson || vendor.name},

We'd like to invite you to submit a proposal for the following requirement.

RFP: ${rfp.title}

RFP ID: ${rfpId}

${rfp.description}

Requirements:
${itemsText || '- See RFP description'}

${rfp.budget
      ? `Budget: ₹${rfp.budget}`
      : ''
    }

${rfp.deliveryDays
      ? `Delivery: ${rfp.deliveryDays} days`
      : ''
    }

${rfp.paymentTerms
      ? `Payment terms: ${rfp.paymentTerms}`
      : ''
    }

${rfp.warranty
      ? `Warranty: ${rfp.warranty}`
      : ''
    }

To submit your proposal, please reply to this email
with a subject containing:

Proposal

and:

${rfpId}

Please include your pricing, delivery timeline,
payment terms and warranty information.

Regards,
Team CoDunIt
`;

  const mail = {
    from: process.env.EMAIL_FROM,
    to: vendor.email,
    subject,
    text,
    html,
  };

  try {
    const result =
      await transport.sendMail(mail);

    logger.info(
      'Sent RFP email',
      result.messageId
    );

    return result;
  } catch (err) {
    logger.error(
      'Error sending RFP email',
      err
    );

    throw err;
  }
}

module.exports = {
  sendRfpEmail,
};