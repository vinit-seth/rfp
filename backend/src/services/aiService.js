const { GoogleGenAI } = require('@google/genai');
const logger = require('../utils/logger');

// Initializes the client (pulls GEMINI_API_KEY from environment variables)
const client = new GoogleGenAI({});

// Using the recommended modern model
const MODEL = process.env.GEMINI_MODEL || 'gemini-3.5-flash';

// To avoid calling api during testing or development
const USE_MOCK_AI = false;
if (USE_MOCK_AI) {
  module.exports = {
    parseRfpFromText: async (text) => ({ title: 'mock', description: text, items: [] }),
    parseProposalFromEmail: async (text) => ({ vendorName: 'mock', items: [], total: null, contactEmail: null }),
    rankProposals: async () => []
  };
  return;
}

// Helper to safely parse JSON in case the API returns Markdown wrappers (e.g., ```json)
function extractJSON(text) {
  if (!text) return {};
  const jsonStart = text.indexOf('{');
  const arrayStart = text.indexOf('[');

  let start = -1;
  if (jsonStart !== -1 && arrayStart !== -1) start = Math.min(jsonStart, arrayStart);
  else if (jsonStart !== -1) start = jsonStart;
  else if (arrayStart !== -1) start = arrayStart;

  const cleanText = start >= 0 ? text.slice(start) : text;

  // Strip trailing markdown backticks
  return JSON.parse(cleanText.replace(/```[a-zA-Z]*\n/g, '').replace(/```$/g, '').trim());
}

async function parseRfpFromText(text) {
  const prompt = `Extract a structured RFP JSON from this user description. Return ONLY valid JSON with keys: title, description, items (array of {name, qty, specs, unitBudget}), budget (number or null), deliveryDays (number or null), paymentTerms, warranty. If a field can't be determined, use null or empty list.\n\nUser text:\n"""\n${text}\n"""`;

  try {
    const interaction = await client.interactions.create({
      model: MODEL,
      input: prompt,
      // 1. temperature goes inside generation_config
      generation_config: {
        temperature: 0.0
      },
      // 2. JSON mode is declared via response_format at the root
      response_format: {
        type: 'text',
        mime_type: 'application/json'
      }
    });

    return extractJSON(interaction.output_text);
  } catch (err) {
    logger.error('parseRfpFromText error', err);
    throw err;
  }
}

async function parseProposalFromEmail(emailText) {
  const prompt = `You are given a vendor email response. Extract ONLY JSON with fields: vendorName, items (array of {name, qty, specs, unitPrice, totalPrice, notes}), totalPrice, deliveryDays (number or weeks), paymentTerms, warranty, contactEmail (if present), title, description. Return valid JSON only.\n\nEmail:\n\n${emailText}`;

  try {
    const interaction = await client.interactions.create({
      model: MODEL,
      input: prompt,
      generation_config: {
        temperature: 0.0
      },
      response_format: {
        type: 'text',
        mime_type: 'application/json'
      }
    });

    return extractJSON(interaction.output_text);
  } catch (err) {
    logger.error('parseProposalFromEmail error', err);

    if (err?.status === 429) {
      logger.warn('Gemini quota exceeded — using mock parser fallback');
      return {
        vendorName: 'Unknown (mock)',
        items: [],
        total: null,
        deliveryDays: null,
        paymentTerms: null,
        warranty: null,
        contactEmail: null,
        notes: emailText.slice(0, 1000)
      };
    }
    throw err;
  }
}

async function rankProposals(rfp, proposals) {
  try {
    const prompt = `You are a procurement analyst. Given this RFP and the vendor proposals, score each proposal 0-100 and give a short rationale.
    RFP: ${JSON.stringify(rfp)}
    Proposals: ${JSON.stringify(proposals)}
    Return a JSON array: [{ "id": "<proposal-id-or-index>", "score": <number 0-100>, "rationale": "<short text>" }]
    Respond ONLY with valid JSON.`;

    const interaction = await client.interactions.create({
      model: MODEL,
      input: prompt,
      generation_config: {
        temperature: 0.0
      },
      response_format: {
        type: 'text',
        mime_type: 'application/json'
      }
    });

    return extractJSON(interaction.output_text);
  } catch (err) {
    logger.error('rankProposals error', err);
    try {
      const fallback = proposals.map((p, idx) => {
        const total = p.total ?? 0;
        return { id: p._id ?? idx, score: 100 - Math.round(total), rationale: 'Fallback: lower price preferred' };
      });
      return fallback;
    } catch (e) {
      throw err;
    }
  }
}

module.exports = { parseRfpFromText, parseProposalFromEmail, rankProposals };