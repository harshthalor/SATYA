import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 8000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'healthy', service: 'server-core' });
});

// API Routes
app.get('/', (req, res) => {
  res.json({ 
    message: 'SATYA Platform - Universal Translator API',
    version: '0.1.0'
  });
});

// Start server
app.listen(PORT, () => {
  console.log(`Server Core running on port ${PORT}`);
});

