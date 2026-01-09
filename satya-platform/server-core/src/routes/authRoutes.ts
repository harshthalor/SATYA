import { Router } from 'express';
import pool from '../config/db';
import jwt from 'jsonwebtoken';
import axios from 'axios';
import { ensureFaceSetExists, searchFace } from '../utils/facepp'; 

const router = Router();
const JWT_SECRET = process.env.JWT_SECRET;
if (!JWT_SECRET) throw new Error("Missing JWT_SECRET in .env");

// 🔗 CONFIGURATION
const LEDGER_BASE_URL = 'http://localhost:3000'; // Gateway URL
const CURRENT_ELECTION_ID = "SATYA_LS_2026";     // Must match your Chaincode Election ID

router.post('/scan', async (req: any, res: any) => {
  try {
    const { imageBase64 } = req.body;
    console.log(`\n📸 Received Login Request.`);

    await ensureFaceSetExists();
    const cleanBase64 = imageBase64.replace(/^data:image\/\w+;base64,/, "");

    // 1. SEARCH FACE
    const searchResult = await searchFace(cleanBase64);

    if (!searchResult || !searchResult.matchFound) {
        console.log("⛔ Face not recognized.");
        return res.status(401).json({ message: "Face not recognized. Please register first." });
    }

    // Success! searchResult.userId is the EPIC ID
    const recognizedEpicId = searchResult.userId;
    console.log(`✅ Identified User: ${recognizedEpicId}`);

    // =================================================================
    // 🆕 AUTOMATIC TOKEN MINTING (The Fix)
    // =================================================================
    try {
        console.log(`🎫 Auto-Minting Ballot Token for ${recognizedEpicId}...`);
        
        // This ensures the voter has a valid "Ballot Paper" on the blockchain
        // before they even reach the voting screen.
        await axios.post(`${LEDGER_BASE_URL}/mint-token`, {
            electionId: CURRENT_ELECTION_ID,
            voterID: recognizedEpicId
        });
        
        console.log(`✅ Token Ready on Ledger.`);
    } catch (mintError: any) {
        // If error is 409, it means token ALREADY exists. That is PERFECT.
        if (mintError.response && mintError.response.status === 409) {
            console.log(`ℹ️ Token already exists for this user. Proceeding.`);
        } else {
            // Log other errors but DO NOT block login.
            console.error(`⚠️ Token Minting Warning:`, mintError.message);
        }
    }
    // =================================================================

    // 2. CHECK BLOCKCHAIN STATUS
    try {
        const ledgerRes = await axios.get(`${LEDGER_BASE_URL}/query/${recognizedEpicId}`);
        const rawData = ledgerRes.data.response || ledgerRes.data; 
        const ledgerData = typeof rawData === 'string' ? JSON.parse(rawData) : rawData;

        if (ledgerData.hasVoted === true) {
             return res.status(403).json({ message: "⛔ SECURITY ALERT: Blockchain says you have already voted!" });
        }
    } catch (bcError) {
        // If query fails, it might just mean they aren't on the chain yet.
        console.log("⚠️ Identity not found on Blockchain (checking local DB...)");
    }

    // 3. DB LOOKUP & TOKEN GENERATION
    const result = await pool.query('SELECT * FROM voters WHERE epic_id = $1', [recognizedEpicId]);
    const voter = result.rows[0];

    if (!voter) return res.status(404).json({ message: "User missing in DB." });

    // 🚨 THIS GENERATES THE FRONTEND SESSION TOKEN
    const token = jwt.sign(
      { 
        id: voter.id, 
        epic_id: voter.epic_id, 
        // ✅ Key must match exactly what ballotRoutes expects
        home_constituency_id: voter.home_constituency_id 
      },
      JWT_SECRET,
      { expiresIn: '1h' }
    );

    res.json({
      success: true,
      token: token,
      user: { name: voter.full_name, epic_id: voter.epic_id }
    });

  } catch (err: any) {
    console.error("Auth Error:", err.message);
    res.status(500).json({ message: "Internal Server Error" });
  }
});

export default router;