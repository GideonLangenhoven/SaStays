const pool = require('./db');
const bcrypt = require('bcryptjs');

async function createTestData() {
  try {
    // Create test owner
    const hashedPassword = await bcrypt.hash('password123', 10);
    
    // Check if owner exists first
    const existingOwner = await pool.query('SELECT id FROM owners WHERE email = $1', ['owner@test.com']);
    
    if (existingOwner.rows.length === 0) {
      const owner = await pool.query(`
        INSERT INTO owners (full_name, email, password, phone_number) 
        VALUES ($1, $2, $3, $4) 
        RETURNING id, email, full_name
      `, ['Test Owner', 'owner@test.com', hashedPassword, '+27123456789']);
      
      console.log('✅ Test owner created:', owner.rows[0]);
    } else {
      console.log('✅ Test owner already exists');
    }
    
    // Create test guest (if guests table exists)
    try {
      const existingGuest = await pool.query('SELECT id FROM guests WHERE email = $1', ['guest@test.com']);
      
      if (existingGuest.rows.length === 0) {
        const guest = await pool.query(`
          INSERT INTO guests (first_name, last_name, email, password, phone) 
          VALUES ($1, $2, $3, $4, $5) 
          RETURNING id, email, first_name, last_name
        `, ['Test', 'Guest', 'guest@test.com', hashedPassword, '+27987654321']);
        
        console.log('✅ Test guest created:', guest.rows[0]);
      } else {
        console.log('✅ Test guest already exists');
      }
    } catch (err) {
      console.log('ℹ️ Guests table may not exist yet:', err.message);
    }
    
    console.log('\n🔑 Test Login Credentials:');
    console.log('Owner: owner@test.com / password123');
    console.log('Guest: guest@test.com / password123');
    
  } catch (err) {
    console.error('❌ Error creating test data:', err.message);
  } finally {
    pool.end();
  }
}

createTestData();