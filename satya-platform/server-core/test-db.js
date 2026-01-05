// test-db.js
const { Client } = require('pg');

// 1. Session Mode (Port 5432) - Usually the most reliable
const configSession = {
    connectionString: "postgresql://postgres.wlyzqqsnbqyhrxuaxeav:SatyaSuccess2026@aws-0-ap-south-1.pooler.supabase.com:5432/postgres",
    ssl: { rejectUnauthorized: false }
};

// 2. Transaction Mode (Port 6543) - Required for high traffic
const configTransaction = {
    connectionString: "postgresql://postgres.wlyzqqsnbqyhrxuaxeav:SatyaSuccess2026@aws-0-ap-south-1.pooler.supabase.com:6543/postgres?sslmode=require",
    ssl: { rejectUnauthorized: false }
};

async function testConnection(name, config) {
    console.log(`\nTesting ${name}...`);
    const client = new Client(config);
    try {
        await client.connect();
        console.log(`✅ ${name}: SUCCESS! Connected.`);
        await client.end();
        return true;
    } catch (err) {
        console.log(`❌ ${name}: FAILED.`);
        console.log(`   Error: ${err.message}`);
        return false;
    }
}

(async () => {
    console.log("--- 🔍 DIAGNOSTIC MODE ---");
    // Try Session Mode first (It works for 99% of people)
    await testConnection("Session Mode (Port 5432)", configSession);
    
    // Try Transaction Mode second
    await testConnection("Transaction Mode (Port 6543)", configTransaction);
})();