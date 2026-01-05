import { Pool } from 'pg';
import dotenv from 'dotenv';

dotenv.config();

// ☢️ NUCLEAR FIX: Ignore certificate errors ☢️
process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';

// --- ⚡️ THE CORRECT CONNECTION STRING ⚡️ ---
// Host: aws-1-ap-south-1 (Correct!)
// Port: 5432 (Session Mode - Works perfectly with Node.js)
const CONNECTION_STRING = "postgresql://postgres.wlyzqqsnbqyhrxuaxeav:SatyaSuccess2026@aws-1-ap-south-1.pooler.supabase.com:5432/postgres";

const pool = new Pool({
  connectionString: CONNECTION_STRING,
  max: 10,
  idleTimeoutMillis: 30000
});

pool.on('connect', () => {
  console.log('✅ Connected to SATYA Cloud Database (Supabase)');
});

pool.on('error', (err) => {
  console.error('❌ Database Error:', err);
});

export default pool;