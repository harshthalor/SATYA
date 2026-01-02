import { Router } from 'express';
import pool from '../config/db';
import jwt from 'jsonwebtoken';
import axios from 'axios';

const router = Router();
const JWT_SECRET = process.env.JWT_SECRET || 'satya_super_secret_key';

// Correctly points to Member C (Port 8000)
const AI_URL = process.env.AI_SERVICE_URL || 'http://localhost:8000/api/v1/auth/scan';

// POST /api/v1/auth/verify
router.post('/verify', async (req, res) => {
  try {
    const { imageBase64 } = req.body;

    if (!imageBase64) {
      return res.status(400).json({ message: "No image provided" });
    }

    console.log(`\n📸 Received Face Scan. Contacting AI Service at: ${AI_URL}...`);

    let aiResponse;
    try {
      // 1. Send Image to Member C (AI)
      aiResponse = await axios.post(AI_URL, { image: imageBase64 });
    } catch (error) {
      console.error("❌ Failed to contact AI Service. Is Member C running on Port 8000?");
      return res.status(503).json({ message: "AI Service Unavailable" });
    }

    // 2. Translate Member C's Response
    console.log("🤖 AI Response:", aiResponse.data);
    const { status, message, voter_hash } = aiResponse.data;

    // Check if Member C said "success" (accepts 'verified', 'success', or true)
    const isSuccess = status === 'success' || status === 'verified' || status === true;

    if (!isSuccess) {
      console.log(`⛔ AI Rejected: ${message}`);
      return res.status(401).json({ message: message || "Face verification failed" });
    }

    console.log(`✅ AI Confirmed. Looking up Voter Hash: ${voter_hash}`);

    // 3. Find Voter in DB
    const result = await pool.query(
      'SELECT * FROM voters WHERE biometric_hash = $1',
      [voter_hash]
    );

    const voter = result.rows[0];

    if (!voter) {
      return res.status(404).json({ message: "Voter verified by AI, but not found in DB" });
    }

    // 4. Check if already voted
    if (voter.has_voted) {
      return res.status(403).json({ message: "⚠️ You have already voted!" });
    }

    // 5. Create "VIP Badge" (Token)
    const token = jwt.sign(
      { 
        id: voter.id, 
        constituency_id: voter.home_constituency_id 
      },
      JWT_SECRET,
      { expiresIn: '1h' }
    );

    console.log(`🎉 Login Success: ${voter.full_name}`);

    res.json({
      success: true,
      token: token,
      user: {
        name: voter.full_name,
        epic_id: voter.epic_id
      }
    });

  } catch (err) {
    console.error("Auth Error:", err);
    res.status(500).json({ message: "Internal Server Error" });
  }
});

export default router;