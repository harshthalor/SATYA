import pool from '../config/db';

const seedDatabase = async () => {
  try {
    console.log("🌱 Seeding SATYA Database...");

    // 1. Clean Slate (Drop & Recreate Tables)
    // We use CASCADE to remove links between tables automatically
    await pool.query(`
      DROP TABLE IF EXISTS candidates, voters, constituencies, states CASCADE;
      
      CREATE TABLE states (
          id SERIAL PRIMARY KEY,
          name VARCHAR(100) UNIQUE NOT NULL,
          code VARCHAR(10) UNIQUE NOT NULL
      );

      CREATE TABLE constituencies (
          id SERIAL PRIMARY KEY,
          state_id INT REFERENCES states(id),
          name VARCHAR(100) NOT NULL
      );

      CREATE TABLE candidates (
          id SERIAL PRIMARY KEY,
          constituency_id INT REFERENCES constituencies(id),
          name VARCHAR(100) NOT NULL,
          party VARCHAR(100) NOT NULL,
          symbol_url TEXT
      );

      CREATE TABLE voters (
          id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
          epic_id VARCHAR(20) UNIQUE NOT NULL,
          full_name VARCHAR(100) NOT NULL,
          home_constituency_id INT REFERENCES constituencies(id),
          biometric_hash TEXT UNIQUE,
          has_voted BOOLEAN DEFAULT FALSE
      );
    `);

    // 2. Insert States (The "Spreadsheets")
    const stateRes = await pool.query(`
      INSERT INTO states (name, code) 
      VALUES ('Delhi', 'DL'), ('Maharashtra', 'MH'), ('Bihar', 'BR') 
      RETURNING *;
    `);
    const dlId = stateRes.rows.find((s: any) => s.code === 'DL').id;
    const mhId = stateRes.rows.find((s: any) => s.code === 'MH').id;

    // 3. Insert Constituencies
    const constRes = await pool.query(`
      INSERT INTO constituencies (state_id, name)
      VALUES 
        (${dlId}, 'New Delhi'), 
        (${dlId}, 'Chandni Chowk'),
        (${mhId}, 'Mumbai South')
      RETURNING *;
    `);
    const ndId = constRes.rows.find((c: any) => c.name === 'New Delhi').id;

    // 4. Insert Candidates (For Member A's Frontend)
    await pool.query(`
      INSERT INTO candidates (constituency_id, name, party, symbol_url)
      VALUES 
        (${ndId}, 'Arvind K.', 'AAP', 'broom.png'),
        (${ndId}, 'Manoj T.', 'BJP', 'lotus.png');
    `);

    // 5. Insert YOUR Test Voter
    await pool.query(`
      INSERT INTO voters (epic_id, full_name, home_constituency_id, biometric_hash)
      VALUES ('ABC1234567', 'Rahul Sharma', ${ndId}, 'dummy_hash_123');
    `);

    console.log("✅ Seeding Complete! User 'Rahul Sharma' ready for testing.");
    process.exit();

  } catch (err) {
    console.error("❌ Seeding Failed:", err);
    process.exit(1);
  }
};

seedDatabase();