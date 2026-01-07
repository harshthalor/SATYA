'use strict';

const { Contract } = require('fabric-contract-api');

class VoterContract extends Contract {

    async InitLedger(ctx) {
        const voters = [
            {
                voterID: 'V001',
                biometricHash: 'dummy_hash_123',
                homeState: 'Delhi',
                home_constituency_id: '1', // Added default constituency
                currentStatus: 'ACTIVE',
                hasVoted: false
            }
        ];

        for (const voter of voters) {
            await ctx.stub.putState(voter.voterID, Buffer.from(JSON.stringify(voter)));
            console.info(`Asset ${voter.voterID} initialized`);
        }
    }

    // --- FUNCTION: GET ALL ASSETS ---
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

    // --- 🚨 NEW: THE MISSING MOBILITY FUNCTION 🚨 ---
    async TransferVoter(ctx, voterID, newState, home_constituency_id) {
        // 1. Get the voter record
        const voterJSON = await ctx.stub.getState(voterID);
        if (!voterJSON || voterJSON.length === 0) {
            throw new Error(`Voter ${voterID} does not exist.`);
        }

        const voter = JSON.parse(voterJSON.toString());

        // 2. SECURITY CHECK: Cannot move if already voted
        if (voter.hasVoted) {
            throw new Error(`SECURITY ALERT: Voter ${voterID} has already voted. Transfer denied.`);
        }

        // 3. Update Location
        console.info(`Moving ${voterID} from ${voter.homeState} to ${newState}`);
        voter.homeState = newState;
        voter.home_constituency_id = home_constituency_id; 
        
        // 4. Save to Ledger
        await ctx.stub.putState(voterID, Buffer.from(JSON.stringify(voter)));
        
        return `Success: Voter moved to ${newState} (Constituency: ${home_constituency_id}).`;
    }

    // CastVote: Upgraded Phase 3 Mobility function with Cross-State Validation
    async CastVote(ctx, voterID, candidateID, candidateState, boothLocation) {
        const voterJSON = await ctx.stub.getState(voterID);
        if (!voterJSON || voterJSON.length === 0) {
            throw new Error(`Voter ${voterID} is not registered in the system.`);
        }

        const voter = JSON.parse(voterJSON.toString());

        if (voter.hasVoted) {
            throw new Error(`Security Violation: Voter ${voterID} has already cast a vote.`);
        }

        if (voter.homeState !== candidateState) {
            throw new Error(`Invalid Ballot: Voter from ${voter.homeState} cannot vote for a candidate in ${candidateState}.`);
        }

        const voteRecord = {
            candidateID: candidateID,
            homeState: voter.homeState, 
            castAt: boothLocation,      
            timestamp: ctx.stub.getTxTimestamp().seconds.low.toString(),
            docType: 'ballot'
        };

        voter.hasVoted = true;
        await ctx.stub.putState(voterID, Buffer.from(JSON.stringify(voter)));
        
        const txId = ctx.stub.getTxID(); 
        await ctx.stub.putState(`BALLOT_${txId}`, Buffer.from(JSON.stringify(voteRecord)));

        console.info(`Vote successfully cast and anonymized. Reference: ${txId}`);
        return txId; 
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
}

module.exports.VoterContract = VoterContract;
module.exports.contracts = [ VoterContract ];