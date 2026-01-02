import { Pool } from 'pg';
import dotenv from 'dotenv';

dotenv.config();

// Member B's Connection Pool
// This reads your .env variables to connect to Docker
const pool = new Pool({
  user: process.env.DB_USER || 'admin',
  host: process.env.DB_HOST || 'localhost',
  database: process.env.DB_NAME || 'satya_core',
  password: process.env.DB_PASSWORD || 'password123',
  port: Number(process.env.DB_PORT) || 5432,
});

pool.on('connect', () => {
  console.log('✅ Connected to SATYA PostgreSQL Database');
});

pool.on('error', (err) => {
  console.error('❌ Unexpected error on idle client', err);
});

export default pool;