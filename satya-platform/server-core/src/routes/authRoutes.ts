import { Router } from 'express';
import pool from '../config/db';
import jwt from 'jsonwebtoken';
import axios from 'axios';
import FormData from 'form-data'; // Make sure you installed this: npm install form-data

const router = Router();
const JWT_SECRET = process.env.JWT_SECRET || 'satya_super_secret_key';
// Use 127.0.0.1 to avoid Docker localhost issues
const AI_URL = process.env.AI_SERVICE_URL || 'http://127.0.0.1:8000/api/v1/auth/scan';

router.post('/verify', async (req, res) => {
  try {
    const { imageBase64 } = req.body;

    if (!imageBase64) {
      return res.status(400).json({ message: "No image provided" });
    }

    // 1. LOGGING: Watch for this specific message to know the new code is running!
    console.log(`\n📸 Received Face Scan. Converting to File...`);

    // 2. CONVERT JSON TO FILE (Fixes the 422 Error)
    const form = new FormData();
    const base64Data = imageBase64.replace(/^data:image\/\w+;base64,/, "");
    const imageBuffer = Buffer.from(base64Data, 'base64');
    
    // The name 'file' matches Member C's Python code: file=File(...)
    form.append('file', imageBuffer, { filename: 'scan.jpg' });

    console.log(`📡 Sending File to AI Service at: ${AI_URL}...`);

    let aiResponse;
    try {
      // 3. SEND AS FORM DATA
      aiResponse = await axios.post(AI_URL, form, {
        headers: { ...form.getHeaders() },
        maxContentLength: Infinity,
        maxBodyLength: Infinity
      });
    } catch (error: any) {
      console.error("❌ AI Service Error:", error.message);
      if (error.response) {
        console.error("🔍 Python Response Data:", error.response.data);
      }
      return res.status(503).json({ message: "AI Service Unavailable" });
    }

    // 4. HANDLE RESPONSE
    console.log("🤖 AI Response:", aiResponse.data);
    const { status, message, voter_hash } = aiResponse.data;

    const isSuccess = status === 'success' || status === 'verified' || status === true;

    if (!isSuccess) {
      console.log(`⛔ AI Rejected: ${message}`);
      return res.status(401).json({ message: message || "Face verification failed" });
    }

    console.log(`✅ AI Confirmed. Looking up Voter Hash: ${voter_hash}`);

    // 5. DATABASE CHECK
    const result = await pool.query(
      'SELECT * FROM voters WHERE biometric_hash = $1',
      [voter_hash]
    );

    const voter = result.rows[0];

    if (!voter) {
      return res.status(404).json({ message: "Voter verified by AI, but not found in DB" });
    }

    if (voter.has_voted) {
      return res.status(403).json({ message: "⚠️ You have already voted!" });
    }

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