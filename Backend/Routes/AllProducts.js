require('dotenv').config(); // Load environment variables
const express = require('express');
const axios = require('axios');
const Product = require('../productModel'); // Import the Product model

const router = express.Router();

// WooCommerce API credentials from .env
const WC_API_URL = process.env.WC_API_URL;
const CONSUMER_KEY = process.env.WC_CONSUMER_KEY;
const CONSUMER_SECRET = process.env.WC_CONSUMER_SECRET;

// Route to fetch all products with only ID and name and save them to the database
router.get('/product/all', async (req, res) => {
    try {
        const perPage = 100; // Number of products per page (max is 100)
        let allProducts = [];
        let page = 1;

        while (true) {
            const response = await axios.get(
                `${WC_API_URL}/products?consumer_key=${CONSUMER_KEY}&consumer_secret=${CONSUMER_SECRET}&per_page=${perPage}&page=${page}`
            );

            // If there are no products returned, break the loop
            if (response.data.length === 0) break;

            // Extract only id and name from each product
            const products = response.data.map(product => ({
                id: product.id,
                name: product.name
            }));

            // Concatenate the extracted products
            allProducts = [...allProducts, ...products];
            page++; // Move to the next page
        }

        // Insert products into MongoDB (upsert to avoid duplicates)
        for (let product of allProducts) {
            await Product.updateOne(
                { id: product.id }, // Find by product ID
                { id: product.id, name: product.name }, // Update product data
                { upsert: true } // Insert if it doesn't exist
            );
        }

        res.status(200).json({
            success: true,
            message: 'Products fetched and saved successfully to MongoDB',
            products: allProducts,
        });
    } catch (error) {
        console.error('Error fetching and saving products:', error.response ? error.response.data : error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch and save products',
        });
    }
});

module.exports = router;
