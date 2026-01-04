'use strict';

const { Contract } = require('fabric-contract-api');

class VoterContract extends Contract {

    async InitLedger(ctx) {
        const voters = [
            {
                voterID: 'V001',
                biometricHash: 'dummy_hash_123',
                homeState: 'Delhi',
                currentStatus: 'ACTIVE',
                hasVoted: false
            }
        ];

        for (const voter of voters) {
            await ctx.stub.putState(voter.voterID, Buffer.from(JSON.stringify(voter)));
            console.info(`Asset ${voter.voterID} initialized`);
        }
    }
    // --- NEW FUNCTION: GET ALL ASSETS (Required for Results) ---
    // Returns all voters and ballots stored in the world state
    async GetAllAssets(ctx) {
        const allResults = [];
        // empty string startKey and endKey = fetch everything
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

    // CreateVoter adds a new voter to the world state with given details.
    async CreateVoter(ctx, voterID, biometricHash, homeState) {
        const voter = {
            voterID: voterID,
            biometricHash: biometricHash,
            homeState: homeState,
            currentStatus: 'ACTIVE',
            hasVoted: false
        };
        await ctx.stub.putState(voterID, Buffer.from(JSON.stringify(voter)));
        return JSON.stringify(voter);
    }

    // ReadVoter returns the voter stored in the world state with given id.
    async ReadVoter(ctx, voterID) {
        const voterJSON = await ctx.stub.getState(voterID);
        if (!voterJSON || voterJSON.length === 0) {
            throw new Error(`The voter ${voterID} does not exist`);
        }
        return voterJSON.toString();
    }

    // VoterExists returns true when asset with given ID exists in world state.
    async VoterExists(ctx, voterID) {
        const voterJSON = await ctx.stub.getState(voterID);
        return voterJSON && voterJSON.length > 0;
    }

    // CastVote: The core Phase 3 Mobility function
    // CastVote: Upgraded Phase 3 Mobility function with Cross-State Validation
    async CastVote(ctx, voterID, candidateID, candidateState, boothLocation) {
        // 1. Get the voter record from the Ledger
        const voterJSON = await ctx.stub.getState(voterID);
        if (!voterJSON || voterJSON.length === 0) {
            throw new Error(`Voter ${voterID} is not registered in the system.`);
        }

        const voter = JSON.parse(voterJSON.toString());

        // 2. Double-Voting Protection
        if (voter.hasVoted) {
            throw new Error(`Security Violation: Voter ${voterID} has already cast a vote.`);
        }

        // 3. THE UNIVERSAL TRANSLATOR LOGIC
        if (voter.homeState !== candidateState) {
            throw new Error(`Invalid Ballot: Voter from ${voter.homeState} cannot vote for a candidate in ${candidateState}.`);
        }

        // 4. Create the Vote Record (ANONYMIZED)
        // We remove voterID from the record itself to ensure a "Secret Ballot"
        const voteRecord = {
            candidateID: candidateID,
            homeState: voter.homeState, 
            castAt: boothLocation,      
            timestamp: ctx.stub.getTxTimestamp().seconds.low.toString(),
            docType: 'ballot'
        };

        // 5. Update Voter Status (Private Update)
        voter.hasVoted = true;
        await ctx.stub.putState(voterID, Buffer.from(JSON.stringify(voter)));
        
        // 6. STEP 3: PRIVACY HASHING
        // Use the unique Transaction ID as the key instead of the voterID.
        // This makes the ballot record anonymous on the ledger.
        const txId = ctx.stub.getTxID(); 
        await ctx.stub.putState(`BALLOT_${txId}`, Buffer.from(JSON.stringify(voteRecord)));

        console.info(`Vote successfully cast and anonymized. Reference: ${txId}`);
        return txId; // Return the reference ID to the voter for verification
    }

    // Phase 3: Step 2 - Bulk registration for National State Sync
    async BulkRegisterVoters(ctx, votersDataJSON) {
        // Parse the incoming string into a JSON array
        const voters = JSON.parse(votersDataJSON); 
        
        for (const voter of voters) {
            // Safety check: Don't overwrite existing voters
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
                // Commit each voter to the World State
                await ctx.stub.putState(voter.voterID, Buffer.from(JSON.stringify(voterRecord)));
            }
        }
        return `Successfully synchronized ${voters.length} voters to the SATYA Ledger.`;
    }
}


module.exports.VoterContract = VoterContract;
module.exports.contracts = [ VoterContract ];