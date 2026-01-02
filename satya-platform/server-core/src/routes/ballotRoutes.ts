import { Router } from 'express';
import pool from '../config/db';
import jwt from 'jsonwebtoken';

const router = Router();
const JWT_SECRET = process.env.JWT_SECRET || 'satya_super_secret_key';

// Middleware to check the "VIP Badge"
const authenticateToken = (req: any, res: any, next: any) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1]; // Bearer <TOKEN>

  if (!token) return res.status(401).json({ message: "Access Denied" });

  jwt.verify(token, JWT_SECRET, (err: any, user: any) => {
    if (err) return res.status(403).json({ message: "Invalid Token" });
    req.user = user; // Attach user info to the request
    next();
  });
};

// GET /api/v1/ballot
// Fetch candidates based on the User's HOME constituency (from the token)
router.get('/', authenticateToken, async (req: any, res: any) => {
  try {
    const constituencyId = req.user.constituency_id;

    console.log(`🗳️ Fetching ballot for Constituency ID: ${constituencyId}`);

    // Fetch Candidates and the Constituency Name
    const query = `
      SELECT c.id, c.name, c.party, c.symbol_url, cons.name as constituency_name
      FROM candidates c
      JOIN constituencies cons ON c.constituency_id = cons.id
      WHERE c.constituency_id = $1
    `;

    const result = await pool.query(query, [constituencyId]);

    res.json({
      constituency: result.rows[0]?.constituency_name || "Unknown",
      candidates: result.rows
    });

  } catch (err) {
    console.error("Ballot Error:", err);
    res.status(500).json({ message: "Failed to fetch ballot" });
  }
});

export default router;