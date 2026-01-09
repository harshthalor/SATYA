'use strict';

const { Contract } = require('fabric-contract-api');

class VoterContract extends Contract {

    async InitLedger(ctx) {
        console.info('============= START : Initialize Ledger ===========');
        const voters = [
            {
                voterID: 'V001',
                biometricHash: 'dummy_hash_123',
                homeState: 'Delhi',
                home_constituency_id: '1',
                currentStatus: 'ACTIVE',
                hasVoted: false,
                docType: 'voter'
            }
        ];

        for (const voter of voters) {
            await ctx.stub.putState(voter.voterID, Buffer.from(JSON.stringify(voter)));
            console.info(`Asset ${voter.voterID} initialized`);
        }
        console.info('============= END : Initialize Ledger ===========');
    }

    // ============================================================
    // 🔐 PHASE 1 UPGRADE: VOTE TOKEN MANAGEMENT (Double Vote Proof)
    // ============================================================

    /**
     * Helper to create a consistent key for a vote token.
     * Format: VOTE_TOKEN_{ElectionID}_{VoterID}
     */
    async getVoteTokenKey(ctx, electionId, voterID) {
        return ctx.stub.createCompositeKey('VOTE_TOKEN', [electionId, voterID]);
    }

    /**
     * MintVoteToken: AUTHORIZES a voter for a specific election.
     * This effectively "hands out the ballot paper".
     * Must be called by EC Admin or automatically upon registration verification.
     */
    async MintVoteToken(ctx, electionId, voterID) {
        // 1. Check if voter exists
        const voterExists = await this.VoterExists(ctx, voterID);
        if (!voterExists) {
            throw new Error(`Cannot mint token: Voter ${voterID} does not exist.`);
        }

        // 2. Generate Unique Token Key
        const tokenKey = await this.getVoteTokenKey(ctx, electionId, voterID);
        
        // 3. Check if token already exists (Idempotency)
        const tokenBytes = await ctx.stub.getState(tokenKey);
        if (tokenBytes && tokenBytes.length > 0) {
            throw new Error(`Token already exists for Voter ${voterID} in Election ${electionId}`);
        }

        // 4. Create the Token Asset
        const token = {
            docType: 'voteToken',
            electionId: electionId,
            voterID: voterID,
            isUsed: false, // The critical flag
            issuedAt: new Date().toISOString() // Audit trail
        };

        // 5. Commit to Ledger
        await ctx.stub.putState(tokenKey, Buffer.from(JSON.stringify(token)));
        return JSON.stringify(token);
    }

    /**
     * CastVote: The "Burn" Transaction.
     * Consumes the token and records the vote in ONE atomic step.
     */
    async CastVote(ctx, electionId, voterID, candidateID, candidateState, boothLocation) {
        // --- STEP 1: RETRIEVE VOTER & VALIDATE IDENTITY ---
        const voterJSON = await ctx.stub.getState(voterID);
        if (!voterJSON || voterJSON.length === 0) {
            throw new Error(`Voter ${voterID} is not registered in the system.`);
        }
        const voter = JSON.parse(voterJSON.toString());

        // --- STEP 2: RETRIEVE VOTE TOKEN (The "Ballot Paper") ---
        const tokenKey = await this.getVoteTokenKey(ctx, electionId, voterID);
        const tokenBytes = await ctx.stub.getState(tokenKey);
        
        if (!tokenBytes || tokenBytes.length === 0) {
            throw new Error(`SECURITY VIOLATION: No valid Vote Token found for ${voterID} in election ${electionId}. Authorization denied.`);
        }

        const token = JSON.parse(tokenBytes.toString());

        // --- STEP 3: THE "BURN" CHECK (Cryptographic Double Vote Prevention) ---
        if (token.isUsed === true) {
            throw new Error(`SECURITY ALERT: Double Voting Attempt Detected! Token ${tokenKey} has already been burned.`);
        }

        // --- STEP 4: BUSINESS LOGIC VALIDATION (Mobility Checks) ---
        if (voter.homeState !== candidateState) {
            throw new Error(`Invalid Ballot: Voter from ${voter.homeState} cannot vote for a candidate in ${candidateState}.`);
        }

        // --- STEP 5: ATOMIC EXECUTION (The "Burn") ---
        
        // A. Burn the Token
        token.isUsed = true;
        token.usedAt = new Date().toISOString();
        token.burnLocation = boothLocation;

        // B. Update Voter Status (Legacy check compatibility)
        voter.hasVoted = true;

        // C. Create the Ballot Record (Anonymized Vote)
        const voteRecord = {
            docType: 'ballot',
            electionId: electionId,
            candidateID: candidateID,
            constituency: voter.home_constituency_id, // Lock vote to home constituency
            state: voter.homeState,
            castAt: boothLocation,
            timestamp: ctx.stub.getTxTimestamp().seconds.low.toString()
        };

        // --- STEP 6: COMMIT ALL CHANGES ---
        // Fabric ensures either ALL these putStates happen, or NONE do.
        await ctx.stub.putState(tokenKey, Buffer.from(JSON.stringify(token))); // Burn token
        await ctx.stub.putState(voterID, Buffer.from(JSON.stringify(voter)));  // Update voter
        
        // Save Ballot with a unique ID (Transaction ID ensures uniqueness)
        const txId = ctx.stub.getTxID();
        await ctx.stub.putState(`BALLOT_${txId}`, Buffer.from(JSON.stringify(voteRecord)));

        console.info(`✅ Vote Cast Successfully. Token Burned. Ballot Ref: ${txId}`);
        return txId;
    }

