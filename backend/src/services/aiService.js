const OpenAI = require('openai');
const logger = require('../utils/logger');

const client = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
const MODEL = process.env.OPENAI_MODEL || 'gpt-4o';

// to avoid calling api during testing or development
const USE_MOCK_AI = 'true';
if (USE_MOCK_AI) {
  // early exports: return mock implementations so no OpenAI calls are made
  module.exports = {
    parseRfpFromText: async (text) => ({ title: 'mock', description: text, items: [] }),
    parseProposalFromEmail: async (text) => ({ vendorName:'mock', items: [], total: null, contactEmail: null }),
    rankProposals: async () => []
  };
  return;
}


async function parseRfpFromText(text) {
  const prompt = `Extract a structured RFP JSON from this user description. Return ONLY valid JSON with keys: title, description, items (array of {name, qty, specs, unitBudget}), budget (number or null), deliveryDays (number or null), paymentTerms, warranty. If a field can't be determined, use null or empty list.\n\nUser text:\n"""\n${text}\n"""`;
  try {
    const res = await client.chat.completions.create({
      model: MODEL,
      messages: [{ role: 'user', content: prompt }],
      temperature: 0.0
    });
    const content = res.choices?.[0]?.message?.content ?? res.choices?.[0]?.text;
    const jsonStart = content.indexOf('{');
    const json = jsonStart >= 0 ? content.slice(jsonStart) : content;
    return JSON.parse(json);
  } catch (err) {
    logger.error('parseRfpFromText error', err);
    throw err;
  }
}

// async function parseProposalFromEmail(emailText) {
//   const prompt = `You are given a vendor email response. Extract ONLY JSON with fields: vendorName, items (array of {name, qty, unitPrice, totalPrice, notes}), total, deliveryDays (number or null), paymentTerms, warranty, contactEmail (if present), notes. Return valid JSON only.\n\nEmail:\n\n${emailText}`;
//   try {
//     const res = await client.chat.completions.create({ model: MODEL, messages: [{ role: 'user', content: prompt }], temperature: 0.0 });
//     const content = res.choices?.[0]?.message?.content ?? res.choices?.[0]?.text;
//     const jsonStart = content.indexOf('{');
//     const json = jsonStart >= 0 ? content.slice(jsonStart) : content;
//     return JSON.parse(json);
//   } catch (err) {
//     logger.error('parseProposalFromEmail error', err);
//     throw err;
//   }
// }

// inside aiService.js near parseProposalFromEmail
async function parseProposalFromEmail(emailText) {
  try {
    // existing OpenAI call
    const res = await client.chat.completions.create({ /* ... */ });
    // parse as before
    return JSON.parse(parsedJson);
  } catch (err) {
    logger.error('parseProposalFromEmail error', err);
    // If it's a rate-limit / quota error, fall back to a cheap mock parser
    if (err?.code === 'insufficient_quota' || err?.status === 429) {
      logger.warn('OpenAI quota exceeded — using mock parser fallback');
      // Return a minimal mock structure used by your worker
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
    throw err; // rethrow other errors
  }
}


// async function rankProposals(rfp, proposals) {
//   const prompt = `You are an assistant that ranks vendor proposals against an RFP. RFP: ${JSON.stringify(rfp)}\nProposals: ${JSON.stringify(proposals)}\nFor each proposal return: id (use index or id), score (0-100), and short rationale. Return ONLY valid JSON as array.`;
//   try {
//     const res = await client.chat.completions.create({ model: MODEL, messages: [{ role: 'user', content: prompt }], temperature: 0.0 });
//     const content = res.choices?.[0]?.message?.content ?? res.choices?.[0]?.text;
//     const jsonStart = content.indexOf('[');
//     const json = jsonStart >= 0 ? content.slice(jsonStart) : content;
//     return JSON.parse(json);
//   } catch (err) {
//     logger.error('rankProposals error', err);
//     throw err;
//   }
// }

async function rankProposals(rfp, proposals) {
  try {
    const prompt = `
You are a procurement analyst. Given this RFP and the vendor proposals, score each proposal 0-100 and give a short rationale.
RFP: ${JSON.stringify(rfp)}
Proposals: ${JSON.stringify(proposals)}
Return a JSON array: [{ id: "<proposal-id-or-index>", score: <number 0-100>, rationale: "<short text>" }]
Respond ONLY with valid JSON.
    `;

    const response = await client.responses.create({
      model: DEFAULT_MODEL,
      input: prompt,
      // set temperature low for determinism
      temperature: 0.0,
      max_output_tokens: 800
    });

    // response.output_text or response.output[0].content[0].text depending on the SDK version
    const raw = response.output?.[0]?.content?.map(c => c.text || '').join('') ?? response.output_text ?? '';
    // find first JSON substring
    const jsonStart = raw.indexOf('[');
    const jsonText = jsonStart >= 0 ? raw.slice(jsonStart) : raw;
    const parsed = JSON.parse(jsonText);
    return parsed;
  } catch (err) {
    logger.error('rankProposals error', err);
    // fallback: simple deterministic ranking by price (if available)
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