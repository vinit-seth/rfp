# **AI-Powered RFP Manager**

Create RFPs in natural language, send them to vendors via email, automatically ingest proposal replies from an IMAP mailbox, parse them using AI, compare them, and recommend the best vendor.

---

# 🚀 **Project Setup**

## **Prerequisites**

| Tool                  | Version                 | Notes                                                         |
| --------------------- | ----------------------- | ------------------------------------------------------------- |
| **Node.js**           | ≥ 18.x                  | Tested on Node 22.x                                           |
| **MongoDB**           | ≥ 5.x                   | Local instance at `mongodb://localhost:27017/rfp_db`          |
| **NPM**               | ≥ 9.x                   | Installed with Node                                           |
| **AI API Key**        | OpenAI API key required | Used for natural-language → structured RFP & proposal parsing |
| **Email Credentials** | Gmail IMAP + SMTP       | Used for sending & receiving vendor emails                    |

---

# 📦 **Installation**

Clone repository:

```bash
git clone <repo-url>
cd RPF
```

---

# ⚙️ **Backend Setup**

### 1️⃣ Install dependencies

```bash
cd backend
npm install
```

### 2️⃣ Create `.env` file inside `backend/`

```env
PORT=4000
FRONTEND_URL=http://localhost:3000

# MongoDB
MONGODB_URI=mongodb://localhost:27017/rfp_db

# AI
OPENAI_API_KEY=your-api-key

# SMTP (sending emails)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=465
SMTP_USER=your-email@gmail.com
SMTP_PASS=app-password

# IMAP (reading vendor replies)
IMAP_HOST=imap.gmail.com
IMAP_PORT=993
IMAP_USER=your-email@gmail.com
IMAP_PASS=app-password
IMAP_TLS=true
IMAP_TLS_REJECT_UNAUTHORIZED=false
IMAP_POLL_INTERVAL_MS=30000
```

### 3️⃣ Start backend

```bash
npm run dev
```

Backend runs at:

```
http://localhost:4000
```

---

# 🎨 **Frontend Setup**

### 1️⃣ Install dependencies

```bash
cd frontend
npm install
```

### 2️⃣ Create `.env` file inside `frontend/`

```env
REACT_APP_API_URL=http://localhost:4000
```

### 3️⃣ Start frontend

```bash
npm start
```

Frontend runs at:

```
http://localhost:3000
```

---

# ✉️ **Email Sending & Receiving Configuration**

## **Sending RFP Emails**

Backend uses **SMTP** (Gmail recommended).

Required:

* Gmail **App Password** (not regular password)
* Enable **2-step verification**
* Set in `.env`:

```env
SMTP_USER=your-email@gmail.com
SMTP_PASS=your-app-password
```

## **Receiving Vendor Replies**

Uses **IMAP** worker (`imapWorker.js`) running automatically when the backend starts.

The worker:

* Connects to `INBOX`
* Polls every 30 seconds
* Reads only **UNSEEN**, **new emails** (ignores older than worker start)
* Parses email body using OpenAI
* Extracts:

  * vendor name
  * line items
  * total price
  * warranty / payment terms
* Stores result as a `Proposal` document

If using Gmail IMAP:

```env
IMAP_HOST=imap.gmail.com
IMAP_PORT=993
IMAP_USER=your-email@gmail.com
IMAP_PASS=your-app-password
IMAP_TLS=true
```

---

# 🧪 **Seed Data**

To generate one test proposal manually:

```bash
cd backend
node scripts/seedProposal.js
```

Or insert directly in MongoDB:

```js
db.proposals.insertOne({ vendorName: "Test Vendor", ... })
```

---

# 🧱 **Tech Stack**

### **Frontend**

* React (Create React App)
* React Router
* Fetch API
* Custom UI components

### **Backend**

* Node.js
* Express.js
* Mongoose (MongoDB ORM)
* Nodemailer (SMTP sending)
* imap-simple (IMAP email ingestion)

### **Database**

* MongoDB

### **AI Provider**

