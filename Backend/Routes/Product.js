const express = require('express');
const axios = require('axios');

const router = express.Router();

// WooCommerce API credentials and URL
const WC_API_URL = 'https://lightyellow-giraffe-133395.hostingersite.com/wp-json/wc/v3';
const CONSUMER_KEY = 'ck_de273cb82f5e03be982192ff4920a4fa6e5983a4';
const CONSUMER_SECRET = 'cs_dca614d53ee4f3d7ea94d93472794a07253f723c';

// Fetch all categories from WooCommerce
async function fetchAllCategories() {
    let page = 1;
    let allCategories = [];
    let keepFetching = true;

    try {
        while (keepFetching) {
            const response = await axios.get(
                `${WC_API_URL}/products/categories?consumer_key=${CONSUMER_KEY}&consumer_secret=${CONSUMER_SECRET}&per_page=100&page=${page}`
            );
            const categories = response.data;

            if (categories.length > 0) {
                allCategories = allCategories.concat(categories);
                page++;  // Move to next page
            } else {
                keepFetching = false;  // No more categories to fetch
            }
        }
    } catch (error) {
        console.error('Error fetching categories:', error);
        throw new Error('Error fetching categories');
    }

    return allCategories;
}

// Route to get all product categories
router.get('/products/categories', async (req, res) => {
    try {
        const categories = await fetchAllCategories();
        res.status(200).json({
            success: true,
            data: categories,  // All categories
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Failed to fetch categories',
        });
    }
});

// GET request to list products based on category name
router.get('/products/category/:categoryName', async (req, res) => {
    const { categoryName } = req.params;
    console.log(`Received request to list products in category: ${categoryName}`);

    try {
        // Step 1: Fetch all categories using the fetchAllCategories function
        const allCategories = await fetchAllCategories();
        console.log('Fetched all categories:', allCategories);

        // Step 2: Find the category by name (case-insensitive)
        const category = allCategories.find(cat => cat.name.toLowerCase() === categoryName.toLowerCase());

        // Step 3: Check if the category exists
        if (!category) {
            console.log(`Category '${categoryName}' not found in fetched categories.`);
            return res.status(404).json({
                success: false,
                message: `Category '${categoryName}' not found.`,
            });
        }

        const categoryId = category.id;

        // Step 4: Fetch products in the found category by ID
        const productResponse = await axios.get(
            `${WC_API_URL}/products?category=${categoryId}&consumer_key=${CONSUMER_KEY}&consumer_secret=${CONSUMER_SECRET}`
        );

        // Send the list of products back to the client
        return res.status(200).json({
            success: true,
            products: productResponse.data,
        });
    } catch (error) {
        console.error('Error fetching products for category:', error);
        return res.status(500).json({
            success: false,
            message: 'Failed to fetch products',
        });
    }
});

// GET request to fetch a specific product by ID
router.get('/products/:productId', async (req, res) => {
    const { productId } = req.params;

    try {
        const response = await axios.get(`${WC_API_URL}/products/${productId}?consumer_key=${CONSUMER_KEY}&consumer_secret=${CONSUMER_SECRET}`);
        res.status(200).json({
            success: true,
            product: response.data,
        });
    } catch (error) {
        console.error('Error fetching product:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch product',
        });
    }
});

// PUT request to update a specific product's stock quantity
router.put('/products/:productId', async (req, res) => {
    const { productId } = req.params;
    const { stock_quantity } = req.body;  // Expecting stock_quantity in request body

    try {
        // Prepare the update object
        let updateData = {};

        // Check if stock_quantity is provided in the request
        if (stock_quantity === null || typeof stock_quantity === 'undefined') {
            return res.status(400).json({
                success: false,
                message: 'stock_quantity must be provided and cannot be null.',
            });
        }

        // Fetch the current product from the database to check current stock_quantity
        const currentProductResponse = await axios.get(`${WC_API_URL}/products/${productId}?consumer_key=${CONSUMER_KEY}&consumer_secret=${CONSUMER_SECRET}`);
        const currentStockQuantity = currentProductResponse.data.stock_quantity;

        console.log('Current stock quantity:', currentStockQuantity); // Log current stock quantity

        // If the current stock_quantity is null, use the new stock_quantity
        updateData.stock_quantity = stock_quantity; // Always update to the new value

        // Set in_stock based on the new stock_quantity
        updateData.in_stock = updateData.stock_quantity > 0; // Set in_stock true if stock_quantity > 0

        // Enable stock management
        updateData.manage_stock = true;  // Ensure stock management is enabled

        // Make the API call to update the product in WooCommerce
        const response = await axios.put(
            `${WC_API_URL}/products/${productId}?consumer_key=${CONSUMER_KEY}&consumer_secret=${CONSUMER_SECRET}`,
            updateData
        );

        console.log('Update response:', response.data); // Log the update response

        // Respond with the updated product information
        res.status(200).json({
            success: true,
            product: response.data,
            in_stock: updateData.in_stock, // Include the updated in_stock status in the response
            manage_stock: updateData.manage_stock, // Include the stock management status
        });
    } catch (error) {
        console.error('Error updating product:', error.response ? error.response.data : error);
        res.status(500).json({
            success: false,
            message: 'Failed to update product',
        });
    }
});

module.exports = router;
