// backend/controllers/productController.js

const axios = require('axios');

// Replace with your WooCommerce API credentials and URL
const WC_API_URL = 'https://your-shopify-store.com/wp-json/wc/v3/products';
const CONSUMER_KEY = 'ck_c1e038ab6a2043e593159b1f82c88014da195542';
const CONSUMER_SECRET = 'cs_b4c7be0d12d0f354584dbf49b4f1dbae342e39f0';

// Function to update a product
const updateProduct = async (req, res) => {
    const productId = req.params.id;
    const productData = req.body;

    try {
        const response = await axios.put(
            `${WC_API_URL}/${productId}?consumer_key=${CONSUMER_KEY}&consumer_secret=${CONSUMER_SECRET}`,
            productData
        );

        res.status(200).json({
            success: true,
            data: response.data,
        });
    } catch (error) {
        console.error('Error updating product:', error.response.data);
        res.status(error.response.status || 500).json({
            success: false,
            message: error.response.data.message || 'Server Error',
        });
    }
};

module.exports = { updateProduct };
