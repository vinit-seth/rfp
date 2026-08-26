// backend/src/services/imapWorker.js
const imaps = require('imap-simple');
const simpleParser = require('mailparser').simpleParser;
const logger = require('../utils/logger');
const Vendor = require('../models/Vendor');
const Proposal = require('../models/Proposal');
const Rfp = require('../models/Rfp');
const ProcessedMessage = require('../models/ProcessedMessage');
const { parseProposalFromEmail } = require('./aiService');
const { parseDeliveryDays } = require("../utils/parseDeliveryDays");

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

let isRunning = false;
let pollInProgress = false;

/*
 * Process only the latest N matching vendor emails.
 *
 * You can change this in .env:
 *
 * IMAP_VENDOR_PROPOSAL_LIMIT=20
 */
const MAX_VENDOR_PROPOSAL_EMAILS =
  Number(process.env.IMAP_VENDOR_PROPOSAL_LIMIT) || 20;

/**
 * Build IMAP configuration from environment variables.
 */
function makeConfigFromEnv() {
  return {
    imap: {
      user: process.env.IMAP_USER,
      password: process.env.IMAP_PASS,
      host: process.env.IMAP_HOST,
      port: Number(process.env.IMAP_PORT) || 993,
      tls: process.env.IMAP_TLS === 'true',

      tlsOptions: {
        rejectUnauthorized:
          process.env.IMAP_TLS_REJECT_UNAUTHORIZED !== 'false',
      },

      authTimeout: 10000,

      keepalive: {
        interval: 10000,
        idleInterval: 300000,
        forceNoop: true,
      },
    },
  };
}

/**
 * Connect to IMAP with retry support.
 */
async function connectAndWatch(config) {
  let attempt = 0;

  while (true) {
    attempt++;

    try {
      logger.info(
        `IMAP connect attempt ${attempt} to ${config.imap.host}:${config.imap.port}`
      );

      const connection = await imaps.connect(config);

      /*
       * Prevent ECONNRESET / socket errors from becoming
       * unhandled Node.js errors.
       */
      connection.on('error', (err) => {
        logger.error(
          'IMAP connection error (caught)',
          err?.message || err
        );
      });

      connection.on('close', () => {
        logger.warn('IMAP connection closed');
      });

      await connection.openBox('INBOX');

      logger.info('IMAP connected, watching INBOX');

      return connection;
    } catch (err) {
      logger.error(
        'IMAP connection failed',
        err?.message || err
      );

      const backoff = Math.min(
        30000,
        1000 * Math.pow(2, Math.max(0, attempt - 1))
      );

      logger.info(`Retrying IMAP connection in ${backoff}ms`);

      await sleep(backoff);

      if (!process.env.IMAP_HOST) {
        throw new Error('IMAP disabled');
      }
    }
  }
}

/**
 * Extract an email address from a MailParser "from" object.
 */
function extractSenderEmail(parsedEmail) {
  const address =
    parsedEmail?.from?.value?.[0]?.address ||
    parsedEmail?.from?.text ||
    '';

  const match = String(address).match(
    /[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}/i
  );

  return match ? match[0].toLowerCase() : '';
}

/**
 * Convert AI-extracted price values into numbers.
 *
 * Examples:
 *
 * "₹25,000"      -> 25000
 * "₹625,000"     -> 625000
 * "$25,000"      -> 25000
 * "25,000"       -> 25000
 * "1125000"      -> 1125000
 * 25000          -> 25000
 * null           -> null
 */
function normalizeNumber(value) {
  if (
    value === null ||
    value === undefined ||
    value === ''
  ) {
    return null;
  }

  if (typeof value === 'number') {
    return Number.isFinite(value)
      ? value
      : null;
  }

  const cleaned = String(value)
    .replace(/[₹$€£,\s]/g, '')
    .replace(/[^\d.-]/g, '');

  if (!cleaned) {
    return null;
  }

  const number = Number(cleaned);

  return Number.isFinite(number)
    ? number
    : null;
}

/**
 * Extract the RFP MongoDB ObjectId from the email subject.
 *
 * Supported examples:
 *
 * Proposal - RFP ID: 6935d68d35bd52b8ef65a627
 * Proposal for RFP 6935d68d35bd52b8ef65a627
 * Re: Proposal - RFP: 6935d68d35bd52b8ef65a627
 * Proposal | RFP ID 6935d68d35bd52b8ef65a627
 */
