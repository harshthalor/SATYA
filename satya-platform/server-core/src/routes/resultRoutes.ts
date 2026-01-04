import { Router } from 'express';
import axios from 'axios';

const router = Router();
const LEDGER_ALL_URL = 'http://localhost:3000/query-all';

router.get('/tally', async (req: any, res: any) => {
    try {
        console.log("📊 Fetching live election results from Ledger...");
        
        // 1. Get Raw Data from Blockchain
        const response = await axios.get(LEDGER_ALL_URL);
        const allData = response.data.data; // This is an array of ALL assets on chain

        // 2. Filter for "Votes" (Exclude Voter registrations if they are mixed)
        // Assuming your 'CastVote' creates a separate asset or updates the voter.
        // NOTE: If your chaincode stores votes inside the Voter asset (e.g. candidateId field):
        
        const tally: any = {};

        allData.forEach((item: any) => {
            // Check if this item has a 'candidateId' (meaning they voted)
            if (item.Record && item.Record.candidateId) {
                const candidate = item.Record.candidateId;
                
                if (tally[candidate]) {
                    tally[candidate]++;
                } else {
                    tally[candidate] = 1;
                }
            }
        });

        // 3. Send the secure count
        console.log("🏆 Current Tally:", tally);
        res.json({
            success: true,
            source: "Blockchain Ledger (Immutable)",
            results: tally
        });

    } catch (error: any) {
        console.error("Counting Error:", error.message);
        res.status(500).json({ message: "Could not fetch results" });
    }
});

export default router;