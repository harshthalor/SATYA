import { Router } from 'express';
import pool from '../config/db';
import jwt from 'jsonwebtoken';
import axios from 'axios';

const router = Router();
const JWT_SECRET = process.env.JWT_SECRET || 'satya_super_secret_key';

// ✅ THE LEDGER URL: Points to the Blockchain Gateway running on Port 3000
const LEDGER_URL = process.env.LEDGER_SERVICE_URL || 'http://127.0.0.1:3000/cast-vote';

// --- AUTH MIDDLEWARE ---
const authenticateToken = (req: any, res: any, next: any) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) return res.status(401).json({ message: "Access Denied" });

  jwt.verify(token, JWT_SECRET, (err: any, user: any) => {
    if (err) return res.status(403).json({ message: "Invalid Token" });
    req.user = user;
    next();
  });
};

// --- ROUTE 1: FETCH BALLOT ---
router.get('/', authenticateToken, async (req: any, res: any) => {
  try {
    const constituencyId = req.user.constituency_id;
    const query = `
      SELECT c.id, c.name, c.party, c.symbol_url, cons.name as constituency_name
      FROM candidates c
      JOIN constituencies cons ON c.constituency_id = cons.id
      WHERE c.constituency_id = $1
    `;
    const result = await pool.query(query, [constituencyId]);

    res.json({
      constituency: result.rows[0]?.constituency_name || "Unknown",
      candidates: result.rows
    });
  } catch (err) {
    res.status(500).json({ message: "Failed to fetch ballot" });
  }
});

// Add this route to your existing src/routes/voteRoutes.ts
router.post('/cast', authenticateToken, async (req: any, res: any) => {
  try {
    const { candidate_id } = req.body;
    const user = req.user; 

    // 1. Fetch the Biometric Hash (The ID recognized by the Ledger)
    const voterData = await pool.query(
      'SELECT has_voted, biometric_hash FROM voters WHERE id = $1', 
      [user.id]
    );

    if (voterData.rows.length === 0) return res.status(404).json({ message: "Voter not found" });
    if (voterData.rows[0].has_voted) return res.status(403).json({ message: "Access Denied: Already Voted" });

    const voterHash = voterData.rows[0].biometric_hash;

    // 2. Forward to the Ledger Gateway
    console.log(`🔗 Forwarding to Ledger for hash: ${voterHash.substring(0, 10)}...`);

    let ledgerResponse;
    try {
      ledgerResponse = await axios.post(LEDGER_URL, {
        voterId: voterHash,       // 👈 CHANGED: Use Hash instead of ID "1"
        candidateId: candidate_id,
        candidateState: "Bihar",  // 👈 CHANGED: Use "Bihar" to match your register_face.js
        district: "Patna"
      });
    } catch (error: any) {
      console.error("❌ Ledger Error:", error.response?.data || error.message);
      return res.status(503).json({ message: "Blockchain Ledger Rejected Vote" });
    }

    // 3. Update Local Postgres
    const txId = ledgerResponse.data.txId;
    await pool.query('UPDATE voters SET has_voted = true WHERE id = $1', [user.id]);

    res.json({
      success: true,
      message: "Vote Recorded on Ledger",
      transactionId: txId
    });

  } catch (err) {
    console.error("Voting Error:", err);
    res.status(500).json({ message: "Internal Server Error" });
  }
});
export default router;