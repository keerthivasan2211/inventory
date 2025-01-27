// server.js

const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');

const product = require('./Routes/Product.js'); // Corrected import
const all=require('./Routes/AllProducts.js')

const app = express();
const PORT = process.env.PORT || 5000;

mongoose.connect('mongodb://localhost:27017/sync', {
    bufferCommands: false, // Disable command buffering
    connectTimeoutMS: 30000, // Increase connection timeout
})
// Middleware
app.use(cors());
app.use(express.json());

// Use the product routes
app.use('/api', product);
app.use('/api',all)

// Start the server
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT} `);
});
