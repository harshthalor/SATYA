import { Router } from 'express';
import pool from '../config/db';
import axios from 'axios';
import { ensureFaceSetExists, searchFace, enrollFace } from '../utils/facepp'; // Import new helper

const router = Router();
const LEDGER_GATEWAY_URL = 'http://localhost:3000/create-voter';

router.post('/register-voter', async (req: any, res: any) => {
    const { fullName, epicId, base64Image, homeState, constituencyId } = req.body;

    try {
        console.log(`\n--- Starting Registration for: ${fullName} ---`);

        // 1. Initialize Face++ (Create FaceSet if missing)
        await ensureFaceSetExists();

        // 2. Remove header from Base64 if present
        const cleanBase64 = base64Image.replace(/^data:image\/\w+;base64,/, "");

        // 3. 🛑 DUPLICATE CHECK
        const searchResult = await searchFace(cleanBase64);

        if (!searchResult) {
            return res.status(400).json({ error: "No face detected in photo." });
        }

        if (searchResult.matchFound) {
            console.warn(`⛔ BLOCKED: Face matches existing user: ${searchResult.userId}`);
            return res.status(409).json({
                success: false,
                error: "DUPLICATE_FACE",
                message: `This face is already registered as ${searchResult.userId}.`
            });
        }

        // 4. ✅ ENROLL FACE
        // We use the EPIC ID as the "user_id" in Face++
        await enrollFace(searchResult.faceToken, epicId);
        console.log(`✅ Face Enrolled in Cloud. Token: ${searchResult.faceToken}`);

        // 5. BLOCKCHAIN REGISTRATION
        await axios.post(LEDGER_GATEWAY_URL, {
            voterId: epicId, 
            biometricHash: searchResult.faceToken, // Save the Face++ Token
            homeState: homeState || "Delhi"
        });
        console.log("✅ Blockchain Transaction Committed.");

        // 6. DATABASE SAVE
        const query = `
            INSERT INTO voters (epic_id, full_name, biometric_hash, home_constituency_id)
            VALUES ($1, $2, $3, $4) RETURNING id
        `;
        const result = await pool.query(query, [epicId, fullName, searchResult.faceToken, constituencyId || 1]);

        res.status(201).json({ success: true, voterId: result.rows[0].id });

    } catch (error: any) {
        console.error("❌ Registration Failed:", error.message);
        res.status(500).json({ error: "Registration failed." });
    }
});

export default router;