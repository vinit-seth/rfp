# RFP Management — README

A small single-user procurement helper: create RFPs from natural language, send to vendors, receive vendor proposals by email, extract structured proposal data with AI, compare proposals and recommend a vendor.

---

## Table of contents

- Project Setup
- Tech stack
- API documentation
- How the system works (design & assumptions)
- AI tools usage
- Scripts & seed data
- Email configuration (send/receive)
- Running locally
- Troubleshooting & notes

---

## Project Setup

### Prerequisites
- Node.js (tested with Node 18+ / Node 20+). Run `node -v` to verify.
- MongoDB (local or remote). Example local URI: `mongodb://localhost:27017/rfp_db`.
- OpenAI (or other AI) API key if you want the AI parsing/ranking features.
- A working SMTP account for sending emails (Gmail, SES, etc.) for full functionality.
- A Gmail account configured for IMAP if you want inbound email parsing.

### Important environment variables
Create a `.env` file in the **backend** folder with at least:

```

MONGODB_URI=mongodb://localhost:27017/rfp_db
PORT=4000
FRONTEND_URL=[http://localhost:3000](http://localhost:3000)

# OpenAI

OPENAI_API_KEY=sk-...

# IMAP (inbound)

IMAP_HOST=imap.gmail.com
IMAP_PORT=993
IMAP_USER=[you@gmail.com](mailto:you@gmail.com)
IMAP_PASS=app-password-or-token
IMAP_TLS=true
IMAP_TLS_REJECT_UNAUTHORIZED=false

# SMTP (outbound)

EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=[you@gmail.com](mailto:you@gmail.com)
EMAIL_PASS=your-smtp-password-or-app-password
EMAIL_FROM="Your Name [your.email@gmail.com](mailto:your.email@gmail.com)"

````

> **Security:** Do not commit `.env`. Put it into `.gitignore`.

---

## Install steps

### Backend
```bash
cd backend
npm install
# ensure .env is present
npm run dev   # or npm start / npm run dev depending on your package.json scripts
````

### Frontend (Create React App)

```bash
cd rpf-management
npm install
npm start
# frontend runs at http://localhost:3000 by default
```

---

## How to configure email sending/receiving

### Outbound (send RFPs)

* Configure SMTP in `.env` (EMAIL_HOST/EMAIL_PORT/EMAIL_USER/EMAIL_PASS).
* If using Gmail, create an app password and set `secure:false, port:587` (STARTTLS). Nodemailer will use these values in the backend `emailService`.

### Inbound (IMAP)

* Configure IMAP_* env variables.
* For Gmail, enable IMAP and use an app password if two-factor auth is enabled.
* `IMAP_TLS_REJECT_UNAUTHORIZED=false` may be necessary in dev only (not recommended for production).
* The IMAP worker ignores emails older than the worker start time and deduplicates by `Message-ID` using a `ProcessedMessage` collection.

---

## Running everything locally (summary)

1. Start MongoDB (local server or a managed URI).
2. Start backend:

   * `cd backend`
   * ensure `.env` exists
   * `npm run dev`
3. Start frontend:

   * `cd rpf-management`
   * `npm start`
