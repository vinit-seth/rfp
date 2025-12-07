require('dotenv').config();
const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const { connectDB } = require('./config/db');
const logger = require('./utils/logger');
const vendorsRoutes = require('./routes/vendors');
const rfpRoutes = require('./routes/rfp');
const proposalsRoutes = require('./routes/proposals');
const { startImapWorker } = require('./services/imapWorker');


const app = express();
app.use(bodyParser.json());

// enable CORS for your frontend origin (development)
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:3000',
  methods: ['GET','POST','PUT','PATCH','DELETE','OPTIONS'],
  allowedHeaders: ['Content-Type','Authorization','Accept'],
  credentials: true,
}));

app.use('/vendors', vendorsRoutes);
app.use('/rfps', rfpRoutes);
app.use('/proposals', proposalsRoutes);

app.get('/', (req, res) => res.json({ ok: true, ts: new Date().toISOString() }));

const PORT = process.env.PORT || 4000;

async function start() {
  try {
    await connectDB(process.env.MONGODB_URI || 'mongodb://localhost:27017/rfp_db');
    app.listen(PORT, () => {
      logger.info(`Server running on port ${PORT}`);
    });

    // start IMAP worker optionally
    startImapWorker();
  } catch (err) {
    logger.error('Failed to start app', err);
    process.exit(1);
  }
}

start();