function extractRfpId(text) {
  if (!text) return null;

  const value = String(text);

  /*
   * MongoDB ObjectId:
   * exactly 24 hexadecimal characters.
   */
  const match = value.match(
    /\b([a-f0-9]{24})\b/i
  );

  return match
    ? match[1]
    : null;
}

/**
 * Safely extract a header value from an imap-simple HEADER part.
 */
function getHeaderValue(message, headerName) {
  const headerPart = Array.isArray(message.parts)
    ? message.parts.find(
      (part) =>
        typeof part.which === 'string' &&
        part.which.toUpperCase().startsWith('HEADER')
    )
    : null;

  if (!headerPart || !headerPart.body) {
    return null;
  }

  const body = headerPart.body;

  const key = Object.keys(body).find(
    (k) => k.toLowerCase() === headerName.toLowerCase()
  );

  if (!key) return null;

  const value = body[key];

  if (Array.isArray(value)) {
    return value[0] || null;
  }

  return value || null;
}

/**
 * Fetch the full email for a specific UID.
 *
 * We first search headers and only fetch the complete email
 * for the final 20 candidates. This avoids downloading the
 * entire mailbox on every polling cycle.
 */
async function fetchFullEmail(connection, uid) {
  if (!uid) return null;

  const results = await connection.search(
    [['UID', String(uid)]],
    {
      bodies: [''],
      struct: true,
      markSeen: false,
    }
  );

  return results?.[0] || null;
}

/**
 * Find vendor emails among ONLY the latest 20 emails
 * in the IMAP_USER mailbox.
 *
 * IMPORTANT:
 *
 * We first determine the latest 20 mailbox messages.
 * Only AFTER that do we filter by registered vendors.
 *
 * Example:
 *
 * Mailbox:
 *
 *  #1  Google
 *  #2  Outlook vendor
 *  #3  Google
 *  #4  Heritage vendor
 *  ...
 *  #20 Outlook vendor
 *
 * We inspect only #1 - #20.
 *
 * We do NOT search all emails belonging to each vendor.
 */
