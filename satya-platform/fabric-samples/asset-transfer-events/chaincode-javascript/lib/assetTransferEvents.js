/*
 * SATYA: Secure E-Voting Smart Contract
 * (Replacing AssetTransferEvents for the Demo)
 */

'use strict';

const { Contract } = require('fabric-contract-api');

class VoterContract extends Contract {

    // 1. Initialize Ledger with Dummy Data
    async InitLedger(ctx) {
        const voters = [
            {
                voterID: 'V001',
                biometricHash: 'dummy_hash_123',
                homeState: 'Delhi',
                currentStatus: 'ACTIVE',
                hasVoted: false,
                docType: 'voter'
            }
        ];

        for (const voter of voters) {
            await ctx.stub.putState(voter.voterID, Buffer.from(JSON.stringify(voter)));
            console.info(`Asset ${voter.voterID} initialized`);
        }
    }

    // 2. Get All Assets (CRITICAL FOR RESULTS DASHBOARD)
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

    // 3. Create Voter
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

    // 4. Read Voter
    async ReadVoter(ctx, voterID) {
        const voterJSON = await ctx.stub.getState(voterID);
        if (!voterJSON || voterJSON.length === 0) {
            throw new Error(`The voter ${voterID} does not exist`);
        }
        return voterJSON.toString();
    }

    // 5. Cast Vote
    async CastVote(ctx, voterID, candidateID, candidateState, boothLocation) {
        const voterJSON = await ctx.stub.getState(voterID);
        if (!voterJSON || voterJSON.length === 0) {
            throw new Error(`Voter ${voterID} is not registered.`);
        }

        const voter = JSON.parse(voterJSON.toString());

        if (voter.hasVoted) {
            throw new Error(`Security Violation: Voter ${voterID} has already cast a vote.`);
        }

        if (voter.homeState !== candidateState) {
            throw new Error(`Invalid Ballot: Voter from ${voter.homeState} cannot vote for ${candidateState}.`);
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

        return txId;
    }
}

module.exports = VoterContract;