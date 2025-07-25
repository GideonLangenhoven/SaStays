// server/index.js

const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, './.env') });

const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const apiRoutes = require('./routes');
require('./scheduler'); // <-- ADD THIS LINE TO INITIALIZE THE SCHEDULER

const app = express();
const PORT = 5001;

app.use(cors({
  origin: ['http://localhost:3000', 'http://localhost:5173', 'http://localhost:8080', 'http://localhost:8081', 'http://localhost:4173'],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With']
}));
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