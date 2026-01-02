'use strict';

const stringify = require('json-stringify-deterministic');
const sortKeysRecursive = require('sort-keys-recursive');
const { Contract } = require('fabric-contract-api');

class SatyaContract extends Contract {

    // 1. Initialize the Ledger with an empty state or test data
    async InitLedger(ctx) {
        console.info('============= SATYA Ledger Initialized =============');
    }

    // 2. PHASE 3 LOGIC: Cast a vote with Mobility/District tracking
    async CastVote(ctx, voterId, candidateId, district) {
        // Double-Voting Protection
        const exists = await this.AssetExists(ctx, voterId);
        if (exists) {
            throw new Error(`Security Alert: Voter ${voterId} has already cast a vote.`);
        }

        const vote = {
            ID: voterId,             // Using VoterID as the unique key
            CandidateID: candidateId,
            HomeDistrict: district,  // The migrant's home state/district
            Timestamp: new Date().toISOString(),
            docType: 'vote',
        };

        // Deterministic stringify ensures the hash is the same across all peers
        await ctx.stub.putState(voterId, Buffer.from(stringify(sortKeysRecursive(vote))));
        return JSON.stringify(vote);
    }

    // 3. Read a Vote (Verification)
    async ReadAsset(ctx, id) {
        const assetJSON = await ctx.stub.getState(id);
        if (!assetJSON || assetJSON.length === 0) {
            throw new Error(`The record ${id} does not exist`);
        }
        return assetJSON.toString();
    }

    // 4. Helper: Check if a voter has already interacted with the ledger
    async AssetExists(ctx, id) {
        const assetJSON = await ctx.stub.getState(id);
        return assetJSON && assetJSON.length > 0;
    }

    // 5. Query all votes (For Admin Dashboard - Member A)
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
                record = strValue;
            }
            allResults.push(record);
            result = await iterator.next();
        }
        return JSON.stringify(allResults);
    }
}

module.exports = SatyaContract;