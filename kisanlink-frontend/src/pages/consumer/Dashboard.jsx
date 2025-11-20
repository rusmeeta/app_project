// src/pages/consumer/Dashboard.jsx
import React, { useEffect, useState, useCallback } from "react";
import { Link } from "react-router-dom";
import { User, ShoppingCart, MessageCircle } from "lucide-react";

const Dashboard = () => {
  const [user, setUser] = useState(null);
  const [products, setProducts] = useState([]);
  const [cart, setCart] = useState([]);
  const [notifications, setNotifications] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [toast, setToast] = useState(""); // Toast message

  // Load user from localStorage
  useEffect(() => {
    const storedUser = localStorage.getItem("user");
    if (storedUser) setUser(JSON.parse(storedUser));
  }, []);

  // Fetch products from backend
  const fetchProducts = useCallback(async () => {
    if (!user) return;

    try {
      const res = await fetch("http://localhost:5001/products/farmer-items");
      if (!res.ok) throw new Error(`Server error: ${res.status}`);
      const data = await res.json();

      const withDistance = data.map((item) => ({
        ...item,
        distance:
          user.latitude &&
          user.longitude &&
          item.latitude &&
          item.longitude
            ? getDistanceFromLatLonInKm(
                parseFloat(user.latitude),
                parseFloat(user.longitude),
                parseFloat(item.latitude),
                parseFloat(item.longitude)
              ).toFixed(2)
            : null,
      }));

      withDistance.sort(
        (a, b) => (a.distance ?? Infinity) - (b.distance ?? Infinity)
      );
      setProducts(withDistance);
    } catch (err) {
      console.error("Failed to fetch products:", err);
      setProducts([]);
    }
  }, [user]);

  // Load cart from localStorage
  const fetchCart = () => {
    const storedCart = JSON.parse(localStorage.getItem("cart")) || [];
    setCart(storedCart);
  };

  // Fetch notifications
  const fetchNotifications = async () => {
    try {
      const res = await fetch("http://localhost:5001/notifications");
      if (!res.ok) return setNotifications([]);
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

    // Show toast
    setToast(`"${product.item_name}" added to cart`);
    setTimeout(() => setToast(""), 2000); // Hide after 2s
  };

  useEffect(() => {
    if (user) {
      fetchProducts();
      fetchCart();
      fetchNotifications();
    }
  }, [user, fetchProducts]);

  const filteredProducts = products.filter((product) =>
    product.item_name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getDistanceFromLatLonInKm = (lat1, lon1, lat2, lon2) => {
    const deg2rad = (deg) => deg * (Math.PI / 180);
    const R = 6371;
    const dLat = deg2rad(lat2 - lat1);
    const dLon = deg2rad(lon2 - lon1);
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(deg2rad(lat1)) *
        Math.cos(deg2rad(lat2)) *
        Math.sin(dLon / 2) *
        Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
  };

  return (
    <div className="min-h-screen flex bg-gray-100">
      {/* Sidebar */}
      <aside className="w-50 bg-white shadow-lg p-6 flex flex-col">
        <div className="mb-8 text-center">
          <div className="h-20 w-20 mx-auto rounded-full bg-green-500 text-white flex items-center justify-center text-3xl font-bold shadow-lg">
            {user ? user.fullname[0] : "C"}
          </div>
          <h2 className="mt-4 text-xl font-bold text-gray-800">{user?.fullname || "Consumer"}</h2>
          <p className="text-gray-500">{user?.email}</p>
          <p className="text-gray-400 text-sm mt-1">
            Member since: {user?.created_at ? new Date(user.created_at).toLocaleDateString() : "2025-01-01"}
          </p>
          <p className="text-gray-500 text-sm mt-2">Cart Items: {cart.length}</p>
        </div>

        <nav className="flex-1 space-y-2">
          <Link to="/consumer/dashboard" className="block text-gray-700 px-4 py-2 rounded-lg font-semibold hover:bg-gray-100 hover:shadow-md">Products</Link>
          <Link to="/consumer/cart" className="block text-gray-700 px-4 py-2 rounded-lg font-semibold hover:bg-gray-100 hover:shadow-md">Cart ({cart.length})</Link>
          <Link to="/consumer/messages" className="block text-gray-700 px-4 py-2 rounded-lg font-semibold hover:bg-gray-100 hover:shadow-md">Messages</Link>
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
      <div className="flex-1 flex flex-col relative">
        {/* Toast Notification */}
        {toast && (
          <div className="fixed top-5 right-5 bg-green-600 text-white px-4 py-2 rounded shadow-lg z-50 animate-slide-in">
            {toast}
          </div>
        )}

        <header className="bg-white shadow-md p-3 flex items-center justify-between">
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
          <div className="flex items-center space-x-4">
            <Link to="/consumer/cart" className="relative">
              <ShoppingCart className="w-6 h-6 text-gray-700 cursor-pointer" />
              {cart.length > 0 && <span className="absolute -top-1 -right-2 bg-red-600 text-white text-xs w-4 h-4 flex items-center justify-center rounded-full">{cart.length}</span>}
            </Link>
            <Link to="/consumer/messages" className="relative">
              <MessageCircle className="w-6 h-6 text-gray-700 cursor-pointer" />
              {notifications.length > 0 && <span className="absolute -top-1 -right-2 bg-red-600 text-white text-xs w-4 h-4 flex items-center justify-center rounded-full">{notifications.length}</span>}
            </Link>
            <div className="flex items-center space-x-2 cursor-pointer">
              <User className="w-6 h-6 text-gray-700" />
              <span className="text-gray-700 font-semibold">{user?.fullname}</span>
            </div>
          </div>
        </header>

        {/* Product Grid */}
        <main className="flex-1 p-6 overflow-y-auto">
          <h2 className="text-2xl font-bold text-gray-800 mb-6">Available Products Near You</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {filteredProducts.length === 0 ? (
              <p className="text-gray-500 col-span-full">No products available nearby.</p>
            ) : (
              filteredProducts.map((product) => (
                <ProductCard key={product.id} product={product} addToCart={addToCart} />
              ))
            )}
          </div>
        </main>
      </div>
    </div>
  );
};

// Product Card component
const ProductCard = ({ product, addToCart }) => {
  const [quantity, setQuantity] = useState(product.min_order_qty || 1);

  const handleQuantityChange = (e) => {
    let val = Number(e.target.value);
    if (val < product.min_order_qty) val = product.min_order_qty;
    if (val > product.available_stock) val = product.available_stock;
    setQuantity(val);
  };

  const handleAddToCart = () => {
    if (quantity > product.available_stock) {
      alert(`Cannot order more than available stock (${product.available_stock})`);
      return;
    }
    addToCart({ ...product, quantity });
  };

  return (
    <div className="bg-white rounded-xl shadow-md hover:shadow-lg hover:scale-105 transform transition duration-200 flex flex-col overflow-hidden relative">
      <img
        src={product.photo_path ? `http://localhost:5001/uploads/${product.photo_path}` : "https://via.placeholder.com/150"}
        alt={product.item_name}
        className="h-32 w-full object-cover"
      />
      {product.available_stock <= 5 && (
        <span className="absolute top-2 left-2 bg-red-600 text-white text-xs px-2 py-1 rounded-full font-semibold">
          Low Stock
        </span>
      )}
      <div className="p-3 flex-1 flex flex-col justify-between">
        <h3 className="text-md font-semibold text-gray-800 truncate">{product.item_name}</h3>
        <p className="text-xs text-gray-600 truncate">
          Farmer: <span className="font-semibold">{product.farmer_name}</span> (ID: {product.farmer_id})
        </p>
        <p className="text-xs text-gray-500 mb-1 truncate">
          Location: <span className="font-semibold">{product.location || "N/A"}</span>
        </p>
        <div className="flex items-center justify-between mb-2">
          <p className="text-green-600 font-bold text-sm">Rs {product.price} per kg</p>
          <p className="text-xs text-gray-500">Stock: {product.available_stock}</p>
        </div>
        <div className="flex items-center justify-between">
          <input
            type="number"
            min={product.min_order_qty || 1}
            max={product.available_stock}
            value={quantity}
            onChange={handleQuantityChange}
            className="w-16 border border-gray-300 rounded px-1 py-1 text-xs focus:outline-none focus:ring-1 focus:ring-green-500"
          />
          <button
            onClick={handleAddToCart}
            className="bg-green-600 text-white text-xs font-semibold py-1 px-2 rounded hover:bg-green-700 transition"
          >
            Add
          </button>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