    // ============================================================
    // 🛠 EXISTING UTILITIES (Preserved)
    // ============================================================

    async CreateVoter(ctx, voterID, biometricHash, homeState) {
        const voter = {
            voterID: voterID,
            biometricHash: biometricHash,
            homeState: homeState,
            currentStatus: 'ACTIVE',
            hasVoted: false,
            docType: 'voter'
        };
        await ctx.stub.putState(voterID, Buffer.from(JSON.stringify(voter)));
        return JSON.stringify(voter);
    }

    async ReadVoter(ctx, voterID) {
        const voterJSON = await ctx.stub.getState(voterID);
        if (!voterJSON || voterJSON.length === 0) {
            throw new Error(`The voter ${voterID} does not exist`);
        }
        return voterJSON.toString();
    }

    async VoterExists(ctx, voterID) {
        const voterJSON = await ctx.stub.getState(voterID);
        return voterJSON && voterJSON.length > 0;
    }

    async TransferVoter(ctx, voterID, newState, home_constituency_id) {
        const voterJSON = await ctx.stub.getState(voterID);
        if (!voterJSON || voterJSON.length === 0) {
            throw new Error(`Voter ${voterID} does not exist.`);
        }

        const voter = JSON.parse(voterJSON.toString());

        if (voter.hasVoted) {
            throw new Error(`SECURITY ALERT: Voter ${voterID} has already voted. Transfer denied.`);
        }

        console.info(`Moving ${voterID} from ${voter.homeState} to ${newState}`);
        voter.homeState = newState;
        voter.home_constituency_id = home_constituency_id; 
        
        await ctx.stub.putState(voterID, Buffer.from(JSON.stringify(voter)));
        return `Success: Voter moved to ${newState} (Constituency: ${home_constituency_id}).`;
    }

    async BulkRegisterVoters(ctx, votersDataJSON) {
        const voters = JSON.parse(votersDataJSON); 
        for (const voter of voters) {
            const exists = await this.VoterExists(ctx, voter.voterID);
            if (!exists) {
                const voterRecord = {
                    voterID: voter.voterID,
                    biometricHash: voter.biometricHash,
                    homeState: voter.homeState,
                    currentStatus: 'ACTIVE',
                    hasVoted: false,
                    docType: 'voter'
                };
                await ctx.stub.putState(voter.voterID, Buffer.from(JSON.stringify(voterRecord)));
            }
        }
        return `Successfully synchronized ${voters.length} voters to the SATYA Ledger.`;
    }

    async GetAllAssets(ctx) {
        const allResults = [];
        const iterator = await ctx.stub.getStateByRange('', '');
        let result = await iterator.next();
        while (!result.done) {
            const strValue = Buffer.from(result.value.value.toString()).toString('utf8');
            let record;
            try {
                record = JSON.parse(strValue);
            } catch (err) {
                console.log(err);
                record = strValue;
            }
            allResults.push({ Key: result.value.key, Record: record });
            result = await iterator.next();
        }
        return JSON.stringify(allResults);
    }
}

module.exports.VoterContract = VoterContract;
module.exports.contracts = [ VoterContract ];