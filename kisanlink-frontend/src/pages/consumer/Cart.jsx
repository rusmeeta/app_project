import React, { useEffect, useState } from "react";

const Cart = () => {
  const [cart, setCart] = useState([]);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const DELIVERY_CHARGE_PER_ITEM = 50;

  const fetchCart = async () => {
    try {
      const res = await fetch("http://localhost:5001/cart/", {
        credentials: "include",
      });
      if (!res.ok) throw new Error("Failed to fetch cart");
      const data = await res.json();
      setCart(data);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchCart();
  }, []);

  const changeQuantity = async (itemId, delta) => {
    const item = cart.find(c => c.id === itemId);
    if (!item) return;
    const newQty = item.quantity + delta;
    if (newQty < 1 || newQty > item.available_stock) return;

    try {
      await fetch(`http://localhost:5001/cart/${itemId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ quantity: newQty }),
      });
      fetchCart();
    } catch (err) {
      console.error(err);
    }
  };

  const removeItem = async (itemId) => {
    try {
      await fetch(`http://localhost:5001/cart/${itemId}`, {
        method: "DELETE",
        credentials: "include",
      });
      fetchCart();
    } catch (err) {
      console.error(err);
    }
  };

  const handleCheckout = async () => {
    try {
      await fetch("http://localhost:5001/cart/checkout", {
        method: "POST",
        credentials: "include",
      });
      setCart([]);
      setShowConfirmModal(false);
      alert("Order placed successfully!");
    } catch (err) {
      console.error(err);
    }
  };

  const totalPrice =
    cart.reduce((sum, item) => sum + (item.price || 0) * item.quantity, 0) +
    DELIVERY_CHARGE_PER_ITEM * cart.length;

  if (cart.length === 0)
    return (
      <div className="p-6 text-center mt-10">
        <h2 className="text-3xl font-semibold text-gray-700 mb-4">Your cart is empty</h2>
        <p className="text-gray-500">Browse items and add your favorite products!</p>
      </div>
    );

  return (
    <div className="max-w-4xl mx-auto p-6">
      <h2 className="text-3xl font-bold mb-6 text-gray-800">🛒 My Cart</h2>
      {cart.map((item) => (
        <div key={item.id} className="flex justify-between items-center bg-white p-4 rounded-xl shadow-md mb-4">
          <div className="flex gap-4 items-center">
            {item.photo_path ? (
              <img src={`http://localhost:5001/uploads/${item.photo_path}`} className="w-16 h-16 rounded" />
            ) : <div className="w-16 h-16 bg-gray-200 flex items-center justify-center text-gray-500">No Image</div>}
            <div>
              <p className="font-semibold">{item.item_name}</p>
              <p className="text-sm text-gray-500">Farmer: {item.farmer_name || "Unknown"}</p>
              <p className="text-green-700">Rs {item.price} / kg</p>
              <p className="text-xs text-gray-400">Stock: {item.available_stock}</p>
              <p className="font-semibold">Item Total: Rs {item.price * item.quantity}</p>
            </div>
          </div>
          <div className="flex flex-col items-end gap-2">
            <div className="flex items-center gap-2">
              <button onClick={() => changeQuantity(item.id, -1)} className="px-2 py-1 bg-gray-200 rounded">-</button>
              <span>{item.quantity}</span>
              <button onClick={() => changeQuantity(item.id, 1)} className="px-2 py-1 bg-gray-200 rounded">+</button>
            </div>
            <button onClick={() => removeItem(item.id)} className="text-red-600 text-sm">Remove</button>
          </div>
        </div>
      ))}

      <div className="mt-6 p-4 bg-gray-100 rounded-xl flex justify-between items-center">
        <div>
          <p>Delivery: Rs {DELIVERY_CHARGE_PER_ITEM * cart.length}</p>
          <p className="font-bold">Grand Total: Rs {totalPrice}</p>
        </div>
        <button onClick={() => setShowConfirmModal(true)} className="bg-green-600 text-white px-4 py-2 rounded">Checkout</button>
      </div>

      {showConfirmModal && (
        <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center">
          <div className="bg-white p-6 rounded-xl shadow-lg">
            <p className="mb-4">Grand Total: Rs {totalPrice}</p>
            <div className="flex gap-4 justify-end">
              <button onClick={() => setShowConfirmModal(false)} className="px-4 py-2 bg-gray-200 rounded">Cancel</button>
              <button onClick={handleCheckout} className="px-4 py-2 bg-green-600 text-white rounded">Confirm</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Cart;
