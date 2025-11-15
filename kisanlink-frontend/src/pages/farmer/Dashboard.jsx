import React, { useEffect, useState } from "react";
import AddProduct from "./AddProduct";
import ProductList from "./ProductList";

const FarmerDashboard = () => {
  const [user, setUser] = useState(null);
  const [activeTab, setActiveTab] = useState("dashboard"); // controls which component to show

  useEffect(() => {
    const storedUser = localStorage.getItem("user");
    if (storedUser) setUser(JSON.parse(storedUser));
  }, []);

  return (
    <div className="min-h-screen bg-green-50 flex flex-col">
      {/* Header */}
      <header className="bg-green-600 text-white p-4 flex justify-between items-center shadow-md">
        <h1 className="text-xl font-bold">Farmer Dashboard</h1>
        <div>
          {user && <span className="mr-4">Hello, {user.fullname}</span>}
          <button
            className="bg-white text-green-600 font-semibold px-3 py-1 rounded hover:bg-green-100"
            onClick={() => {
              localStorage.removeItem("user");
              window.location.href = "/login";
            }}
          >
            Logout
          </button>
        </div>
      </header>

      <div className="flex flex-1">
        {/* Sidebar */}
        <aside className="w-64 bg-white shadow-md p-6">
          <h1 className="text-2xl font-bold text-green-600 mb-8">KisanLink</h1>
          <nav className="space-y-4">
            <button
              className="block text-gray-700 font-semibold hover:text-green-600 w-full text-left"
              onClick={() => setActiveTab("dashboard")}
            >
              Dashboard
            </button>
            <button
              className="block text-gray-700 font-semibold hover:text-green-600 w-full text-left"
              onClick={() => setActiveTab("addProduct")}
            >
              Add Product
            </button>
            <button
              className="block text-gray-700 font-semibold hover:text-green-600 w-full text-left"
              onClick={() => setActiveTab("productList")}
            >
              Product List
            </button>
            <button
              className="block text-gray-700 font-semibold hover:text-green-600 w-full text-left"
              onClick={() => setActiveTab("reports")}
            >
              Reports
            </button>
          </nav>
        </aside>

        {/* Main Content */}
        <main className="flex-1 p-10">
          {activeTab === "dashboard" && (
            <>
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-3xl font-bold text-green-700">
                  Welcome to Your Farmer Dashboard!
                </h2>
                <button className="bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700">
                  Edit Profile
                </button>
              </div>

              {/* Farmer Info */}
              <div className="bg-white p-5 rounded-lg shadow-md mb-6">
                <h3 className="text-xl font-semibold text-gray-800 mb-3">
                  Farmer Information
                </h3>
                <p>
                  <strong>Name:</strong> {user ? user.fullname : "Rudra Chaulagain"}
                </p>
                <p>
                  <strong>Member Since:</strong> 2025-11-05
                </p>
              </div>

              {/* Sales Summary */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
                <div className="bg-green-100 p-6 rounded-lg shadow text-center">
                  <h4 className="text-lg font-semibold text-gray-700">
                    Today's Sales
                  </h4>
                  <p className="text-2xl font-bold text-green-700 mt-2">Rs 0</p>
                </div>
                <div className="bg-green-100 p-6 rounded-lg shadow text-center">
                  <h4 className="text-lg font-semibold text-gray-700">
                    Last 7 Days
                  </h4>
                  <p className="text-2xl font-bold text-green-700 mt-2">Rs 290</p>
                </div>
                <div className="bg-green-100 p-6 rounded-lg shadow text-center">
                  <h4 className="text-lg font-semibold text-gray-700">
                    Last 30 Days
                  </h4>
                  <p className="text-2xl font-bold text-green-700 mt-2">Rs 12,503</p>
                </div>
              </div>
            </>
          )}

          {activeTab === "addProduct" && <AddProduct />}
          {activeTab === "productList" && <ProductList />}
          {activeTab === "reports" && <div>Reports section coming soon...</div>}
        </main>
      </div>
    </div>
  );
};

export default FarmerDashboard;
