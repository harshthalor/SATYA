/*
 * Member C: Guardian of Trust
 * Component: API Gateway (server.js)
 * Purpose: The Bridge between the Web and the Blockchain.
 */
console.log("🚨🚨🚨 SATYA GATEWAY V2: TOKEN LOGIC ENABLED 🚨🚨🚨");
const express = require('express');
const cors = require('cors');
const { Gateway, Wallets } = require('fabric-network');
const fs = require('fs');
const path = require('path');

const app = express();

app.use(express.json()); 
app.use(express.urlencoded({ extended: true }));
app.use(cors());

// --- CONFIGURATION ---
const PORT = 3000;
const CHANNEL_NAME = 'mychannel';
const CHAINCODE_NAME = 'satya';

// --- HELPER FUNCTION: CONNECT TO NETWORK ---
async function getContract() {
    const ccpPath = path.resolve(__dirname, 'connection-org1.json');
    const ccp = JSON.parse(fs.readFileSync(ccpPath, 'utf8'));
    const walletPath = path.join(process.cwd(), 'wallet');
    const wallet = await Wallets.newFileSystemWallet(walletPath);

    const gateway = new Gateway();
    await gateway.connect(ccp, {
        wallet,
        identity: 'appUserV1',
        discovery: { enabled: true, asLocalhost: true },
        asLocalhost: true // Crucial for Docker/Colima
    });

    const network = await gateway.getNetwork(CHANNEL_NAME);
    const contract = network.getContract(CHAINCODE_NAME);

    return { contract, gateway };
}

// =================================================================
// 🔐 PHASE 1: TOKEN MANAGEMENT (NEW)
// =================================================================

// --- API ENDPOINT: MINT VOTE TOKEN ---
// Usage: POST http://localhost:3000/mint-token
// Payload: { "electionId": "SATYA_LS_2026", "voterID": "ABC1234567" }
app.post('/mint-token', async (req, res) => {
    try {
        const { electionId, voterID } = req.body;
        const { contract, gateway } = await getContract();

        console.log(`\n🎫 MINTING TOKEN: Election ${electionId} for Voter ${voterID}`);

        await contract.submitTransaction('MintVoteToken', electionId, voterID);
        
        console.log('✅ Token Minted on Ledger');
        await gateway.disconnect();

        res.status(200).json({ 
            success: true, 
            message: `Ballot Token generated for ${voterID}` 
        });
    } catch (error) {
        console.error(`❌ Minting Failed: ${error}`);
        // Return 409 if it already exists, or 500 for other errors
        const status = error.message.includes('already exists') ? 409 : 500;
        res.status(status).json({ success: false, error: error.message });
    }
});

// --- API ENDPOINT: CAST VOTE (UPDATED FOR TOKEN BURN) ---
// Usage: POST http://localhost:3000/cast-vote
app.post('/cast-vote', async (req, res) => {
    try {
        // 1. Destructure all 5 arguments required by Chaincode V2
        const { electionId, voterID, candidateID, candidateState, boothLocation } = req.body;
        
        if (!electionId || !voterID || !candidateID || !candidateState) {
            return res.status(400).json({ error: "Missing required voting fields" });
        }

        const { contract, gateway } = await getContract();

        console.log(`\n🗳️ CAST VOTE REQUEST:`);
        console.log(`   Election: ${electionId}`);
        console.log(`   Voter: ${voterID}`);
        console.log(`   Target: ${candidateID} (${candidateState})`);

        // 2. Submit Transaction (Atomic Token Burn + Vote)
        const result = await contract.submitTransaction(
            'CastVote', 
            electionId, 
            voterID, 
            candidateID, 
            candidateState, 
            boothLocation
        );
        
        console.log(`✅ Transaction Committed. TXID: ${result.toString()}`);
        await gateway.disconnect();

        res.status(200).json({ 
            success: true, 
            txId: result.toString(), 
            message: `Vote successfully cast and token burned.`
        });
    } catch (error) {
        console.error(`❌ Vote Failed: ${error}`);
        
        // Handle specific security violations clearly
        if (error.message.includes("Double Voting")) {
            return res.status(409).json({ success: false, error: "SECURITY ALERT: Double Voting Detected" });
        }
        if (error.message.includes("No valid Vote Token")) {
            return res.status(403).json({ success: false, error: "Voter does not possess a valid ballot token." });
        }

        res.status(500).json({ success: false, error: error.message });
    }
});

// =================================================================
// 🛠 EXISTING UTILITIES (PRESERVED)
// =================================================================

// --- QUERY ASSET ---
app.get('/query/:key', async (req, res) => {
    try {
        const { contract, gateway } = await getContract();
        const result = await contract.evaluateTransaction('ReadVoter', req.params.key);
        res.status(200).json({ response: result.toString() });
        await gateway.disconnect();
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// --- REGISTER VOTER (LEGACY / DIRECT) ---
app.post('/register-voter', async (req, res) => {
    try {
        const { voterId, biometricHash, homeState } = req.body;
        const { contract, gateway } = await getContract(); 
        console.log(`\n--> Registering Voter: ${voterId}`);
        await contract.submitTransaction('CreateVoter', voterId, biometricHash, homeState);
        await gateway.disconnect();
        res.status(200).json({ success: true, message: `Voter ${voterId} registered successfully` });
    } catch (error) {
        console.error(`Failed to register voter: ${error}`);
        res.status(500).json({ success: false, error: error.message });
    }
});

// --- BULK REGISTER ---
app.post('/bulk-register', async (req, res) => {
    try {
        const { votersList } = req.body;
        const { contract, gateway } = await getContract();
        console.log(`--> Syncing ${votersList.length} voters...`);
        await contract.submitTransaction('BulkRegisterVoters', JSON.stringify(votersList));
        await gateway.disconnect();
        res.status(200).json({ success: true, message: "State sync complete." });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});

// --- MOBILITY CHANGE ---
app.post('/change-state', async (req, res) => {
    try {
        const { voterId, newState, newConstituencyId } = req.body;
        const { contract, gateway } = await getContract();
        console.log(`\n--> Moving ${voterId} to ${newState}`);
        await contract.submitTransaction('TransferVoter', voterId, newState, newConstituencyId);
        await gateway.disconnect();
        res.status(200).json({ success: true, message: `Moved to ${newState}` });
    } catch (error) {
        console.error(`❌ Transfer Failed: ${error}`);
        res.status(500).json({ error: error.message });
    }
});

// --- QUERY ALL ---
app.get('/query-all', async (req, res) => {
    try {
        const { contract, gateway } = await getContract();
        const result = await contract.evaluateTransaction('GetAllAssets');
        res.status(200).json({ success: true, data: JSON.parse(result.toString()) });
        await gateway.disconnect();
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// --- INIT LEDGER ---
app.get('/init', async (req, res) => {
    try {
        const { contract, gateway } = await getContract();
        await contract.submitTransaction('InitLedger');
        res.send('Ledger Initialized Successfully');
        await gateway.disconnect();
    } catch (error) {
        res.status(500).send(error.message);
    }
});

app.listen(PORT, () => {
    console.log(`✅ SATYA Gateway running on http://localhost:${PORT}`);
});