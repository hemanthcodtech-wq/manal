const { Pool } = require('pg');
const bcrypt = require('bcrypt');
require('dotenv').config();

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false }
});

const seedAdmin = async () => {
  try {
    const email = 'admin@ourlocal.in';
    const password = 'admin123';
    
    // Check if user already exists
    const check = await pool.query('SELECT * FROM users WHERE email = $1', [email]);
    if (check.rows.length > 0) {
      console.log('Admin user already exists. Updating password and verification status just in case...');
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    
    await pool.query(
      `INSERT INTO users (email, password, role, is_verified) 
       VALUES ($1, $2, $3, $4) 
       ON CONFLICT (email) 
       DO UPDATE SET password = EXCLUDED.password, is_verified = EXCLUDED.is_verified`,
      [email, hashedPassword, 'admin', true]
    );
    
    console.log(`Successfully seeded admin: ${email} / ${password}`);
  } catch (error) {
    console.error('Error seeding admin:', error);
  } finally {
    await pool.end();
  }
};

seedAdmin();
