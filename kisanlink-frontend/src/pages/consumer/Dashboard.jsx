import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { User, ShoppingCart, MessageCircle } from "lucide-react";

const Dashboard = () => {
  const [user, setUser] = useState(null);
  const [products, setProducts] = useState([]);
  const [cart, setCart] = useState([]);
  const [toast, setToast] = useState("");

  // -----------------------------
  // Fetch logged-in user from API
  // -----------------------------
  useEffect(() => {
    const fetchUser = async () => {
      try {
        const res = await fetch("http://localhost:5001/auth/me", {
          credentials: "include",
        });
        if (!res.ok) throw new Error("User not authenticated");
        const data = await res.json();
        setUser(data);
      } catch (err) {
        console.error(err);
        window.location.href = "/login"; // redirect to login if not authenticated
      }
    };
    fetchUser();
  }, []);

  // -----------------------------
  // Fetch products from API
  // -----------------------------
  useEffect(() => {
    if (!user) return;

    const fetchProducts = async () => {
      try {
        const res = await fetch("http://localhost:5001/products/farmer-items", {
          credentials: "include",
        });
        if (!res.ok) throw new Error("Failed to fetch products");
        const data = await res.json();

        // Calculate distance safely
        const withDistance = data.map((item) => {
          const uLat = parseFloat(user.latitude);
          const uLon = parseFloat(user.longitude);
          const fLat = parseFloat(item.farmer_lat);
          const fLon = parseFloat(item.farmer_lon);

          const distance =
            !isNaN(uLat) && !isNaN(uLon) && !isNaN(fLat) && !isNaN(fLon)
              ? getDistanceFromLatLonInKm(uLat, uLon, fLat, fLon).toFixed(2)
              : null;

          return { ...item, distance };
        });

        // Sort products by distance, null distances go to the end
        withDistance.sort((a, b) =>
          a.distance !== null && b.distance !== null
            ? a.distance - b.distance
            : a.distance === null
            ? 1
            : -1
        );

        setProducts(withDistance);
      } catch (err) {
        console.error(err);
        setProducts([]);
      }
    };

    fetchProducts();
  }, [user]);

  // -----------------------------
  // Load cart from state (or API later)
  // -----------------------------
  useEffect(() => {
    setCart([]);
  }, []);

  const addToCart = (product) => {
    const newCart = [...cart, product];
    setCart(newCart);
    setToast(`"${product.item_name}" added to cart`);
    setTimeout(() => setToast(""), 2000);
  };

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
      <aside className="w-64 bg-white shadow-lg p-6 flex flex-col">
        <div className="mb-8 text-center">
          <div className="h-20 w-20 mx-auto rounded-full bg-green-500 text-white flex items-center justify-center text-3xl font-bold shadow-lg">
            {user ? user.fullname[0] : "C"}
          </div>
          <h2 className="mt-4 text-xl font-bold text-gray-800">{user?.fullname || "Consumer"}</h2>
          <p className="text-gray-500">{user?.email || "user@example.com"}</p>
          <p className="text-gray-400 text-sm mt-1">
            Location: {user?.location || "N/A"}
          </p>
          <p className="text-gray-500 text-sm mt-2">Cart Items: {cart.length}</p>
        </div>

        <nav className="flex-1 space-y-2">
          <Link className="block text-gray-700 px-4 py-2 rounded-lg font-semibold hover:bg-gray-100 hover:shadow-md transition">Products</Link>
          <Link className="block text-gray-700 px-4 py-2 rounded-lg font-semibold hover:bg-gray-100 hover:shadow-md transition">Cart ({cart.length})</Link>
          <Link className="block text-gray-700 px-4 py-2 rounded-lg font-semibold hover:bg-gray-100 hover:shadow-md transition">Messages</Link>
          <button
            className="w-full text-left px-4 py-2 rounded-lg font-semibold text-red-600 hover:bg-red-100 hover:shadow-md mt-auto transition"
            onClick={async () => {
              await fetch("http://localhost:5001/auth/logout", {
                method: "POST",
                credentials: "include",
              });
              window.location.href = "/login";
            }}
          >
            Logout
          </button>
        </nav>
      </aside>

      {/* Main Content */}
      <div className="flex-1 flex flex-col relative">
        {toast && (
          <div className="fixed top-5 right-5 bg-green-600 text-white px-4 py-2 rounded shadow-lg z-50 animate-slide-in">
            {toast}
          </div>
        )}

        <header className="bg-white shadow-md p-4 flex items-center justify-between">
          <div className="text-2xl font-bold text-green-600">KisanLink</div>
          <div className="flex-1 mx-6">
            <input
              type="text"
              placeholder="Search products..."
              className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-green-500"
            />
          </div>
          <div className="flex items-center space-x-4">
            <Link className="relative">
              <ShoppingCart className="w-6 h-6 text-gray-700 cursor-pointer" />
              {cart.length > 0 && (
                <span className="absolute -top-1 -right-2 bg-red-600 text-white text-xs w-4 h-4 flex items-center justify-center rounded-full">
                  {cart.length}
                </span>
              )}
            </Link>
            <Link className="relative">
              <MessageCircle className="w-6 h-6 text-gray-700 cursor-pointer" />
            </Link>
            <div className="flex items-center space-x-2 cursor-pointer">
              <User className="w-6 h-6 text-gray-700" />
              <span className="text-gray-700 font-semibold">{user?.fullname}</span>
            </div>
          </div>
        </header>

        <main className="flex-1 p-6 overflow-y-auto">
          <h2 className="text-2xl font-bold text-gray-800 mb-6">Available Products Near You</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {products.length === 0 ? (
              <p className="text-gray-500 col-span-full">No products available nearby.</p>
            ) : (
              products.map((product) => (
                <ProductCard key={product.id} product={product} addToCart={addToCart} />
              ))
            )}
          </div>
        </main>
      </div>
    </div>
  );
};

