import { Router } from 'express';
import pool from '../config/db';
import jwt from 'jsonwebtoken';
import axios from 'axios';
import FormData from 'form-data';

const router = Router();
const JWT_SECRET = process.env.JWT_SECRET || 'satya_super_secret_key';
const AI_URL = process.env.AI_SERVICE_URL || 'http://127.0.0.1:8000/api/v1/auth/scan';

// ✅ NEW: Add the Blockchain Gateway URL
const LEDGER_QUERY_URL = 'http://127.0.0.1:3000/query'; 

router.post('/scan', async (req: any, res: any) => { // Added :any to fix TS errors quickly
  try {
    const { imageBase64 } = req.body;

    if (!imageBase64) {
      return res.status(400).json({ message: "No image provided" });
    }

    console.log(`\n📸 Received Face Scan. Processing...`);

    // 1. CALL AI SERVICE (Your existing working code)
    const form = new FormData();
    const base64Data = imageBase64.replace(/^data:image\/\w+;base64,/, "");
    const imageBuffer = Buffer.from(base64Data, 'base64');
    form.append('file', imageBuffer, { filename: 'scan.jpg' });

    let aiResponse;
    try {
      aiResponse = await axios.post(AI_URL, form, {
        headers: { ...form.getHeaders() },
        maxContentLength: Infinity,
        maxBodyLength: Infinity
      });
    } catch (error: any) {
      console.error("❌ AI Service Error:", error.message);
      return res.status(503).json({ message: "AI Service Unavailable" });
    }

    const { status, message, voter_hash } = aiResponse.data;
    const isSuccess = status === 'success' || status === 'verified' || status === true;

    if (!isSuccess) {
      console.log(`⛔ AI Rejected: ${message}`);
      return res.status(401).json({ message: message || "Face verification failed" });
    }

    console.log(`✅ AI Confirmed. Hash: ${voter_hash.substring(0, 10)}...`);

    // ============================================================
    // 🚨 NEW STEP: CHECK BLOCKCHAIN LEDGER (The "Satya" Check)
    // ============================================================
    console.log(`🔗 Verifying status on Blockchain...`);
    let ledgerData;
    try {
        // We ask the Ledger: "What is the TRUE status of this hash?"
        const ledgerRes = await axios.get(`${LEDGER_QUERY_URL}/${voter_hash}`);
        
        // Parse the response (Gateway returns JSON string inside "response" key)
        const rawData = ledgerRes.data.response || ledgerRes.data; 
        ledgerData = typeof rawData === 'string' ? JSON.parse(rawData) : rawData;

        // CRITICAL SECURITY CHECK
        if (ledgerData.hasVoted === true) {
             return res.status(403).json({ message: "⛔ SECURITY ALERT: Blockchain says you have already voted!" });
        }
    } catch (bcError) {
        // If 404, it means they aren't on the chain yet
        console.error("❌ Blockchain Verification Failed.");
        return res.status(401).json({ message: "Login Failed: Identity not found on Ledger." });
    }

    // 2. DATABASE CHECK (Only needed to get the Name/Constituency ID)
    const result = await pool.query('SELECT * FROM voters WHERE biometric_hash = $1', [voter_hash]);
    const voter = result.rows[0];

    if (!voter) {
      return res.status(404).json({ message: "Voter verified on Ledger, but missing in DB." });
    }

    // 3. GENERATE TOKEN (Now confirmed safe by Blockchain)
    const token = jwt.sign(
      { id: voter.id, constituency_id: voter.home_constituency_id },
      JWT_SECRET,
      { expiresIn: '1h' }
    );

    console.log(`🎉 Login Success: ${voter.full_name}`);

    res.json({
      success: true,
      token: token,
      user: { name: voter.full_name, epic_id: voter.epic_id }
    });

  } catch (err) {
    console.error("Auth Error:", err);
    res.status(500).json({ message: "Internal Server Error" });
  }
});

export default router;