import { Router } from 'express';
import pool from '../config/db';
import axios from 'axios';
// IMPORT facepp utilities
import { ensureFaceSetExists, searchFace, enrollFace, checkLiveness } from '../utils/facepp'; 

const router = Router();
// ✅ FIXED: Pointing to the correct blockchain route
const LEDGER_GATEWAY_URL = 'http://localhost:3000/register-voter';

// --- ROUTE 1: REGISTER VOTER (Existing) ---
router.post('/register-voter', async (req: any, res: any) => {
    const { fullName, epicId, base64Image, homeState, constituencyId } = req.body;

    try {
        console.log(`\n--- Starting Registration for: ${fullName} ---`);

        // 1. Initialize Face++
        await ensureFaceSetExists();

        // 2. Remove header from Base64
        const cleanBase64 = base64Image.replace(/^data:image\/\w+;base64,/, "");

        // --- 3. 🛡️ NEW: LIVENESS CHECK ---
        const isRealPerson = await checkLiveness(cleanBase64);
        
        if (!isRealPerson) {
            console.warn(`⛔ BLOCKED: Liveness/Quality Check Failed for ${fullName}`);
            return res.status(403).json({
                success: false,
                error: "LIVENESS_FAILED",
                message: "Image rejected. Please ensure you are using a live camera and the face is clear (no screens/photos)."
            });
        }
        console.log("✅ Liveness/Quality Verified.");

        // 4. 🛑 DUPLICATE CHECK
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

        // 5. ✅ ENROLL FACE
        // We use the EPIC ID as the "user_id" in Face++
        await enrollFace(searchResult.faceToken, epicId);
        console.log(`✅ Face Enrolled in Cloud. Token: ${searchResult.faceToken}`);

        // 6. BLOCKCHAIN REGISTRATION
        await axios.post(LEDGER_GATEWAY_URL, {
            voterId: epicId, 
            biometricHash: searchResult.faceToken, // Save the Face++ Token
            homeState: homeState || "Delhi"
        });
        console.log("✅ Blockchain Transaction Committed.");

        // 7. DATABASE SAVE
        // We store home_constituency_id so we can track where they vote locally
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

// --- ROUTE 2: SEARCH VOTER BY FACE (Auto-Fill) ---
router.post('/search-voter-by-face', async (req: any, res: any) => {
    const { base64Image } = req.body;

    try {
        console.log("\n--- 🔍 Searching Face for Auto-Fill ---");
        
        if (!base64Image) {
            return res.status(400).json({ success: false, message: "No image provided." });
        }

        const cleanBase64 = base64Image.replace(/^data:image\/\w+;base64,/, "");

        // Search Face++ Database
        const searchResult = await searchFace(cleanBase64);

        if (searchResult && searchResult.matchFound) {
            console.log(`✅ Match Found! User ID: ${searchResult.userId}`);
            
            return res.status(200).json({ 
                success: true, 
                voterId: searchResult.userId 
            });
        } else {
            console.log("❌ No match found.");
            return res.status(404).json({ success: false, message: "Face not recognized." });
        }

    } catch (error: any) {
        console.error("Search Error:", error.message);
        res.status(500).json({ error: "Face search failed." });
    }
});

// --- ROUTE 3: UPDATE VOTER CONSTITUENCY (Syncs DB + Blockchain) ---
router.post('/update-location', async (req: any, res: any) => {
    const { voterId, newState, newConstituencyId } = req.body;

    if (!voterId || !newState || !newConstituencyId) {
        return res.status(400).json({ error: "Missing required fields." });
    }

    // Get a dedicated client from the pool for the transaction
    const client = await pool.connect();

    try {
        console.log(`\n--- 🔄 Processing Mobility for ${voterId} ---`);

        // 1. UPDATE SQL DATABASE (Supabase)
        // We update the home_constituency_id (e.g., '2') and address state
        // NOTE: Ensure your voters table has a 'home_state' column, or remove that part if unused
        const sqlQuery = `
            UPDATE voters 
            SET home_constituency_id = $1
            WHERE epic_id = $2
            RETURNING id;
        `;
        // If you have a home_state column in SQL, use this query instead:
        // SET home_constituency_id = $1, home_state = $2 WHERE epic_id = $3
        
        const dbResult = await client.query(sqlQuery, [newConstituencyId, voterId]);

        if (dbResult.rowCount === 0) {
            console.warn(`⚠️ Warning: Voter ${voterId} not found in SQL, but proceeding to Blockchain.`);
        } else {
            console.log("✅ Supabase SQL Updated.");
        }

        // 2. UPDATE BLOCKCHAIN LEDGER
        // We call the Blockchain Server (Port 3000) to execute the smart contract
        const ledgerUrl = 'http://localhost:3000/change-state';
        
        await axios.post(ledgerUrl, {
            voterId,
            newState,
            newConstituencyId
        });
        console.log("✅ Blockchain Ledger Updated.");

        res.status(200).json({ 
            success: true, 
            message: `Voter moved to ${newState} (ID: ${newConstituencyId}) on both DB and Blockchain.` 
        });

    } catch (error: any) {
        console.error("❌ Mobility Update Failed:", error.message);
        // If it was a blockchain error, we pass that message back
        const errMsg = error.response?.data?.error || error.message;
        res.status(500).json({ error: errMsg });
    } finally {
        client.release();
    }
});

export default router;