// Product Card
const ProductCard = ({ product, addToCart }) => {
  const [quantity, setQuantity] = React.useState(product.min_order_qty || 1);

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
    <div className="bg-white rounded-2xl shadow-lg hover:shadow-xl hover:scale-105 transform transition duration-300 overflow-hidden relative group">
      <div className="relative h-40">
        <img
          src={product.photo_path ? `http://localhost:5001/uploads/${product.photo_path}` : "https://via.placeholder.com/150"}
          alt={product.item_name}
          className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-110"
        />
        {product.available_stock <= 5 && (
          <span className="absolute top-2 left-2 bg-red-600 text-white text-xs px-2 py-1 rounded-full font-semibold shadow-lg">
            Low Stock
          </span>
        )}
      </div>
      <div className="p-4 flex-1 flex flex-col justify-between">
        <h3 className="text-lg font-bold text-gray-800 truncate">{product.item_name}</h3>
        <p className="text-sm text-gray-600 truncate">Farmer: <span className="font-semibold">{product.farmer_name}</span></p>
        <p className="text-xs text-gray-500 mb-1 truncate">Location: <span className="font-semibold">{product.location || "N/A"}</span></p>
        <p className="text-xs text-gray-500 mb-2">Distance: {product.distance ? `${product.distance} km` : "Not available"}</p>

        <div className="flex items-center justify-between mb-2">
          <p className="text-green-600 font-bold text-sm">Rs {product.price} / kg</p>
          <p className="text-xs text-gray-500">Stock: {product.available_stock}</p>
        </div>

        <div className="flex items-center justify-between">
          <input
            type="number"
            min={product.min_order_qty || 1}
            max={product.available_stock}
            value={quantity}
            onChange={handleQuantityChange}
            className="w-16 border border-gray-300 rounded px-2 py-1 text-sm focus:outline-none focus:ring-1 focus:ring-green-500"
          />
          <button
            onClick={handleAddToCart}
            className="bg-green-600 text-white text-sm font-semibold py-1 px-3 rounded hover:bg-green-700 transition"
          >
            Add
          </button>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
