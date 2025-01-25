import React, { useState, useEffect } from 'react';
import axios from 'axios';

const Shopify = () => {
  const [categories, setCategories] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState('');
  const [products, setProducts] = useState([]);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [productQuantities, setProductQuantities] = useState({});

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

  const handleCategoryClick = (categoryName) => {
    setSelectedCategory(categoryName);
    fetchProductsByCategory(categoryName);
  };

  const updateProductQuantity = async (productId) => {
    const newQuantity = productQuantities[productId];

    if (newQuantity === undefined || newQuantity < 0) {
      alert('Please enter a valid quantity.');
      return;
    }

    try {
      await axios.put(`http://localhost:5000/api/products/${productId}`, {
        stock_quantity: newQuantity,
      });
      alert('Quantity updated successfully');
      fetchProductsByCategory(selectedCategory);
    } catch (err) {
      setError(`Failed to update quantity for product ID: ${productId}`);
    }
  };

  return (
    <div className="flex flex-col lg:flex-row gap-8">
      {/* Categories Sidebar */}
      <div className="w-full lg:w-1/3 p-6 bg-white rounded-xl shadow-md">
        <h2 className="text-xl font-semibold text-indigo-600 mb-4 text-center">Shopify Categories</h2>
        <div className="space-y-4">
          {categories.map((category) => (
            <div
              key={category.id}
              className="bg-indigo-50 hover:bg-indigo-100 border border-indigo-200 rounded-lg p-4 cursor-pointer transition transform hover:scale-105"
              onClick={() => handleCategoryClick(category.name)}
            >
              <h3 className="text-lg font-semibold text-indigo-800">{category.name}</h3>
              <p className="text-sm text-gray-600">{category.count} products</p>
            </div>
          ))}
        </div>
      </div>

      {/* Product List */}
      <div className="w-full lg:w-2/3">
        {loading ? (
          <div className="flex justify-center items-center h-full">
            <div className="animate-spin rounded-full h-8 w-8 border-t-4 border-indigo-500"></div>
          </div>
        ) : error ? (
          <p className="text-red-500 text-center">{error}</p>
        ) : (
          <div>
            {products.length > 0 ? (
              <div>
                <h3 className="text-2xl font-bold text-indigo-600 mb-6">
                  Products in {selectedCategory}
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                  {products.map((product) => (
                    <div key={product.id} className="bg-white border border-gray-200 rounded-lg shadow-lg p-6 transition hover:shadow-xl">
                      <img
                        src={product.images[0]?.src}
                        alt={product.name}
                        className="w-full h-48 object-cover rounded-md mb-4"
                      />
                      <h4 className="text-lg font-semibold text-gray-800">{product.name}</h4>
                      <p className="text-sm text-gray-600 mb-4">
                        Quantity: {product.stock_quantity || 0}
                      </p>
                      <div className="flex items-center justify-between">
                        <input
                          type="number"
                          defaultValue={product.stock_quantity}
                          min="0"
                          className="border rounded px-2 py-1 w-16"
                          onChange={(e) => {
                            const value = parseInt(e.target.value);
                            setProductQuantities((prev) => ({ ...prev, [product.id]: value }));
                          }}
                        />
                        <button
                          className="bg-indigo-600 text-white px-4 py-2 rounded hover:bg-indigo-700"
                          onClick={() => updateProductQuantity(product.id)}
                        >
                          Update
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              selectedCategory && (
                <p className="text-center text-gray-600">No products found for this category.</p>
              )
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default Shopify;
