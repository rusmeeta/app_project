import React from "react";
import { Link } from "react-router-dom";

const FarmerDashboard = () => {
  // Get farmer info from localStorage
  const user = JSON.parse(localStorage.getItem("user"));

  return (
    <div className="min-h-screen bg-green-50 flex flex-col">
      {/* Header */}
      <header className="bg-green-600 text-white p-4 flex justify-between items-center">
        <h1 className="text-xl font-bold">Farmer Dashboard</h1>
        <div>
          {user && <span className="mr-4">Hello, {user.fullname}</span>}
          <button
            className="bg-white text-green-600 font-semibold px-3 py-1 rounded"
            onClick={() => {
              localStorage.removeItem("user");
              window.location.href = "/login";
            }}
          >
            Logout
          </button>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 p-6">
        <h2 className="text-2xl font-bold mb-4">Welcome to your Dashboard!</h2>
        <p className="text-gray-700 mb-6">
          Use the buttons below to manage your products.
        </p>

        <div className="flex space-x-4">
          <Link
            to="/farmer/add-product"
            className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700 transition"
          >
            Add Product
          </Link>
          <Link
            to="/farmer/products"
            className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700 transition"
          >
            My Products
          </Link>
        </div>
      </main>
    </div>
  );
};

export default FarmerDashboard;
