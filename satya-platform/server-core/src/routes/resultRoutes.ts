import { Router } from 'express';
import axios from 'axios';
import pool from '../config/db'; // Import your DB connection

const router = Router();
const LEDGER_ALL_URL = 'http://localhost:3000/query-all';

// GET /api/v1/results/:constituencyId
router.get('/:constituencyId', async (req: any, res: any) => {
    const { constituencyId } = req.params;
    
    try {
        console.log(`📊 Fetching LIVE results for Constituency ${constituencyId}...`);
        
        // STEP 1: Fetch Candidate Metadata from Database (The "Human" readable part)
        // We need names and party symbols to show on the dashboard
        const candidatesRes = await pool.query(
            'SELECT id, name, party, symbol_url FROM candidates WHERE constituency_id = $1',
            [constituencyId]
        );
        
        if (candidatesRes.rows.length === 0) {
            return res.status(404).json({ message: "No candidates found for this region." });
        }

        const candidates = candidatesRes.rows;

        // STEP 2: Fetch Raw Votes from Blockchain (The "Immutable" truth)
        // We query the Gateway to get the world state
        const ledgerRes = await axios.get(LEDGER_ALL_URL);
        const allAssets = ledgerRes.data.data; // Array of { Key, Record }

        // STEP 3: The "Tally Logic"
        // We filter for ballots that match this constituency
        const tallyMap: Record<string, number> = {};

        // Initialize 0 votes for all candidates
        candidates.forEach(c => tallyMap[c.id] = 0);

        // Count the votes from the Ledger
        allAssets.forEach((asset: any) => {
            const record = asset.Record;
            
            // Check if it is a Ballot AND belongs to this constituency
            // Note: We check record.docType === 'ballot' to avoid counting voters as votes
            if (record.docType === 'ballot' && record.state === (constituencyId === '1' ? 'Delhi' : 'Mumbai')) {
                const votedForId = record.candidateID;
                if (tallyMap[votedForId] !== undefined) {
                    tallyMap[votedForId]++;
                }
            }
        });

        // STEP 4: Format for Frontend (Recharts)
        const finalResults = candidates.map(c => ({
            name: c.name,
            party: c.party,
            votes: tallyMap[c.id],
            fill: c.party === 'Digital Bharat Party' ? '#3b82f6' : '#22c55e' // Blue for Tech, Green for Env
        }));

        res.json(finalResults);

    } catch (error: any) {
        console.error("Result Aggregation Error:", error.message);
        res.status(500).json({ message: "Failed to calculate results." });
    }
});

export default router;