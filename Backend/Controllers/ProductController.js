// backend/controllers/productController.js

const axios = require('axios');

// Replace with your WooCommerce API credentials and URL
const WC_API_URL = 'https://darkviolet-sparrow-841938.hostingersite.com/wp-json/wc/v3';
const CONSUMER_KEY = 'ck_936c286d78cd626f51b194b49f0643f8fefc4583';
const CONSUMER_SECRET = 'cs_22a2bb44d946f6e286c3e20b6a956f998052bc60';


// Function to update a product
const updateProduct = async (req, res) => {
    const productId = req.params.id;
    const productData = req.body;

    try {
        const response = await axios.put(
            `${WC_API_URL}/${productId}?consumer_key=${CONSUMER_KEY}&consumer_secret=${CONSUMER_SECRET}`,productData
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
