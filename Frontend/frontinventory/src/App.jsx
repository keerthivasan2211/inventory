// App.jsx
import React from 'react';
import { BrowserRouter as Router, Route, Routes, Link } from 'react-router-dom';
import Woo from './Components/Woocommerce.jsx';
import Shopify from './Components/Shop.jsx';
import AddProductPage from './Components/Add.jsx'; // Import AddProductPage component
import './App.css';

function App() {
  return (
    <Router>
      <div className="bg-gray-100 py-0 min-h-screen w-screen">
        <div className="w-full h-full px-4">
          <h1 className="text-3xl font-semibold text-center text-indigo-700 mb-10">E-Commerce Dashboard</h1>

          {/* Navigation Links */}
          <nav className="mb-6 flex justify-center gap-4">
            <Link to="/" className="text-indigo-700 hover:text-indigo-900">Dashboard</Link>
            <Link to="/add-product" className="text-indigo-700 hover:text-indigo-900">Add Product</Link>
          </nav>

          <div className="flex flex-col lg:flex-row gap-10 justify-between items-start h-full">
            {/* Define Routes */}
            <Routes>
              <Route path="/" element={
                <div className="flex flex-col lg:flex-row gap-10 justify-between items-start h-full">
                  {/* WooCommerce Component */}
                  <div className="max-w-full lg:w-3/4 xl:w-1/2 h-full bg-white p-6 rounded-xl shadow-lg overflow-hidden">
                    <Woo />
                  </div>

                  {/* Shopify Component */}
                  <div className="w-full lg:w-1/2 h-full bg-white p-6 rounded-xl shadow-lg overflow-hidden">
                    <Shopify />
                  </div>
                </div>
              } />

              {/* Add Product Page Route */}
              <Route path="/add-product" element={<AddProductPage />} />
            </Routes>
          </div>
        </div>
      </div>
    </Router>
  );
}

export default App;
