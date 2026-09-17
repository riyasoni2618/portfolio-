// server.js
require('dotenv').config();
const path = require('path');
const express = require('express');
const cors = require('cors');
const contactHandler = require('./api/contact');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve static frontend files
app.use(express.static(__dirname));

// Mount contact API endpoint
app.post('/api/contact', contactHandler);

// Fallback route to index.html for single page navigation
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'index.html'));
});

// Start server
app.listen(PORT, () => {
  console.log(`\n🚀 Portfolio server running at http://localhost:${PORT}`);
  console.log(`📬 Contact endpoint active at http://localhost:${PORT}/api/contact`);
  console.log(`📧 Target inbox configured as: ${process.env.CONTACT_EMAIL || 'riyaasoni178@gmail.com'}\n`);
});
