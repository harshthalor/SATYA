/*
 * Member C: Guardian of Trust
 * Component: API Gateway (server.js)
 * Purpose: The Bridge between the Web and the Blockchain.
 */

const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const { Gateway, Wallets } = require('fabric-network');
const fs = require('fs');
const path = require('path');

const app = express();

// Add these BEFORE any routes
app.use(express.json()); 
app.use(express.urlencoded({ extended: true }));

app.use(cors());
// app.use(bodyParser.json()); // You can keep this or remove it, express.json() handles it now
// --- CONFIGURATION ---
const PORT = 3000;
const CHANNEL_NAME = 'mychannel'; // Standard default for test-network
const CHAINCODE_NAME = 'satya';   // Standard default for test-network

// --- HELPER FUNCTION: CONNECT TO NETWORK ---
async function getContract() {
    // 1. Load the Map (Connection Profile)
    const ccpPath = path.resolve(__dirname, 'connection-org1.json');
    const ccp = JSON.parse(fs.readFileSync(ccpPath, 'utf8'));

    // 2. Load the Wallet (Identity)
    const walletPath = path.join(process.cwd(), 'wallet');
    const wallet = await Wallets.newFileSystemWallet(walletPath);

    // 3. Connect to the Gateway
    const gateway = new Gateway();
    await gateway.connect(ccp, {
        wallet,
        identity: 'appUserV2', // The user we created earlier
        discovery: { enabled: true, asLocalhost: true } ,// Crucial for Docker/Colima
        asLocalhost: true
    });

    // 4. Get the Network and Contract
    const network = await gateway.getNetwork(CHANNEL_NAME);
    const contract = network.getContract(CHAINCODE_NAME);

    return { contract, gateway };
}

// --- API ENDPOINT 1: READ ASSET (QUERY) ---
// Usage: GET http://localhost:3000/query/asset1
app.get('/query/:key', async (req, res) => {
    try {
        const { contract, gateway } = await getContract();
        const result = await contract.evaluateTransaction('ReadAsset', req.params.key);
        
        console.log(`Transaction has been evaluated, result is: ${result.toString()}`);
        res.status(200).json({ response: result.toString() });
        
        // Disconnect after use to free resources
        await gateway.disconnect();
        
    } catch (error) {
        console.error(`Failed to evaluate transaction: ${error}`);
        res.status(500).json({ error: error.message });
    }
});

// --- API ENDPOINT 2: INITIALIZE LEDGER (FOR TESTING) ---
// Usage: GET http://localhost:3000/init
app.get('/init', async (req, res) => {
    try {
        const { contract, gateway } = await getContract();
        console.log('Initializing Ledger...');
        await contract.submitTransaction('InitLedger');
        console.log('Ledger initialized');
        res.send('Ledger Initialized Successfully');
        await gateway.disconnect();
    } catch (error) {
        console.error(`Failed to submit transaction: ${error}`);
        res.status(500).send(error.message);
    }
});

// --- API ENDPOINT 3: CAST VOTE (INVOKE) ---
// Usage: POST http://localhost:3000/cast-vote
// --- API ENDPOINT 3: CAST VOTE (INVOKE) ---
// Usage: POST http://localhost:3000/cast-vote
app.post('/cast-vote', async (req, res) => {
    try {
        // 1. Destructure the NEW 'candidateState' parameter from the request
        const { voterId, candidateId, candidateState, district } = req.body;
        const { contract, gateway } = await getContract();

        console.log(`\n--> Submitting Transaction: CastVote for ${voterId} towards ${candidateState}`);

        // 2. Add 'candidateState' to the transaction arguments
        // Order must match your Chaincode: voterID, candidateID, candidateState, boothLocation
        const result = await contract.submitTransaction(
            'CastVote', 
            voterId, 
            candidateId, 
            candidateState, 
            district
        );
        
        await gateway.disconnect();

        res.status(200).json({ 
            success: true, 
            txId: result.toString(), 
            message: `Vote successfully validated and cast for voter ${voterId}`
        });
    } catch (error) {
        console.error(`Failed to cast vote: ${error}`);
        res.status(500).json({ success: false, error: error.message });
    }
});

app.post('/create-voter', async (req, res) => {
    try {
        const { voterId, biometricHash, homeState } = req.body;

        // Use curly braces {} to "destructure" the object and get the actual contract
        const { contract, gateway } = await getContract(); 

        console.log(`\n--> Submitting Transaction: CreateVoter for ${voterId}`);
        
        // Now 'contract' is the actual Fabric object, so this will work
        await contract.submitTransaction('CreateVoter', voterId, biometricHash, homeState);
        
        console.log('*** Transaction committed successfully');

        // Always disconnect the gateway to free up the connection
        await gateway.disconnect();

        res.status(200).json({ 
            success: true, 
            message: `Voter ${voterId} registered successfully` 
        });

    } catch (error) {
        console.error(`Failed to register voter: ${error}`);
        res.status(500).json({ success: false, error: error.message });
    }
});

// --- API ENDPOINT: BULK REGISTER (PHASE 3) ---
app.post('/bulk-register', async (req, res) => {
    try {
        const { votersList } = req.body; // Expecting an array of voter objects
        const { contract, gateway } = await getContract();

        console.log(`--> Syncing ${votersList.length} voters from state databases...`);
        
        // Convert the array to a string to pass it to the chaincode
        await contract.submitTransaction('BulkRegisterVoters', JSON.stringify(votersList));
        
        await gateway.disconnect();
        res.status(200).json({ success: true, message: "State sync complete." });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});

// --- START SERVER ---
app.listen(PORT, () => {
    console.log(`✅ SATYA Gateway running on http://localhost:${PORT}`);
});