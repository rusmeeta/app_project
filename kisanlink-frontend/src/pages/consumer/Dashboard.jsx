// src/pages/consumer/Dashboard.jsx
import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { User, ShoppingCart, MessageCircle } from "lucide-react";

const Dashboard = () => {
  const [user, setUser] = useState(null);
  const [products, setProducts] = useState([]);
  const [cart, setCart] = useState([]);
  const [notifications, setNotifications] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");

  // Load user from localStorage
  useEffect(() => {
    const storedUser = localStorage.getItem("user");
    if (storedUser) setUser(JSON.parse(storedUser));
  }, []);

  // Fetch products, cart, notifications after user is set
  useEffect(() => {
    if (user) {
      fetchProducts();
      fetchCart();
      fetchNotifications();
    }
  }, [user]);

  // ------------------------
  // Fetch products from backend
  // ------------------------
  const fetchProducts = async () => {
    try {
      const res = await fetch("http://localhost:5001/products-with-distance", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          latitude: user.latitude,
          longitude: user.longitude,
        }),
      });

      if (!res.ok) throw new Error("Network response not ok");

      const data = await res.json();

      if (Array.isArray(data)) {
        // Sort by distance: nearest first, unknown last
        data.sort((a, b) => {
          if (a.distance === null) return 1;
          if (b.distance === null) return -1;
          return a.distance - b.distance;
        });

        setProducts(data);
      } else {
        setProducts([]);
      }
    } catch (err) {
      console.error("Failed to fetch products:", err);
      setProducts([]);
    }
  };

  // Load cart from localStorage
  const fetchCart = () => {
    const storedCart = JSON.parse(localStorage.getItem("cart")) || [];
    setCart(storedCart);
  };

  // Load notifications
  const fetchNotifications = async () => {
    try {
      const res = await fetch("http://localhost:5001/notifications");
      const data = await res.json();
      setNotifications(data || []);
    } catch (err) {
      console.error("Failed to fetch notifications:", err);
    }
  };

  // Add product to cart
  const addToCart = (product) => {
    const newCart = [...cart, product];
    setCart(newCart);
    localStorage.setItem("cart", JSON.stringify(newCart));
  };

  // Filter products based on search
  const filteredProducts = products.filter((product) =>
    product.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="min-h-screen flex bg-gray-100">
      {/* Sidebar */}
      <aside className="w-72 bg-white shadow-lg p-6 flex flex-col">
        <div className="mb-8 text-center">
          <div className="h-20 w-20 mx-auto rounded-full bg-green-500 text-white flex items-center justify-center text-3xl font-bold shadow-lg">
            {user ? user.fullname[0] : "C"}
          </div>
          <h2 className="mt-4 text-xl font-bold text-gray-800">
            {user?.fullname || "Consumer"}
          </h2>
          <p className="text-gray-500">{user?.email}</p>
          <p className="text-gray-400 text-sm mt-1">
            Member since:{" "}
            {user?.created_at
              ? new Date(user.created_at).toLocaleDateString()
              : "2025-01-01"}
          </p>
          <p className="text-gray-500 text-sm mt-2">Cart Items: {cart.length}</p>
        </div>

        <nav className="flex-1 space-y-2">
          <Link
            to="/consumer/dashboard"
            className="block text-gray-700 px-4 py-2 rounded-lg font-semibold hover:bg-gray-100 hover:shadow-md"
          >
            Products
          </Link>

          <Link
            to="/consumer/cart"
            className="block text-gray-700 px-4 py-2 rounded-lg font-semibold hover:bg-gray-100 hover:shadow-md"
          >
            Cart ({cart.length})
          </Link>

          <Link
            to="/consumer/messages"
            className="block text-gray-700 px-4 py-2 rounded-lg font-semibold hover:bg-gray-100 hover:shadow-md"
          >
            Messages
          </Link>

          <button
            className="w-full text-left px-4 py-2 rounded-lg font-semibold text-red-600 hover:bg-red-100 hover:shadow-md mt-auto"
            onClick={() => {
              localStorage.removeItem("user");
              localStorage.removeItem("cart");
              window.location.href = "/login";
            }}
          >
            Logout
          </button>
        </nav>
      </aside>

      {/* Main Content */}
      <div className="flex-1 flex flex-col">
        <header className="bg-white shadow-md p-4 flex items-center justify-between">
          <div className="text-2xl font-bold text-green-600">KisanLink</div>

          <div className="flex-1 mx-6">
            <input
              type="text"
              placeholder="Search products..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-green-500"
            />
          </div>

          {/* Top Right Icons */}
          <div className="flex items-center space-x-4">
            <Link to="/consumer/cart" className="relative">
              <ShoppingCart className="w-6 h-6 text-gray-700 cursor-pointer" />
              {cart.length > 0 && (
                <span className="absolute -top-1 -right-2 bg-red-600 text-white text-xs w-4 h-4 flex items-center justify-center rounded-full">
                  {cart.length}
                </span>
              )}
            </Link>

            <Link to="/consumer/messages" className="relative">
              <MessageCircle className="w-6 h-6 text-gray-700 cursor-pointer" />
              {notifications.length > 0 && (
                <span className="absolute -top-1 -right-2 bg-red-600 text-white text-xs w-4 h-4 flex items-center justify-center rounded-full">
                  {notifications.length}
                </span>
              )}
            </Link>

            <div className="flex items-center space-x-2 cursor-pointer">
              <User className="w-6 h-6 text-gray-700" />
              <span className="text-gray-700 font-semibold">{user?.fullname}</span>
            </div>
          </div>
        </header>

        {/* Product Grid */}
        <main className="flex-1 p-6 overflow-y-auto">
          <h2 className="text-3xl font-bold text-gray-800 mb-6">
            Available Products Near You
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {filteredProducts.length === 0 ? (
              <p className="text-gray-500 col-span-full">
                No products available nearby.
              </p>
            ) : (
              filteredProducts.map((product) => (
                <div
                  key={product.id}
                  className="bg-white p-4 rounded-lg shadow hover:shadow-lg transition"
                >
                  <img
                    src={product.image || "https://via.placeholder.com/150"}
                    alt={product.name}
                    className="h-40 w-full object-cover rounded-md mb-3"
                  />

                  <h3 className="text-lg font-semibold text-gray-800">{product.name}</h3>

                  <p className="text-green-700 font-bold mt-1">Rs {product.price}</p>

                  <p className="text-sm text-gray-600">
                    Farmer: <span className="font-semibold">{product.farmer}</span>
                  </p>

                  <p className="text-sm text-blue-600">
                    📍 {product.distance !== null ? `${product.distance} km away` : "Distance unknown"}
                  </p>

                  <button
                    className="mt-3 w-full bg-green-600 text-white py-2 rounded hover:bg-green-700 transition"
                    onClick={() => addToCart(product)}
                  >
                    Add to Cart
                  </button>
                </div>
              ))
            )}
          </div>
        </main>
      </div>
    </div>
  );
};

export default Dashboard;
