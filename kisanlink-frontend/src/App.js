import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";

// Public pages
import Home from "./pages/Home";
import Login from "./pages/Login";
import Signup from "./pages/Signup";

// Farmer pages
import FarmerDashboard from "./pages/farmer/Dashboard";
import AddProduct from "./pages/farmer/AddProduct";
import ProductList from "./pages/farmer/ProductList";

function App() {
  return (
    <Router>
      <Routes>
        {/* Public pages */}
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />

        {/* Farmer dashboard pages */}
        <Route path="/farmer/dashboard" element={<FarmerDashboard />} />
        <Route path="/farmer/add-product" element={<AddProduct />} />
        <Route path="/farmer/products" element={<ProductList />} />
      </Routes>
    </Router>
  );
}

export default App;
