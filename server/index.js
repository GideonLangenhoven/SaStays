// This is the main file that starts our server.
require('dotenv').config();
// Import the tools we installed
const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const apiRoutes = require('./routes'); // We will import the routes from routes.js

// --- PAYFAST SANDBOX CREDENTIALS ---
// In a real application, these should be stored in environment variables, not in the code.
process.env.PAYFAST_MERCHANT_ID = '10039989'; // Replace with your Sandbox Merchant ID
process.env.PAYFAST_MERCHANT_KEY = 'rl5k0tc2cajg1'; // Replace with your Sandbox Merchant Key
process.env.PAYFAST_PASSPHRASE = 'gids5119gids'; // Replace with your own passphrase

// Create an instance of an Express application
const app = express();
const PORT = 5001; // The port our server will run on

// ---- Middleware ----
// Middleware are functions that run for every request that comes into our server.

// Enhanced request logging middleware
app.use((req, res, next) => {
  const start = Date.now();
  const { method, url, headers, body = {} } = req; // Default to empty object if body is undefined
  
  // Log the incoming request
  console.log(`[${new Date().toISOString()}] ${method} ${url}`);
  console.log('Headers:', JSON.stringify(headers, null, 2));
  
  // Safely log the request body if it exists
  try {
    if (body && Object.keys(body).length > 0) {
      console.log('Body:', JSON.stringify(body, null, 2));
    }
  } catch (err) {
    console.error('Error logging request body:', err);
  }
  
  // Override the end method to log the response
  const originalEnd = res.end;
  res.end = function(chunk, encoding) {
    const duration = Date.now() - start;
    console.log(`[${new Date().toISOString()}] ${method} ${url} - ${res.statusCode} (${duration}ms)`);
    originalEnd.call(this, chunk, encoding);
  };
  
  next();
});

// Enable CORS for all origins (for development)
app.use(cors());

// Parse JSON bodies
app.use(bodyParser.json());

// Parse URL-encoded bodies
app.use(bodyParser.urlencoded({ extended: true }));

// ---- API Routes ----
// We tell our app to use the routes defined in 'routes.js' for any URL starting with /api
app.use('/api', apiRoutes);

// ---- Start the Server ----
// This tells our server to start listening for requests on the specified port.
app.listen(PORT, () => {
  console.log(`✅ Server is running beautifully on http://localhost:${PORT}`);
});