* OpenAI GPT-4.1 / GPT-4o (structured extraction, comparison, recommendation)

### **Email**

* Gmail SMTP + Gmail IMAP

---

# 📡 **API Documentation**

## **1. Create RFP**

### `POST /rfps`

**Body:**

```json
{ "text": "Buy 10 laptops with 16GB RAM..." }
```

**Response:**

```json
{
  "_id": "...",
  "title": "Laptop Purchase",
  "items": [ ... ]
}
```

---

## **2. Send RFP to Vendors**

### `POST /rfps/:id/send`

**Body:**

```json
{ "vendorIds": ["abc123", "def456"] }
```

**Response:**

```json
{
  "sent": [
    { "vendorId": "abc123", "ok": true }
  ]
}
```

---

## **3. Get RFP Detail**

### `GET /rfps/:id`

Returns RFP + proposals.

---

## **4. Compare Proposals for an RFP**

### `GET /rfps/:id/compare`

**Response:**

```json
{
  "proposals": [...],
  "ranking": [...]
}
```

---

## **5. Recommend Best Vendor**

### `POST /rfps/:id/recommend`

**Response:**

```json
{
  "recommendation": {
    "winner": "...",
    "score": 0.87
  }
}
```

---

## **6. List Proposals**

### `GET /proposals`

Returns all parsed & saved proposals.

---

# 🧠 **Decisions & Assumptions**

### **1. Email Parsing Strategy**

✔ Natural-language emails are unstructured
✔ Vendors may reply with bullet points or plain paragraphs
✔ AI model is instructed to extract a normalized structure:

```json
{
  "vendorName": "",
  "contactEmail": "",
  "items": [
    { "name": "", "qty": 0, "unitPrice": 0 }
  ],
  "total": 0,
  "deliveryDays": 0,
  "paymentTerms": "",
  "warranty": ""
}
```

If AI fails → the email is marked seen but no proposal is created.

---

### **2. IMAP Worker Safety**

* Only **new emails** (arriving after backend start) are processed
* Duplicate emails prevented using **message-id checksum**
* Any IMAP failures attempt reconnection automatically
* Prevent backend crashes by attaching safe listeners

---

### **3. RFP Matching Logic**

RFP for an incoming proposal is determined by:

1. Searching email body for pattern `"RFP: <title>"`
2. Else fallback to **most recently created RFP**

---

### **4. Comparison & Recommendation**

Model scoring criteria:

* **Price**
* **Quantity vs Requirements**
* **Delivery Days**
* **Warranty**
* **Payment Terms**
* **Overall completeness**

Weighting handled via AI in `rankProposals()`.

---

# 🤖 **AI Tools Usage**

| Tool                       | Used For                                                                                                                                                           |
| -------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| **ChatGPT (GPT-4o / 4.1)** | Parsing logic, regex patterns, model training prompts, debugging IMAP crash, building RFP and proposal extraction, writing email templates, architecture decisions |
| **GitHub Copilot**         | Scaffolding boilerplate React components, helper functions                                                                                                         |
| **Cursor Editor**          | Assisting in real-time refactoring and JS cleanups                                                                                                                 |

### **Key Prompts Used**

* “Parse a vendor reply email into structured JSON”
* “Fix IMAP ECONNRESET without crashing Node”
* “Design RFP & proposal comparison algorithm”
* “Rewrite this API to be REST-clean”
* “Create an entire React UI with vendor selection and comparison”

### **What AI Improved**

* Simplified parsing of unstructured emails
* Recommended IMAP safety patterns
* Helped design a cleaner RFP creation pipeline
* Auto-generated comparison logic
* Spotted React bugs (undefined route id, missing credentials, duplicate route mounts)

---

# ▶️ **How to Run Everything Locally**

### **Start MongoDB**

```bash
mongod
```

### **Start Backend**

```bash
cd backend
npm run dev
```

### **Start Frontend**

```bash
cd frontend
npm start
```

### **Open App**

```
http://localhost:3000
```

---

# 🎉 **You're Ready to Use the AI RFP Manager!**

