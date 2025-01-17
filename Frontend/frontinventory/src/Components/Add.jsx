import React, { useState, useEffect } from 'react';
import axios from 'axios';

const ProductCategories = () => {
    const [categories, setCategories] = useState([]);
    const [selectedCategory, setSelectedCategory] = useState('');
    const [products, setProducts] = useState([]);
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const [productQuantities, setProductQuantities] = useState({}); // To store product quantities

    // Fetch categories on component mount
    useEffect(() => {
        const fetchCategories = async () => {
            try {
                const response = await axios.get('http://localhost:5000/api/products/categories');
                setCategories(response.data.data); 
            } catch (err) {
                setError('Failed to fetch categories');
            }
        };

        fetchCategories();
    }, []);

    // Fetch products based on selected category
    const fetchProductsByCategory = async (categoryName) => {
        setLoading(true);
        try {
            const response = await axios.get(`http://localhost:5000/api/products/category/${categoryName}`);
            setProducts(response.data.products);
            setError('');
        } catch (err) {
            setError(`Failed to fetch products for category: ${categoryName}`);
        } finally {
            setLoading(false);
        }
    };

    // Handle category selection
    const handleCategoryClick = (categoryName) => {
        setSelectedCategory(categoryName);
        fetchProductsByCategory(categoryName);
    };

    // Update quantity of the product
    const updateProductQuantity = async (productId) => {
        const newQuantity = productQuantities[productId];

        // Check if newQuantity is undefined or less than 0
        if (newQuantity === undefined || newQuantity < 0) {
            alert('Please enter a valid quantity.');
            return;
        }

        try {
            // Fetch the current product to get its existing stock quantity
            const productResponse = await axios.get(`http://localhost:5000/api/products/${productId}`);
            const existingStock = productResponse.data.product.stock_quantity;

            // Determine the updated quantity
            // If existingStock is null, use newQuantity; otherwise, use newQuantity
            const updatedQuantity = existingStock === null ? newQuantity : newQuantity;

            // Make the update request to WooCommerce
            await axios.put(`http://localhost:5000/api/products/${productId}`, {
                stock_quantity: updatedQuantity,
            });

            alert('Quantity updated successfully');
            // Optionally, refresh the products list to reflect the changes
            fetchProductsByCategory(selectedCategory); // Refresh products after update
        } catch (err) {
            setError(`Failed to update quantity for product ID: ${productId}`);
        }
    };

    return (
        <div className="p-6 max-w-7xl mx-auto flex flex-col lg:flex-row gap-6">
            {/* Categories Sidebar */}
            <div className="w-full lg:w-1/3 mb-6 lg:mb-0">
                <h1 className="text-4xl font-extrabold mb-6 text-center text-indigo-600">Product Categories</h1>
                <div className="grid grid-cols-1 gap-6">
                    {categories.map((category) => (
                        <div
                            key={category.id}
                            className="bg-white border border-gray-300 rounded-lg p-6 shadow-lg hover:shadow-2xl transition-all transform hover:scale-105 cursor-pointer"
                            onClick={() => handleCategoryClick(category.name)}
                        >
                            <h3 className="text-lg font-semibold text-gray-800 text-center">{category.name}</h3>
                            <p className="text-gray-600 mt-2 text-center">({category.count} products)</p>
                        </div>
                    ))}
                </div>
            </div>

            {/* Product List */}
            <div className="w-full lg:w-2/3 lg:pl-6">
                {loading ? (
                    <div className="flex justify-center items-center h-full">
                        <div className="spinner-border animate-spin inline-block w-8 h-8 border-4 rounded-full text-indigo-500"></div>
                    </div>
                ) : error ? (
                    <p className="text-red-500 text-center">{error}</p>
                ) : (
                    <div>
                        {products.length > 0 ? (
                            <div>
                                <h2 className="text-3xl font-bold mb-6 text-center text-indigo-600">
                                    Products in {selectedCategory}:
                                </h2>
                                <ul className="space-y-4">
                                    {products.map((product) => (
                                        <li
                                            key={product.id}
                                            className="bg-white border border-gray-300 rounded-lg p-6 shadow-md flex items-center hover:shadow-lg transition-shadow duration-300 transform hover:-translate-y-1"
                                        >
                                            <img
                                                src={product.images[0]?.src}
                                                alt={product.name}
                                                className="w-24 h-24 object-cover rounded-lg mr-6"
                                            />
                                            <div className="flex-grow">
                                                <h3 className="text-lg font-semibold text-gray-800">{product.name}</h3>
                                                <p className="text-gray-600">Quantity: {product.stock_quantity || 0}</p>
                                            </div>

                                            {/* Quantity Input and Update Button */}
                                            <div className="ml-auto flex items-center">
                                                <input
                                                    type="number"
                                                    defaultValue={product.stock_quantity}
                                                    className="border rounded px-2 py-1 mr-2 w-16"
                                                    min="0"
                                                    onChange={(e) => {
                                                        const value = parseInt(e.target.value);
                                                        setProductQuantities((prev) => ({
                                                            ...prev,
                                                            [product.id]: value,
                                                        }));
                                                    }}
                                                />
                                                <button
                                                    className="bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700"
                                                    onClick={() => updateProductQuantity(product.id)}
                                                >
                                                    Update
                                                </button>
                                            </div>
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        ) : (
                            selectedCategory && (
                                <p className="text-center text-gray-500">No products found for this category.</p>
                            )
                        )}
                    </div>
                )}
            </div>
        </div>
    );
};

export default ProductCategories;
