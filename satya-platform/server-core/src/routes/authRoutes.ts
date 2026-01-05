import { Router } from 'express';
import pool from '../config/db';
import jwt from 'jsonwebtoken';
import axios from 'axios';
import { ensureFaceSetExists, searchFace } from '../utils/facepp'; // Import new helper

const router = Router();
const JWT_SECRET = process.env.JWT_SECRET ;
if (!JWT_SECRET) throw new Error("Missing JWT_SECRET in .env");
const LEDGER_QUERY_URL = 'http://localhost:3000/query';

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

    // Success! searchResult.userId is the EPIC ID we saved earlier
    const recognizedEpicId = searchResult.userId;
    console.log(`✅ Identified User: ${recognizedEpicId}`);

    // 2. CHECK BLOCKCHAIN
    try {
        const ledgerRes = await axios.get(`${LEDGER_QUERY_URL}/${recognizedEpicId}`);
        const rawData = ledgerRes.data.response || ledgerRes.data; 
        const ledgerData = typeof rawData === 'string' ? JSON.parse(rawData) : rawData;

        if (ledgerData.hasVoted === true) {
             return res.status(403).json({ message: "⛔ SECURITY ALERT: Blockchain says you have already voted!" });
        }
    } catch (bcError) {
        return res.status(401).json({ message: "Identity not found on Blockchain." });
    }

    // 3. DB LOOKUP & TOKEN
    const result = await pool.query('SELECT * FROM voters WHERE epic_id = $1', [recognizedEpicId]);
    const voter = result.rows[0];

    if (!voter) return res.status(404).json({ message: "User missing in DB." });

    const token = jwt.sign(
      { id: voter.id, epic_id: voter.epic_id, constituency_id: voter.home_constituency_id },
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