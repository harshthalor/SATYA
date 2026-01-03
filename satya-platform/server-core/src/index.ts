import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import pool from './config/db';
import authRoutes from './routes/authRoutes';
import ballotRoutes from './routes/ballotRoutes';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 8080;

// Middleware (Security & Utilities)
app.use(cors());                 // Allows Member A (React) to talk to this server
app.use(express.json({ limit: '50mb' }));        // Parses incoming JSON data
app.use('/api/v1/auth', authRoutes);       // Auth Routes (Face Verification)
app.use('/api/v1/ballot', ballotRoutes);   // Ballot Routes (Fetch Candidates)

// Route 1: Health Check (To prove server is alive)
app.get('/', (req, res) => {
  res.json({ 
    project: "SATYA Platform", 
    status: "Active 🟢", 
    role: "Member B - Backend Core" 
  });
});

// Route 2: Fetch All Voters (To prove DB connection works)
app.get('/api/test-voters', async (req, res) => {
  try {
    // This queries the data you just seeded!
    const result = await pool.query('SELECT * FROM voters');
    res.json(result.rows);
  } catch (err: any) {
    console.error(err);
    res.status(500).json({ error: "Database Fetch Failed" });
  }
});

// Start the Server
app.listen(PORT, () => {
  console.log(`\n🚀 SATYA Backend running on http://localhost:${PORT}`);
  console.log(`👉 Test Link: http://localhost:${PORT}/api/test-voters\n`);
});