import React, { useEffect, useState } from "react";

const DELIVERY_PER_FARMER = 50;

const Cart = () => {
  const [cart, setCart] = useState([]);
  const [selectedItems, setSelectedItems] = useState({});
  const [loading, setLoading] = useState(true);

  // Fetch cart items
  const fetchCart = async () => {
    setLoading(true);
    try {
      const res = await fetch("http://localhost:5001/cart/", { credentials: "include" });
      const data = await res.json();
      setCart(data);

      // Select all by default
      const selected = {};
      data.forEach((item) => (selected[item.id] = true));
      setSelectedItems(selected);
    } catch (err) {
      console.error(err);
      setCart([]);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchCart();
  }, []);

  const toggleSelect = (id) => {
    setSelectedItems((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  const changeQuantity = async (item, delta) => {
  const newQty = item.quantity + delta;

  // Enforce min_order_qty and available_stock
  if (newQty < item.min_order_qty) return; // cannot go below min_order_qty
  if (newQty > item.available_stock) return; // cannot go above available stock

  try {
    const res = await fetch(`http://localhost:5001/cart/${item.id}`, {
      method: "PUT",
      credentials: "include",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ quantity: newQty }),
    });
    if (!res.ok) throw new Error("Failed to update quantity");

    // Update cart locally without refreshing
    setCart((prev) =>
      prev.map((cartItem) =>
        cartItem.id === item.id ? { ...cartItem, quantity: newQty } : cartItem
      )
    );
  } catch (err) {
    console.error(err);
  }
};


const removeItem = async (item) => {
  if (!window.confirm("Remove this item?")) return;

  try {
    const res = await fetch(`http://localhost:5001/cart/${item.id}`, {
      method: "DELETE",
      credentials: "include",
    });

    if (!res.ok) throw new Error("Failed to remove item");

    // Update state to remove item after successful backend deletion
    setCart((prev) => prev.filter((i) => i.id !== item.id));
    setSelectedItems((prev) => {
      const newSelected = { ...prev };
      delete newSelected[item.id];
      return newSelected;
    });
  } catch (err) {
    console.error(err);
    alert("Could not remove item. Please try again.");
  }
};

  // Group items by farmer
  const grouped = cart.reduce((acc, item) => {
    acc[item.farmer_name] = acc[item.farmer_name] || [];
    acc[item.farmer_name].push(item);
    return acc;
  }, {});

  // Calculate totals
  const selectedCart = cart.filter((i) => selectedItems[i.id]);
  const subtotal = selectedCart.reduce((sum, i) => sum + i.price * i.quantity, 0);
  const uniqueFarmers = Object.keys(grouped).filter((farmer) =>
    grouped[farmer].some((i) => selectedItems[i.id])
  );
  const shipping = uniqueFarmers.length * DELIVERY_PER_FARMER;
  const total = subtotal + shipping;

  if (loading) return <p className="p-6 text-center">Loading cart...</p>;
  if (cart.length === 0) return <p className="p-6 text-center">Your cart is empty.</p>;

  return (
    <div className="flex max-w-6xl mx-auto p-6 gap-6">
      {/* Cart items */}
      <div className="flex-1 space-y-6">
        <h2 className="text-2xl font-bold mb-4">Cart Items</h2> {/* <-- Heading added */}
        {Object.keys(grouped).map((farmer) => (
          <div key={farmer} className="bg-white p-4 rounded-xl shadow space-y-4">
            <h3 className="font-bold text-xl border-b pb-2">{farmer}</h3>
            {grouped[farmer].map((item) => (
              <div key={item.id} className="flex items-center justify-between border-b py-3">
                <input
                  type="checkbox"
                  checked={!!selectedItems[item.id]}
                  onChange={() => toggleSelect(item.id)}
                  className="mr-2"
                />
                <img
                  src={
                    item.photo_path
                      ? `http://localhost:5001/uploads/${item.photo_path}`
                      : "https://via.placeholder.com/80"
                  }
                  alt={item.item_name}
                  className="w-20 h-20 object-cover rounded"
                />
                <div className="flex-1 ml-4">
                  <p className="font-semibold">{item.item_name}</p>
                  <p className="text-gray-500">Rs {item.price} / kg</p>
                  <p className="text-gray-400 text-sm">Stock: {item.available_stock}</p>
                  <p className="text-gray-700 font-medium mt-1">Item Total: Rs {item.price * item.quantity}</p>
                </div>
                <div className="flex flex-col items-center gap-2">
                  <div className="flex items-center gap-2">
                    <button onClick={() => changeQuantity(item, -1)} className="px-2 bg-gray-200 rounded">-</button>
                    <span>{item.quantity}</span>
                    <button onClick={() => changeQuantity(item, 1)} className="px-2 bg-gray-200 rounded">+</button>
                  </div>
                  <button onClick={() => removeItem(item)} className="text-red-600 text-sm">Remove</button>
                </div>
              </div>
            ))}
          </div>
        ))}
      </div>

      {/* Order Summary */}
      <div className="w-80 bg-gray-100 p-4 rounded-xl shadow space-y-2 sticky top-6 h-fit">
        <h3 className="font-bold text-lg">Order Summary</h3>
        <p>Subtotal ({selectedCart.length} items): Rs {subtotal}</p>
        <p>Shipping Fee: Rs {shipping}</p>
        <p className="font-bold text-xl">Total: Rs {total}</p>
        <button className="w-full bg-green-600 text-white py-2 rounded hover:bg-green-700 transition">
          Proceed to Checkout ({selectedCart.length})
        </button>
      </div>
    </div>
  );
};

export default Cart;
