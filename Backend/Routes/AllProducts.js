const express = require('express');
const axios = require('axios');

const router = express.Router();

// WooCommerce API credentials
// const WC_API_URL = 'https://staging3.vaseegrahveda.ae/wp-json/wc/v3';
// const CONSUMER_KEY = 'ck_c1e038ab6a2043e593159b1f82c88014da195542';
// const CONSUMER_SECRET = 'cs_b4c7be0d12d0f354584dbf49b4f1dbae342e39f0';

const WC_API_URL = 'https://lightyellow-giraffe-133395.hostingersite.com/wp-json/wc/v3';
const CONSUMER_KEY = 'ck_de273cb82f5e03be982192ff4920a4fa6e5983a4';
const CONSUMER_SECRET = 'cs_dca614d53ee4f3d7ea94d93472794a07253f723c';
// Route to fetch all products
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

            // Include all fields in the product list response
            allProducts = [...allProducts, ...response.data]; // Concatenate results
            page++; // Move to the next page
        }

        res.status(200).json({
            success: true,
            products: allProducts,
        });
    } catch (error) {
        console.error('Error fetching products:', error.response ? error.response.data : error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch products',
        });
    }
});

module.exports = router;
