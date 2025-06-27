// server/index.js

const path = require('path'); // Import the 'path' module

// --- THIS IS THE FINAL FIX ---
// We tell dotenv the exact path to the .env file.
require('dotenv').config({ path: path.resolve(__dirname, './.env') });

const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const apiRoutes = require('./routes');

const app = express();
const PORT = 5001;

app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

app.use('/api', apiRoutes);

app.listen(PORT, () => {
  console.log('-----------------------------------');
  console.log(`✅ Server is running on http://localhost:${PORT}`);
  
  if (process.env.PAYFAST_MERCHANT_ID) {
    console.log('✅ PayFast Merchant ID has been successfully loaded.');
  } else {
    console.error('❌ FATAL ERROR: PayFast Merchant ID is NOT loaded. Please check your .env file in the /server directory.');
  }
  console.log('-----------------------------------');
});