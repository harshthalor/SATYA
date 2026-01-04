import { Router } from 'express';
import pool from '../config/db';
import axios from 'axios';
import dotenv from 'dotenv';
import FormData from 'form-data';

dotenv.config();

const router = Router();

// --- CONFIGURATION ---
const AI_SERVICE_URL = process.env.AI_SERVICE_URL || 'http://localhost:8000/api/v1/auth/scan';
const LEDGER_GATEWAY_URL = 'http://localhost:3000/create-voter';

/**
 * @route   POST /api/v1/admin/register-voter
 * @desc    Onboard a new voter: AI Hash -> Blockchain -> Database
 * @access  Admin Only (In a real app, add admin middleware here)
 */
router.post('/register-voter', async (req: any, res: any) => {
    // 1. These are defined from the request body
    const { fullName, epicId, base64Image, homeState, constituencyId } = req.body;

    // 2. PRE-DECLARE variables here so they aren't "underlined" later
    let voterHash: string = ""; 

    try {
        console.log(`--- Starting Registration for: ${fullName} ---`);

        // 3. Step 1: Generate Hash
        const rawBase64 = base64Image.replace(/^data:image\/\w+;base64,/, "");
        
        // Use FormData for Python FastAPI
        const form = new FormData();
        form.append('file', Buffer.from(rawBase64, 'base64'), {
            filename: 'voter.jpg',
            contentType: 'image/jpeg',
        });

        const aiResponse = await axios.post(AI_SERVICE_URL, form, {
            headers: { ...form.getHeaders() }
        });

        // Assign the value to our pre-declared variable
        voterHash = aiResponse.data.voter_hash;

        // 4. Step 2: Blockchain Registration
        // 'voterHash' and 'homeState' are now visible here
        await axios.post(LEDGER_GATEWAY_URL, {
            voterId: voterHash,
            biometricHash: "VERIFIED",
            homeState: homeState || "Delhi"
        });

        // 5. Step 3: Database Save
        const query = `
            INSERT INTO voters (epic_id, full_name, biometric_hash, home_constituency_id)
            VALUES ($1, $2, $3, $4) RETURNING id
        `;
        const result = await pool.query(query, [epicId, fullName, voterHash, constituencyId || 1]);

        res.status(201).json({ success: true, voterId: result.rows[0].id });

    } catch (error: any) {
        console.error("❌ Registration Error:", error.message);
        res.status(500).json({ error: "Registration failed" });
    }
});
export default router;