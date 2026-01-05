import { Router } from 'express';
import pool from '../config/db';
import jwt from 'jsonwebtoken';
import axios from 'axios';

const router = Router();
const JWT_SECRET = process.env.JWT_SECRET || 'satya_super_secret_key';
const LEDGER_URL = 'http://localhost:3000/cast-vote';

// --- MIDDLEWARE ---
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

// --- FETCH BALLOT ---
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

// --- CAST VOTE ---
router.post('/cast', authenticateToken, async (req: any, res: any) => {
  try {
    const { candidate_id } = req.body;
    const user = req.user; // Contains { id, epic_id, constituency_id }

    console.log(`\n🗳️ Vote Request from: ${user.epic_id}`);

    // 1. Double Check DB Status
    const voterData = await pool.query(
      'SELECT has_voted FROM voters WHERE id = $1', 
      [user.id]
    );

    if (voterData.rows.length === 0) return res.status(404).json({ message: "Voter not found" });
    if (voterData.rows[0].has_voted) return res.status(403).json({ message: "Access Denied: Already Voted" });

    // 2. Forward to Ledger
    // We use the EPIC ID from the token as the 'voterId' on the chain
    console.log(`🔗 Submitting to Blockchain...`);

    let ledgerResponse;
    try {
      ledgerResponse = await axios.post(LEDGER_URL, {
        voterId: user.epic_id, // 👈 CORRECT: Using EPIC ID
        candidateId: candidate_id,
        candidateState: "Delhi", // Or fetch dynamically from user.constituency
        district: "Delhi-NCR"
      });
    } catch (error: any) {
      console.error("❌ Ledger Rejected Vote:", error.response?.data || error.message);
      return res.status(503).json({ message: "Blockchain Transaction Failed" });
    }

    // 3. Mark Locally as Voted
    const txId = ledgerResponse.data.txId;
    await pool.query('UPDATE voters SET has_voted = true WHERE id = $1', [user.id]);

    console.log(`✅ Vote Committed! TX: ${txId}`);

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