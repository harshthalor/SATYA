import { Router } from 'express';
import pool from '../config/db';
import jwt from 'jsonwebtoken';
import axios from 'axios';

const router = Router();
const JWT_SECRET = process.env.JWT_SECRET || 'satya_super_secret_key';

// 🔗 Point this to your server-core Fabric Gateway
const LEDGER_URL = 'http://localhost:3000/cast-vote'; 

// 🆔 CONSTANTS
const CURRENT_ELECTION_ID = "SATYA_LS_2026"; 
const BOOTH_ID = "SATYA_WEB_REMOTE";

// --- MIDDLEWARE ---
const authenticateToken = (req: any, res: any, next: any) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) return res.status(401).json({ message: "Access Denied" });

  jwt.verify(token, JWT_SECRET, (err: any, user: any) => {
    if (err) return res.status(403).json({ message: "Invalid Token" });
    
    // ⚠️ SCHEMA MAPPING: Ensure the user object matches the 'voters' table columns
    req.user = user; 
    next();
  });
};

// --- FETCH BALLOT ---
router.get('/', authenticateToken, async (req: any, res: any) => {
  try {
    // ⚠️ SCHEMA FIX: Changed 'constituency_id' to 'home_constituency_id' based on 'voters' table
    const constituencyId = req.user.home_constituency_id; 

    if (!constituencyId) {
        return res.status(400).json({ message: "Invalid Voter Data: No Home Constituency ID" });
    }

    // Query matches 'candidates' and 'constituencies' schema exactly
    const query = `
      SELECT 
        c.id, 
        c.name, 
        c.party, 
        c.symbol_url, 
        cons.name as constituency_name, 
        cons.state
      FROM candidates c
      JOIN constituencies cons ON c.constituency_id = cons.id
      WHERE c.constituency_id = $1
    `;
    const result = await pool.query(query, [constituencyId]);

    res.json({
      constituency: result.rows[0]?.constituency_name || "Unknown",
      state: result.rows[0]?.state || "Unknown",
      candidates: result.rows
    });
  } catch (err) {
    console.error("Ballot Fetch Error:", err);
    res.status(500).json({ message: "Failed to fetch ballot" });
  }
});

// --- CAST VOTE (UPGRADED) ---
router.post('/cast', authenticateToken, async (req: any, res: any) => {
  try {
    const { candidate_id } = req.body;
    const user = req.user; // Contains { id, epic_id, home_constituency_id, ... }

    console.log(`\n🗳️ Vote Request from: ${user.epic_id}`);

    // --- STEP 1: LOCAL DB VALIDATION (FAIL FAST) ---
    // Schema Check: 'has_voted' column in 'voters' table
    const voterCheck = await pool.query(
      'SELECT has_voted FROM voters WHERE id = $1', 
      [user.id]
    );

    if (voterCheck.rows.length === 0) return res.status(404).json({ message: "Voter not found" });
    if (voterCheck.rows[0].has_voted) return res.status(403).json({ message: "Access Denied: Already Voted (Local DB)" });

    // --- STEP 2: GET CANDIDATE METADATA ---
    // Schema Check: 'state' column in 'constituencies' table
    const candidateQuery = `
      SELECT c.id, cons.state 
      FROM candidates c 
      JOIN constituencies cons ON c.constituency_id = cons.id 
      WHERE c.id = $1
    `;
    const candidateResult = await pool.query(candidateQuery, [candidate_id]);
    
    if (candidateResult.rows.length === 0) {
        return res.status(400).json({ message: "Invalid Candidate ID" });
    }

    const candidateState = candidateResult.rows[0].state;

    // --- STEP 3: SUBMIT TO BLOCKCHAIN GATEWAY ---
    console.log(`🔗 Submitting to Blockchain...`);
    console.log(`   Election: ${CURRENT_ELECTION_ID}`);
    // ⚠️ SCHEMA FIX: Using 'home_constituency_id' for logging clarity
    console.log(`   State Match: Voter(Constituency ${user.home_constituency_id}) -> Candidate(${candidateState})`);

    let ledgerResponse;
    try {
      ledgerResponse = await axios.post(LEDGER_URL, {
        electionId: CURRENT_ELECTION_ID,
        voterID: user.epic_id, // Matches 'epic_id' from voters table
        candidateID: candidate_id,
        candidateState: candidateState,
        boothLocation: BOOTH_ID
      });

    } catch (error: any) {
      const ledgerError = error.response?.data?.error || error.message;
      console.error("❌ Ledger Rejected Vote:", ledgerError);
      
      if (ledgerError.includes("Vote Token")) {
         return res.status(403).json({ message: "Voting Token Missing or Invalid. Please Re-login." });
      }
      if (ledgerError.includes("Double Voting")) {
         return res.status(409).json({ message: "CRITICAL: Double Voting Detected on Ledger!" });
      }

      return res.status(503).json({ message: "Blockchain Transaction Failed", details: ledgerError });
    }

    // --- STEP 4: UPDATE LOCAL DB ---
    const txId = ledgerResponse.data.txId;
    
    // Schema Check: 'voters' table update
    await pool.query('UPDATE voters SET has_voted = true WHERE id = $1', [user.id]);

    console.log(`✅ Vote Committed! TX: ${txId}`);

    res.json({
      success: true,
      message: "Vote Recorded on SATYA Ledger",
      transactionId: txId,
      timestamp: new Date().toISOString()
    });

  } catch (err) {
    console.error("Voting System Error:", err);
    res.status(500).json({ message: "Internal Server Error" });
  }
});

export default router;