async function findRecentVendorProposalEmails(connection) {
  /*
   * --------------------------------------------------------
   * STEP 1
   * Load registered vendors from MongoDB
   * --------------------------------------------------------
   */
  const vendors = await Vendor.find({
    email: {
      $exists: true,
      $nin: ['', null],
    },
  }).lean();

  if (!vendors.length) {
    logger.warn(
      'No vendors with email addresses found'
    );

    return [];
  }

  /*
   * Create:
   *
   * vendor email -> vendor document
   */
  const vendorMap = new Map();

  for (const vendor of vendors) {
    const email = String(
      vendor.email || ''
    )
      .trim()
      .toLowerCase();

    if (!email) continue;

    vendorMap.set(email, vendor);

    logger.info(
      `Registered vendor: ${vendor.name} <${email}>`
    );
  }

  /*
   * --------------------------------------------------------
   * STEP 2
   *
   * Fetch mailbox message headers.
   *
   * We only need metadata here.
   *
   * The COMPLETE email body is fetched later only for
   * messages that are actually vendor emails.
   * --------------------------------------------------------
   */
  logger.info(
    `Fetching mailbox messages to identify latest ${MAX_VENDOR_PROPOSAL_EMAILS} emails`
  );

  const fetchOptions = {
    bodies: [
      'HEADER.FIELDS (FROM TO SUBJECT DATE MESSAGE-ID)'
    ],
    struct: true,
    markSeen: false,
  };

  const results = await connection.search(
    ['ALL'],
    fetchOptions
  );

  logger.info(
    `Mailbox contains ${results.length} email(s)`
  );

  if (!results.length) {
    logger.info(
      'No emails found in INBOX'
    );

    return [];
  }

  /*
   * --------------------------------------------------------
   * STEP 3
   *
   * IMPORTANT:
   *
   * Sort using IMAP UID, NOT internalDate.
   *
   * Your Gmail messages were showing identical/suspicious
   * internalDate values, which caused all Outlook messages
   * to be selected before the Heritage messages.
   *
   * UID is the correct mailbox ordering mechanism here.
   * --------------------------------------------------------
   */
  results.sort((a, b) => {
    const uidA =
      Number(a.attributes?.uid || 0);

    const uidB =
      Number(b.attributes?.uid || 0);

    return uidB - uidA;
  });

  /*
   * --------------------------------------------------------
   * STEP 4
   *
   * Take ONLY the latest 20 mailbox messages.
   *
   * This happens BEFORE vendor filtering.
   * --------------------------------------------------------
   */
  const latest20 =
    results.slice(
      0,
      MAX_VENDOR_PROPOSAL_EMAILS
    );

  logger.info(
    `Inspecting latest ${latest20.length} mailbox email(s)`
  );

  /*
   * Diagnostic logging.
   *
   * This is extremely useful while testing.
   */
  for (const result of latest20) {
    const uid =
      result.attributes?.uid;

    const fromHeader =
      getHeaderValue(
        result,
        'from'
      ) || '';

    const subject =
      getHeaderValue(
        result,
        'subject'
      ) || '';

    logger.info(
      `Latest mailbox email | UID: ${uid} | From: ${fromHeader} | Subject: ${subject}`
    );
  }

  /*
   * --------------------------------------------------------
   * STEP 5
   *
   * Now filter ONLY those 20 messages against our
   * registered vendor emails.
   * --------------------------------------------------------
   */
  const candidates = [];

  for (const result of latest20) {
    const uid =
      result.attributes?.uid;

    if (!uid) {
      continue;
    }

    const fromHeader =
      getHeaderValue(
        result,
        'from'
      ) || '';

    const subject =
      getHeaderValue(
        result,
        'subject'
      ) || '';

    const messageId =
      getHeaderValue(
        result,
        'message-id'
      ) || null;

    /*
     * Extract the actual email address.
     *
     * This works with:
     *
     * gmail.com
     * outlook.com
     * heritageit.edu.in
     * company.co.uk
     * any other valid domain
     */
    const emailMatch =
      String(fromHeader).match(
        /[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}/i
      );

    const senderEmail =
      emailMatch
        ? emailMatch[0]
          .trim()
          .toLowerCase()
        : '';

    if (!senderEmail) {
      logger.info(
        `Skipping latest mailbox email because sender could not be determined | UID: ${uid} | Subject: ${subject}`
      );

      continue;
    }

    /*
     * Look for the sender in our Vendor collection.
     */
    const vendor =
      vendorMap.get(senderEmail);

    if (!vendor) {
      logger.info(
        `Skipping non-vendor email | UID: ${uid} | From: ${senderEmail} | Subject: ${subject}`
      );

      continue;
    }

    /*
     * ------------------------------------------------------
     * We found a registered vendor among the latest 20.
     * ------------------------------------------------------
     */
    logger.info(
      `Vendor email found in latest 20 | UID: ${uid} | Vendor: ${vendor.name} | Email: ${senderEmail} | Subject: ${subject}`
    );

    /*
     * Use Date header only as informational metadata.
     *
     * We DO NOT use it to decide which emails are latest.
     */
    const dateHeader =
      getHeaderValue(
        result,
        'date'
      );

    const messageDate =
      dateHeader
        ? new Date(dateHeader)
        : new Date(
          result.attributes?.internalDate ||
          Date.now()
        );

    candidates.push({
      uid,

      messageId,

      subject,

      messageDate,

      vendorId:
        vendor._id,

      vendorName:
        vendor.name,

      vendorEmail:
        senderEmail,
    });
  }

  /*
   * --------------------------------------------------------
   * STEP 6
   * Return vendor emails.
   * --------------------------------------------------------
   */
  logger.info(
    `Found ${candidates.length} registered vendor email(s) among the latest ${latest20.length} mailbox email(s)`
  );

  return candidates;
}

/**
 * Process one vendor proposal email.
 *
 * Flow:
 *
 * 1. Check duplicate message
 * 2. Fetch complete email
 * 3. Parse email
 * 4. Extract RFP ID from subject/body
 * 5. Verify RFP exists
 * 6. Verify sender belongs to registered vendor
 * 7. Use AI to extract proposal data
 * 8. Save Proposal linked to exact RFP + vendor
 * 9. Record processed message
 * 10. Mark email as Seen
 */
