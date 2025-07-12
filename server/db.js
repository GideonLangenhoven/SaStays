// This file sets up the connection to the PostgreSQL database using the 'pg' library.
const { Pool } = require('pg');

// Create a new Pool instance. A "pool" is a set of active database connections
// that our server can use, which is much more efficient than creating a new connection for every query.
const pool = new Pool({
  user: 'postgres',      // Replace with your PostgreSQL username (e.g., 'postgres')
  host: 'localhost',                    // This is almost always 'localhost' for a local setup
  database: 'coastal_booking',          // The name we chose for our database
  password: 'Gids5119!!',   // The password you set during PostgreSQL installation
  port: 5432,                           // The default port for PostgreSQL
});

// Export the pool so other files in our project can use it to query the database.
module.exports = pool;
