const express = require('express');
const axios = require('axios');
const Product =require('../productModel')
require('dotenv').config(); // Load environment variables 

const router = express.Router();

// WooCommerce API credentials and URL
// const WC_API_URL = 'https://darkviolet-sparrow-841938.hostingersite.com/wp-json/wc/v3/products';
// const CONSUMER_KEY = 'ck_936c286d78cd626f51b194b49f0643f8fefc4583';
// const CONSUMER_SECRET = 'cs_22a2bb44d946f6e286c3e20b6a956f998052bc60';

const WC_API_URL = process.env.WC_API_URL;
const CONSUMER_KEY = process.env.WC_CONSUMER_KEY;
const CONSUMER_SECRET = process.env.WC_CONSUMER_SECRET;

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
//   // Assuming the model is in the 'models' folder

router.put('/products/:productId', async (req, res) => {
    const { productId } = req.params;
    const { stock_quantity } = req.body;  // Expecting stock_quantity in request body

    try {
        // Step 1: Verify if the product exists in MongoDB
        const productInDb = await Product.findOne({ id: productId });


        if (!productInDb) {
            return res.status(404).json({
                success: false,
                message: 'Product not found in the database.',
            });
        }

        // Step 2: Fetch the current product details from WooCommerce
        const currentProductResponse = await axios.get(
            `${WC_API_URL}/products/${productId}?consumer_key=${CONSUMER_KEY}&consumer_secret=${CONSUMER_SECRET}`
        );
        console.log(currentProductResponse)

        // Step 3: If stock_quantity is provided, validate it
        if (stock_quantity === null || typeof stock_quantity === 'undefined') {
            return res.status(400).json({
                success: false,
                message: 'stock_quantity must be provided and cannot be null.',
            });
        }

        // Step 4: Prepare the update object for WooCommerce
        let updateData = {
            stock_quantity: stock_quantity,  // Always update to the new value
            in_stock: stock_quantity > 0,    // Set in_stock true if stock_quantity > 0
            manage_stock: true,              // Ensure stock management is enabled
        };

        // Step 5: Update product in WooCommerce
        const response = await axios.put(
            `${WC_API_URL}/products/${productId}?consumer_key=${CONSUMER_KEY}&consumer_secret=${CONSUMER_SECRET}`,
            updateData
        );

        console.log('Update response from WooCommerce:', response.data);  // Log the update response

        // Step 6: Respond with the updated product information
        res.status(200).json({
            success: true,
            product: response.data,
            in_stock: updateData.in_stock,  // Include the updated in_stock status
            manage_stock: updateData.manage_stock,  // Include the stock management status
        });
    } catch (error) {
        console.error('Error updating product:', error.response ? error.response.data : error);
        res.status(500).json({
            success: false,
            message: 'Failed to update product',
        });
    }
});



// Webhook to handle order status updates
router.post('/webhook/orderprocess', async (req, res) => {
    const webhookData = req.body;
    console.log(webhookData)

    try {
        // Check if the order status is "completed"
        if (webhookData.status === 'completed') {
            console.log('Order completed webhook received:', webhookData);

            // Extract the line items (products) from the order
            const lineItems = webhookData.line_items || [];
            
            // Iterate over each product in the order
            for (const item of lineItems) {
                const productId = item.product_id; // WooCommerce product ID
                const quantity = item.quantity; // Quantity ordered

                console.log(`Reducing stock for Product ID: ${productId}, Quantity: ${quantity}`);

                // Fetch the current stock quantity of the product
                const currentProductResponse = await axios.get(`${WC_API_URL}/products/${productId}?consumer_key=${CONSUMER_KEY}&consumer_secret=${CONSUMER_SECRET}`);
                const currentStockQuantity = currentProductResponse.data.stock_quantity;

                if (currentStockQuantity === null) {
                    console.log(`Stock quantity is not managed for Product ID: ${productId}`);
                    continue; // Skip products without stock management
                }

                // Calculate the new stock quantity
                const newStockQuantity = currentStockQuantity - quantity;

                // Update the product's stock quantity
                const updateResponse = await axios.put(
                    `${WC_API_URL}/products/${productId}?consumer_key=${CONSUMER_KEY}&consumer_secret=${CONSUMER_SECRET}`,
                    {
                        stock_quantity: newStockQuantity > 0 ? newStockQuantity : 0, // Ensure stock doesn't go below 0
                        in_stock: newStockQuantity > 0, // Set in_stock based on new stock quantity
                    }
                );

                console.log(`Updated Product ID: ${productId}, New Stock Quantity: ${newStockQuantity}`);
            }
        }

        // Respond to WooCommerce that the webhook was received successfully
        res.status(200).json({
            success: true,
            message: 'Webhook processed successfully',
        });
    } catch (error) {
        console.error('Error processing webhook:', error.response ? error.response.data : error);
        res.status(500).json({
            success: false,
            message: 'Failed to process webhook',
        });
    }
});


module.exports = router;