async function processProposalEmail(connection, candidate) {
  const {
    uid,
    messageId,
    subject,
    vendorId,
    vendorName,
    vendorEmail,
  } = candidate;

  try {
    /*
     * --------------------------------------------------------
     * 1. Duplicate check
     * --------------------------------------------------------
     */
    if (messageId) {
      const alreadyProcessed =
        await ProcessedMessage.findOne({
          messageId,
        }).lean();

      if (alreadyProcessed) {
        logger.info(
          'Skipping already processed email',
          {
            messageId,
            uid,
            subject,
          }
        );

        if (uid) {
          try {
            await connection.addFlags(uid, '\\Seen');
          } catch (err) {
            logger.warn(
              'Could not mark duplicate email as Seen',
              err?.message || err
            );
          }
        }

        return;
      }
    }

    /*
     * --------------------------------------------------------
     * 2. Fetch complete email
     * --------------------------------------------------------
     *
     * We only fetched headers while searching the mailbox.
     * Now fetch the actual message body.
     */
    const fullEmail =
      await fetchFullEmail(connection, uid);

    if (!fullEmail) {
      logger.warn(
        'Could not fetch full vendor email',
        {
          uid,
          subject,
          vendorEmail,
        }
      );

      return;
    }

    /*
     * Find the complete message body.
     */
    const part = Array.isArray(fullEmail.parts)
      ? fullEmail.parts.find(
        (p) =>
          p.which === '' ||
          p.which === undefined
      ) || fullEmail.parts[0]
      : null;

    const rawEmail =
      part?.body || '';

    if (!rawEmail) {
      logger.warn(
        'Vendor email has no readable body',
        {
          uid,
          subject,
          vendorEmail,
        }
      );

      return;
    }

    /*
     * --------------------------------------------------------
     * 3. Parse complete email
     * --------------------------------------------------------
     */
    const parsedEmail =
      await simpleParser(rawEmail);

    const emailText =
      parsedEmail.text ||
      parsedEmail.html ||
      '';

    if (!emailText.trim()) {
      logger.warn(
        'Vendor email body is empty',
        {
          uid,
          subject,
          vendorEmail,
        }
      );

      return;
    }

    /*
     * --------------------------------------------------------
     * 4. Extract RFP ID
     * --------------------------------------------------------
     *
     * We support the RFP ID being present in either:
     *
     * Subject:
     *   Re: RFP: Procurement of Laptops | RFP ID: 6935...
     *
     * OR body:
     *   RFP ID: 6935...
     *
     * We do NOT require the subject to contain "Proposal".
     */
    const rfpId =
      extractRfpId(subject) ||
      extractRfpId(emailText);

    if (!rfpId) {
      logger.info(
        'Skipping vendor email because no RFP ID was found',
        {
          uid,
          subject,
          vendorEmail,
        }
      );

      /*
       * This is a vendor email, but it is not associated
       * with an RFP, so it cannot become a Proposal.
       */
      if (uid) {
        try {
          await connection.addFlags(uid, '\\Seen');
        } catch (err) {
          logger.warn(
            'Could not mark unrelated vendor email as Seen',
            err?.message || err
          );
        }
      }

      return;
    }

    logger.info(
      'Extracted RFP ID from vendor email',
      {
        rfpId,
        subject,
        vendorEmail,
      }
    );

    /*
     * --------------------------------------------------------
     * 5. Verify RFP exists
     * --------------------------------------------------------
     */
    let rfp;

    try {
      rfp = await Rfp.findById(rfpId);
    } catch (err) {
      logger.warn(
        'Invalid RFP ID found in vendor email',
        {
          rfpId,
          subject,
          vendorEmail,
          error: err?.message || err,
        }
      );

      if (uid) {
        try {
          await connection.addFlags(uid, '\\Seen');
        } catch { }
      }

      return;
    }

    if (!rfp) {
      logger.warn(
        'Skipping proposal because referenced RFP does not exist',
        {
          rfpId,
          uid,
          subject,
          vendorEmail,
        }
      );

      if (uid) {
        try {
          await connection.addFlags(uid, '\\Seen');
        } catch { }
      }

      return;
    }

    logger.info(
      'Matched vendor email to RFP',
      {
        rfpId: rfp._id.toString(),
        rfpTitle: rfp.title,
        vendorEmail,
        subject,
      }
    );

    /*
     * --------------------------------------------------------
     * 6. Verify sender
     * --------------------------------------------------------
     */
    const senderEmail =
      extractSenderEmail(parsedEmail);

    /*
     * The candidate already came from a registered vendor
     * email. This is an additional safety check.
     */
    if (
      senderEmail &&
      senderEmail !== vendorEmail.toLowerCase()
    ) {
      logger.warn(
        'Sender email does not match registered vendor',
        {
          senderEmail,
          vendorEmail,
          subject,
        }
      );

      if (uid) {
        try {
          await connection.addFlags(uid, '\\Seen');
        } catch { }
      }

      return;
    }

    /*
     * --------------------------------------------------------
     * 7. AI extraction
     * --------------------------------------------------------
     */
    let parsedProposal;

    try {
      logger.info(
        'Sending vendor email to AI parser',
        {
          vendorEmail,
          subject,
          rfpId,
        }
      );

      parsedProposal =
        await parseProposalFromEmail(
          emailText
        );
    } catch (err) {
      logger.error(
        'AI proposal parsing failed',
        {
          vendorEmail,
          subject,
          error: err?.message || err,
        }
      );

      /*
       * Don't create an incomplete proposal.
       *
       * We intentionally DON'T mark it as processed here,
       * so it can be retried on the next polling cycle.
       */
      return;
    }

    if (!parsedProposal) {
      logger.warn(
        'AI returned empty proposal',
        {
          uid,
          subject,
          vendorEmail,
        }
      );

      return;
    }

    logger.info(
      'AI parsed vendor proposal',
      {
        vendorEmail,
        subject,
        parsedProposal,
      }
    );

    /*
     * --------------------------------------------------------
     * 8. Normalize proposal items
     * --------------------------------------------------------
     */
    const items =
      Array.isArray(parsedProposal.items)
        ? parsedProposal.items
          .map((item) => {
            const qty =
              normalizeNumber(item.qty) || 1;

            const unitPrice =
              normalizeNumber(
                item.unitPrice ??
                item.unit_price
              );

            const totalPrice =
              normalizeNumber(
                item.totalPrice ??
                item.total_price
              );

            return {
              name:
                item.name ||
                'Unnamed item',
              qty,
              unitPrice,
              totalPrice,
              notes:
                item.notes || '',
            };
          })
          .filter(
            (item) =>
              item.name &&
              (
                item.unitPrice !== null ||
                item.totalPrice !== null
              )
          )
        : [];

    /*
     * Calculate total if AI did not provide one.
     */
    let total =
      normalizeNumber(
        parsedProposal.total ??
        parsedProposal.totalPrice
      );

    if (total === null) {
      total = items.reduce(
        (sum, item) => {
          if (
            item.totalPrice !== null
          ) {
            return (
              sum +
              item.totalPrice
            );
          }

          if (
            item.unitPrice !== null
          ) {
            return (
              sum +
              item.unitPrice *
              item.qty
            );
          }

          return sum;
        },
        0
      );
    }

    total =
      Number(total) || 0;

    /*
     * --------------------------------------------------------
     * 9. Validate AI output
     * --------------------------------------------------------
     *
     * We don't require every field to be present.
     *
     * A vendor may send:
     *
     * - price only
     * - price + delivery
     * - price + warranty
     * - a table
     * - free-form text
     *
     * As long as there is meaningful commercial information,
     * save the proposal.
     */
    const hasCommercialData =
      items.length > 0 ||
      total > 0 ||
      parsedProposal.deliveryDays ||
      parsedProposal.paymentTerms ||
      parsedProposal.warranty;

    if (!hasCommercialData) {
      logger.warn(
        'Skipping vendor email because AI could not find proposal information',
        {
          uid,
          subject,
          vendorEmail,
          parsedProposal,
        }
      );

      /*
       * Do NOT create a fake/mock proposal.
       */
      if (uid) {
        try {
          await connection.addFlags(uid, '\\Seen');
        } catch { }
      }

      return;
    }

    /*
     * --------------------------------------------------------
     * 10. Save Proposal
     * --------------------------------------------------------
     *
     * MANY proposals can point to ONE RFP.
     *
     * rfp     -> exact RFP extracted from email
     * vendor  -> registered vendor
     */
    const proposalDoc =
      await Proposal.create({
        rfp: rfp._id,

        vendor: vendorId,

        vendorName:
          vendorName ||
          parsedProposal.vendorName ||
          'Unknown vendor',

        items,

        total,

        deliveryDays:
          parseDeliveryDays(parsedProposal.deliveryDays) ||
          null,

        paymentTerms:
          parsedProposal.paymentTerms ||
          null,

        warranty:
          parsedProposal.warranty ||
          null,

        contactEmail:
          vendorEmail,

        rawEmail:
          emailText,
      });

    logger.info(
      'Saved vendor proposal successfully',
      {
        proposalId:
          proposalDoc._id.toString(),

        rfpId:
          rfp._id.toString(),

        rfpTitle:
          rfp.title,

        vendor:
          vendorName,

        vendorEmail,

        subject,
      }
    );

    /*
     * --------------------------------------------------------
     * 11. Record processed message
     * --------------------------------------------------------
     */
    if (messageId) {
      try {
        await ProcessedMessage.create({
          messageId,
          uid,
        });

        logger.info(
          'Recorded processed vendor email',
          {
            messageId,
            uid,
          }
        );
      } catch (err) {
        /*
         * Don't fail the proposal because the
         * processed-message record could not be created.
         */
        logger.warn(
          'Could not record ProcessedMessage',
          err?.message || err
        );
      }
    }

    /*
     * --------------------------------------------------------
     * 12. Mark email as Seen
     * --------------------------------------------------------
     */
    if (uid) {
      try {
        await connection.addFlags(
          uid,
          '\\Seen'
        );
      } catch (err) {
        logger.warn(
          'Failed to mark proposal email as Seen',
          err?.message || err
        );
      }
    }

  } catch (err) {
    logger.error(
      'Error processing proposal email',
      {
        uid,
        subject,
        vendorEmail,
        error: err?.message || err,
      }
    );
  }
}

