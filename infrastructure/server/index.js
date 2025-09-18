// server/index.js - Boilerplate server starter
const express = require('express');
const cors = require('cors');
const unlockRouter = require('./unlockController');

const app = express();
const PORT = process.env.PORT || 8080;

// Middleware
app.use(cors());
app.use(express.json());

// Mount unlock router
app.use('/api', unlockRouter);

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'ok', service: 'phase2-unlock', timestamp: new Date().toISOString() });
});

app.listen(PORT, () => {
  console.log(`🚀 Phase 2 Unlock Service running on port ${PORT}`);
  console.log(`📊 Download target: ${process.env.DOWNLOAD_TARGET || 1_000_000}`);
  console.log(`🔒 Admin tokens configured: ${(process.env.ADMIN_TOKENS || '').split(',').length}`);
});