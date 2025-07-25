const pool = require('./db');

async function createGuestTable() {
  try {
    // Create guests table if it doesn't exist
    await pool.query(`
      CREATE TABLE IF NOT EXISTS guests (
        id SERIAL PRIMARY KEY,
        first_name VARCHAR(100) NOT NULL,
        last_name VARCHAR(100) NOT NULL,
        email VARCHAR(255) UNIQUE NOT NULL,
        password VARCHAR(255) NOT NULL,
        phone VARCHAR(20),
        date_created TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        email_verified BOOLEAN DEFAULT FALSE,
        phone_verified BOOLEAN DEFAULT FALSE
      );
    `);
    
    console.log('✅ Guests table created successfully');
    
  } catch (err) {
    console.error('❌ Error creating guests table:', err.message);
  } finally {
    pool.end();
  }
}

createGuestTable();