/**
 * Start IMAP worker.
 */
async function startImapWorker() {
  if (!process.env.IMAP_HOST) {
    logger.warn(
      'IMAP not configured; skipping worker'
    );
    return;
  }

  if (isRunning) {
    return;
  }

  isRunning = true;

  const config =
    makeConfigFromEnv();

  let connection = null;

  try {
    connection =
      await connectAndWatch(config);
  } catch (err) {
    logger.error(
      'Unable to establish initial IMAP connection',
      err?.message || err
    );

    isRunning = false;

    return;
  }

  const POLL_INTERVAL =
    Number(
      process.env.IMAP_POLL_INTERVAL_MS
    ) || 30000;

  /**
   * Poll mailbox.
   */
  async function pollOnce() {
    /*
     * Prevent overlapping polls.
     */
    if (pollInProgress) {
      logger.info(
        'Skipping IMAP poll because previous poll is still running'
      );

      return;
    }

    pollInProgress = true;

    try {
      /*
       * Reconnect if the previous connection disappeared.
       */
      if (!connection) {
        connection =
          await connectAndWatch(config);
      }

      /*
       * ------------------------------------------------------
       * STEP 1 + STEP 2 + STEP 3
       *
       * Get registered vendors and find their latest
       * Proposal emails.
       * ------------------------------------------------------
       */
      const candidates =
        await findRecentVendorProposalEmails(
          connection
        );

      logger.info(
        `Processing up to ${candidates.length} recent vendor proposal email(s)`
      );

      /*
       * Process newest first.
       */
      for (const candidate of candidates) {
        await processProposalEmail(
          connection,
          candidate
        );
      }
    } catch (err) {
      logger.error(
        'IMAP polling error',
        err?.message || err
      );

      /*
       * Connection probably died.
       * Close and reconnect on next poll.
       */
      try {
        if (
          connection &&
          typeof connection.end ===
          'function'
        ) {
          await connection.end();
        }
      } catch (endErr) {
        logger.warn(
          'Error closing broken IMAP connection',
          endErr?.message || endErr
        );
      }

      connection = null;

      try {
        connection =
          await connectAndWatch(config);
      } catch (reconnectErr) {
        logger.error(
          'IMAP reconnect failed',
          reconnectErr?.message ||
          reconnectErr
        );
      }
    } finally {
      pollInProgress = false;
    }
  }

  /*
   * Poll periodically.
   */
  setInterval(
    () => {
      pollOnce().catch((err) => {
        logger.error(
          'Unexpected IMAP poll error',
          err?.message || err
        );
      });
    },
    POLL_INTERVAL
  );

  /*
   * Run immediately on startup.
   */
  pollOnce().catch((err) => {
    logger.error(
      'Initial IMAP poll error',
      err?.message || err
    );
  });
}

module.exports = {
  startImapWorker,
};