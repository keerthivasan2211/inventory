const express = require('express');
const axios = require('axios');

const router = express.Router();


// const WC_API_URL = 'https://lightcyan-rook-900917.hostingersite.com/wp-json/wc/v3';
// const CONSUMER_KEY = 'ck_ef3c13311f1d9cd849a174266110a8f1047d0ae1';
// const CONSUMER_SECRET = 'cs_bb3124c24995857b791408ad4fee55cce2ce8dc2';

const WC_API_URL = 'https://darkviolet-sparrow-841938.hostingersite.com/wp-json/wc/v3';
const CONSUMER_KEY = 'ck_936c286d78cd626f51b194b49f0643f8fefc4583';
const CONSUMER_SECRET = 'cs_22a2bb44d946f6e286c3e20b6a956f998052bc60';




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