4. Open [http://localhost:3000](http://localhost:3000)

---

## Seed data / scripts

* `backend/scripts/seed.js` and `backend/scripts/seedProposal.js` create sample RFPs, Vendors, Proposals if you need demo data.
* Example:

  ```bash
  # on Windows PowerShell:
  $env:MONGODB_URI="mongodb://localhost:27017/rfp_db"; node backend/scripts/seedProposal.js
  ```

---

## Tech Stack

* Frontend: React (Create React App), CSS
* Backend: Node.js + Express
* Database: MongoDB (Mongoose models)
* AI provider: OpenAI (via `openai` package) — parse RFPs / proposals, rank proposals
* Email: Nodemailer for SMTP sending; `imap-simple` + `mailparser` for inbound email
* Key libraries: axios/fetch (frontend), mongoose, nodemailer, imap-simple, mailparser, dotenv

---

## API Documentation (main endpoints)

Base URL: `http://localhost:4000`

### `POST /rfps`

Create an RFP by natural language.
**Body**

```json
{ "text": "I need 20 laptops 16GB RAM, 15 monitors 27-inch, budget $50,000 ..." }
```

**Success 201**

```json
{ "_id": "...", "title": "...", "items": [...], ... }
```

### `GET /rfps/:id`

Get RFP and related proposals.
**Success 200**

```json
{ "rfp": { ... }, "proposals": [ ... ] }
```

### `POST /rfps/:id/send`

Send RFP to vendors.
**Body**

```json
{ "vendorIds": ["60ab...", "60ac..."] }
```

**Success 200**

```json
{ "sent": [ { "vendorId": "60ab...", "ok": true }, {...} ] }
```

### `GET /rfps/:id/compare`

Compare and rank proposals for an RFP (calls AI ranker)
**Success 200**

```json
{ "proposals": [...], "ranking": [...] }
```

### `POST /rfps/:id/recommend`

Return recommendation (AI-assisted) for best vendor for an RFP.
**Success 200**

```json
{ "recommendation": [ { "id": 0, "score": 87, "rationale": "..." }, ... ] }
```

### `GET /vendors`

List vendors.

### `POST /vendors`

Create vendor `{ "name": "...", "email": "..." }`.

### `GET /proposals`

List proposals. Each proposal includes vendor and rfp references.

**Errors**

* 400: Bad request (missing/invalid params)
* 404: Not found
* 500: Server error (inspect response payload for details)

---

## Decisions & Assumptions

### Models & flow

* RFPs: structured object (title, description, items, budget, deliveryDays, paymentTerms, warranty).
* Vendors: basic master (name, email).
* Proposals: linked to RFP and Vendor; store parsed items and totals; we persist raw email for audit.
* ProcessedMessage: store `messageId` and `uid` to deduplicate inbound emails.

### Email assumptions

* Vendor replies contain a `Message-ID` header (used to dedupe).
* If email `Date` is older than worker start time, it is ignored to avoid processing historic mailboxes.
* AI parsing might fail or return partial results; system handles failures gracefully (mark seen and log).

### AI scoring & ranking

* Basic ranking uses AI (rankProposals) to score proposals 0–100 based on price, delivery, warranty, and completeness.
* Ranking is additive / heuristic; you can extend with domain-specific scoring.

---

## AI Tools Usage

* **OpenAI** via official SDK for:

  * `parseRfpFromText` — turn natural-language into structured RFP JSON.
  * `parseProposalFromEmail` — extract vendor name, items, prices, delivery, contact.
  * `rankProposals` — score and justify proposals.
* Prompts are kept deterministic (`temperature: 0`) where structure is required.
* Also used ChatGPT/Copilot for debugging & scaffolding during development.

---

## Troubleshooting & Notes

* **CORS errors**: ensure backend CORS allows `http://localhost:3000` and `credentials: true`.
* **IMAP TLS**: in dev you may need `IMAP_TLS_REJECT_UNAUTHORIZED=false` — not for production.
* **OpenAI quota**: 429 errors mean quota exhausted. Add checks and fallbacks if needed.
* **Seeding**: Use the included seed scripts when your DB is empty.
* **Git**: ensure `.env` and `node_modules` are in `.gitignore`. Remove cached items with `git rm --cached <path>` when necessary.

---

## Useful commands

```bash
# backend
cd backend
npm install
npm run dev

# frontend
cd rpf-management
npm install
npm start

# seed (example)
node backend/scripts/seedProposal.js

# remove committed file from git (if accidentally committed)
git rm --cached .env
git commit -m "remove .env"
git push
```

---

## Final notes

* This repository is designed as a single-user demo / assignment. Hardening, authentication, multi-user support, and production-grade email/secret handling are left as next steps.