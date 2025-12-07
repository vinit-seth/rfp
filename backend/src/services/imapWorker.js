// backend/src/services/imapWorker.js
const imaps = require('imap-simple');
const simpleParser = require('mailparser').simpleParser;
const logger = require('../utils/logger');
const Vendor = require('../models/Vendor');
const Proposal = require('../models/Proposal');
const Rfp = require('../models/Rfp');
const ProcessedMessage = require('../models/ProcessedMessage');
const { parseProposalFromEmail } = require('./aiService');

const sleep = (ms) => new Promise((res) => setTimeout(res, ms));

let isRunning = false;

// worker start timestamp (used to skip old emails)
const workerStartTime = Date.now();

/** Format date for IMAP SINCE e.g. "7-Dec-2025" */
function formatImapDate(d) {
  const m = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];
  return `${d.getDate()}-${m[d.getMonth()]}-${d.getFullYear()}`;
}

const SINCE_DATE_STRING = formatImapDate(new Date(workerStartTime));

/** Build IMAP config from .env */
function makeConfigFromEnv() {
  return {
    imap: {
      user: process.env.IMAP_USER,
      password: process.env.IMAP_PASS,
      host: process.env.IMAP_HOST,
      port: Number(process.env.IMAP_PORT) || 993,
      tls: process.env.IMAP_TLS === 'true',
      tlsOptions: {
        rejectUnauthorized: process.env.IMAP_TLS_REJECT_UNAUTHORIZED !== 'false',
      },
      authTimeout: 10000,
      keepalive: { interval: 10000, idleInterval: 300000, forceNoop: true },
    }
  };
}

/** Establish IMAP connection + attach safe handlers */
async function connectAndWatch(config) {
  let attempt = 0;
  while (true) {
    attempt++;
    try {
      logger.info(`IMAP connect attempt ${attempt} to ${config.imap.host}`);
      const connection = await imaps.connect(config);

      connection.on("error", (err) => {
        logger.error("IMAP connection error (caught)", err?.message || err);
      });

      connection.on("close", () => {
        logger.warn("IMAP connection closed");
      });

      await connection.openBox("INBOX");
      logger.info("IMAP connected, watching INBOX");
      return connection;
    } catch (err) {
      logger.error("IMAP connect failed", err?.message || err);
      const backoff = Math.min(30000, 1000 * Math.pow(2, attempt - 1));
      logger.info(`Retrying IMAP connect in ${backoff}ms`);
      await sleep(backoff);
      if (!process.env.IMAP_HOST) throw new Error("IMAP disabled");
    }
  }
}

