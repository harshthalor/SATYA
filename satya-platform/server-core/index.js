const express = require('express');
const cors = require('cors');
const axios = require('axios');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 8000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Environment variables
const AI_AUTH_SERVICE_URL = process.env.AI_AUTH_SERVICE_URL || 'http://localhost:8001';
const BLOCKCHAIN_NETWORK_URL = process.env.BLOCKCHAIN_NETWORK_URL || 'http://localhost:7054';

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'healthy', service: 'server-core' });
});

// API Routes
app.get('/', (req, res) => {
  res.json({ 
    message: 'SATYA Platform - Universal Translator API',
    version: '0.1.0',
    services: {
      aiAuth: AI_AUTH_SERVICE_URL,
      blockchain: BLOCKCHAIN_NETWORK_URL
    }
  });
});

// Proxy to AI Auth Service
app.post('/api/auth/verify-face', async (req, res) => {
  try {
    const response = await axios.post(`${AI_AUTH_SERVICE_URL}/verify-face`, req.body);
    res.json(response.data);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Proxy to Blockchain Network
app.get('/api/blockchain/voter/:id', async (req, res) => {
  try {
    const response = await axios.get(`${BLOCKCHAIN_NETWORK_URL}/voter/${req.params.id}`);
    res.json(response.data);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Start server
app.listen(PORT, () => {
  console.log(`Server Core running on port ${PORT}`);
  console.log(`AI Auth Service: ${AI_AUTH_SERVICE_URL}`);
  console.log(`Blockchain Network: ${BLOCKCHAIN_NETWORK_URL}`);
});

