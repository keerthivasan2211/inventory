import React from 'react';
import { BrowserRouter as Router, Route, Routes, Link } from 'react-router-dom';
import Woo from './Components/Woocommerce.jsx';
import Shopify from './Components/Shop.jsx';
import AddProductPage from './Components/Add.jsx'; // Import AddProductPage component

function App() {
  return (
    <Router>
      <div className="w-full min-h-screen bg-gray-100">
        {/* Header */}
        <div className="bg-indigo-600 p-6">
          <h1 className="text-4xl font-semibold text-white text-center">
            E-Commerce Dashboard
          </h1>
        </div>

        {/* Navigation Bar */}
        <div className="bg-white p-4 shadow-md">
          <nav className="flex justify-center gap-6">
            <Link
              to="/"
              className="text-indigo-700 hover:text-indigo-900 font-medium text-lg py-2 px-4 rounded-lg transition"
            >
              Dashboard
            </Link>
            <Link
              to="/add-product"
              className="text-indigo-700 hover:text-indigo-900 font-medium text-lg py-2 px-4 rounded-lg transition"
            >
              Add Product
            </Link>
          </nav>
        </div>

        {/* Routes */}
        <Routes>
          {/* Dashboard Route */}
          <Route
            path="/"
            element={
              <div className="flex justify-between p-6">
                {/* WooCommerce Component aligned to the left */}
                <div className="w-1/2 p-4">
                  <Woo />
                </div>

                {/* Shopify Component aligned to the right */}
                <div className="w-1/2 p-4">
                  <Shopify />
                </div>
              </div>
            }
          />

          {/* Add Product Page Route */}
          <Route path="/add-product" element={
            <div className='m-5'><AddProductPage /></div> } />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