async function startImapWorker() {
  if (!process.env.IMAP_HOST) {
    logger.warn("IMAP not configured; skipping worker");
    return;
  }
  if (isRunning) return;
  isRunning = true;

  const config = makeConfigFromEnv();
  let connection = await connectAndWatch(config);

  const POLL_INTERVAL = Number(process.env.IMAP_POLL_INTERVAL_MS || 30000);

  /** MAIN POLLING FUNCTION */
  async function pollOnce() {
    if (!connection) {
      try { connection = await connectAndWatch(config); }
      catch (err) { logger.error("Reconnect failed", err); return; }
    }

    try {
      // 🔥 IMPORTANT FIX: USE SINCE FILTER
      const searchCriteria = [
        "UNSEEN",
        ["SINCE", SINCE_DATE_STRING]
      ];

      const fetchOptions = { bodies: [''], struct: true };
      const results = await connection.search(searchCriteria, fetchOptions);

      for (const res of results) {
        try {
          const uid = res.attributes?.uid || null;

          const part = Array.isArray(res.parts)
            ? res.parts.find(p => p.which === "" || p.which === undefined) || res.parts[0]
            : null;

          const rawEmail = part?.body || "";

          // Parse headers only
          let headerOnly = null;
          try {
            headerOnly = await simpleParser(rawEmail, { skipHtmlToText: true });
          } catch {
            logger.warn("Header-only parse failed");
          }

          const messageId =
            headerOnly?.messageId ||
            headerOnly?.message_id ||
            res.attributes?.["message-id"] ||
            null;

          // Prevent duplicate processing
          if (messageId) {
            const exists = await ProcessedMessage.findOne({ messageId });
            if (exists) {
              logger.info("Skipping duplicate email", { messageId, uid });
              if (uid) await connection.addFlags(uid, "\\Seen");
              continue;
            }
          }

          // Skip old emails
          let msgDate = headerOnly?.date instanceof Date
            ? headerOnly.date
            : new Date(res.attributes?.internalDate || Date.now());

          if (msgDate.getTime() < workerStartTime) {
            logger.info("Skipping old email", { uid, msgDate });
            if (uid) await connection.addFlags(uid, "\\Seen");
            continue;
          }

          // Full parse
          const parsed = headerOnly || await simpleParser(rawEmail);
          const text = parsed.text || parsed.html || "";

          // AI Parsing
          let parsedProposal = null;
          try {
            parsedProposal = await parseProposalFromEmail(text);
          } catch (err) {
            logger.error("AI parse failed", err?.message || err);
            if (uid) await connection.addFlags(uid, "\\Seen");
            continue;
          }

          // ❌ Skip useless parses (mock / empty)
          const meaningful =
            parsedProposal &&
            (
              (parsedProposal.vendorName && parsedProposal.vendorName.trim().length > 1) ||
              (Array.isArray(parsedProposal.items) && parsedProposal.items.length > 0) ||
              (parsedProposal.total && Number(parsedProposal.total) > 0)
            );

          if (!meaningful) {
            logger.info("Skipping empty AI parse (mock)", parsedProposal);
            if (uid) await connection.addFlags(uid, "\\Seen");
            continue;
          }

          // Vendor lookup / create
          let vendor = null;

          if (parsedProposal.contactEmail) {
            vendor = await Vendor.findOne({ email: parsedProposal.contactEmail });
          }
          if (!vendor && parsedProposal.vendorName) {
            vendor = await Vendor.findOne({ name: new RegExp(parsedProposal.vendorName, "i") });
          }
          if (!vendor) {
            vendor = await Vendor.create({
              name: parsedProposal.vendorName || "Unknown Vendor",
              email: parsedProposal.contactEmail || ""
            });
          }

          // Match RFP
          let rfp = null;
          const titleMatch = text.match(/RFP[:\s-]{1,20}([\w\s\-#]+)/i);
          if (titleMatch) {
            const title = titleMatch[1].trim();
            rfp = await Rfp.findOne({ title: new RegExp(title, "i") });
          }
          if (!rfp) rfp = await Rfp.findOne().sort({ createdAt: -1 });

          // Build items
          const items = (parsedProposal.items || []).map(it => ({
            name: it.name,
            qty: it.qty || 1,
            unitPrice: it.unitPrice ?? null,
            totalPrice: it.totalPrice ?? null,
            notes: it.notes || ""
          }));

          const total = parsedProposal.total ||
            items.reduce((s, it) => s + (it.totalPrice || (it.unitPrice * it.qty) || 0), 0);

          // Save proposal
          const proposalDoc = await Proposal.create({
            rfp: rfp?._id,
            vendor: vendor._id,
            vendorName: parsedProposal.vendorName || vendor.name,
            items,
            total,
            deliveryDays: parsedProposal.deliveryDays || null,
            paymentTerms: parsedProposal.paymentTerms || null,
            warranty: parsedProposal.warranty || null,
            contactEmail: parsedProposal.contactEmail || vendor.email,
            rawEmail: text
          });

          logger.info("Saved proposal", proposalDoc._id.toString());

          // Record processed message
          if (messageId) {
            await ProcessedMessage.create({ messageId, uid });
          }

          // Mark Seen
          if (uid) await connection.addFlags(uid, "\\Seen");

        } catch (err) {
          logger.error("Error processing email", err?.message || err);
        }
      }

    } catch (err) {
      logger.error("IMAP poll error", err?.message || err);

      // reconnect if needed
      try { await connection?.end(); } catch {}
      connection = null;
    }
  }

  // Schedule poll
  setInterval(() => pollOnce(), POLL_INTERVAL);

  // Run immediately
  pollOnce();
}

module.exports = { startImapWorker };