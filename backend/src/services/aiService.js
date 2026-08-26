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
const prompt = `
You are given a vendor email response to an RFP.

Extract ONLY valid JSON using exactly these fields:

{
  "vendorName": string | null,
  "items": [
    {
      "name": string,
      "qty": number,
      "specs": string | null,
      "unitPrice": number | null,
      "totalPrice": number | null,
      "notes": string | null
    }
  ],
  "totalPrice": number | null,
  "deliveryDays": number | null,
  "paymentTerms": string | null,
  "warranty": string | null,
  "contactEmail": string | null,
  "title": string | null,
  "description": string | null
}

Rules:
- Convert all prices to plain numbers without currency symbols or commas.
- deliveryDays MUST be a number representing days.
- Convert weeks to days. For example, "2 weeks" = 14.
- If delivery information is unavailable, use null.
- Preserve paymentTerms exactly as stated by the vendor.
- Preserve warranty exactly as stated by the vendor.
- Do not invent missing information.
- Return ONLY valid JSON.

Vendor email:

${emailText}
`;

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
  } catch (error) {
    if (error?.status === 429 || error?.statusCode === 429) {
      logger.warn(
        "Gemini rate limit reached. Proposal will be retried later."
      );
    } else {
      logger.error(
        "Gemini proposal parsing failed",
        error
      );
    }

    throw error;
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
    throw err;
  }
}

module.exports = { parseRfpFromText, parseProposalFromEmail, rankProposals };