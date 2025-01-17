// server.js

const express = require('express');
const cors = require('cors');
const product = require('./Routes/Product.js'); // Corrected import
const all=require('./Routes/AllProducts.js')

const app = express();
const PORT = process.env.PORT || 5000;

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
