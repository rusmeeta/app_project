import React, { useState, useEffect } from "react";

const Cart = () => {
  const [cart, setCart] = useState([]);
  const [showConfirmModal, setShowConfirmModal] = useState(false);

  const DELIVERY_CHARGE_PER_ITEM = 50; // flat delivery rate per item

  useEffect(() => {
    const storedCart = JSON.parse(localStorage.getItem("cart")) || [];
    setCart(storedCart);
  }, []);

  const updateCart = (newCart) => {
    setCart(newCart);
    localStorage.setItem("cart", JSON.stringify(newCart));
  };

  const removeItem = (index) => {
    const newCart = cart.filter((_, i) => i !== index);
    updateCart(newCart);
  };

  const changeQuantity = (index, delta) => {
    const item = cart[index];
    const newQty = (item.quantity || item.min_order_qty) + delta;

    if (newQty < item.min_order_qty) return;
    if (newQty > item.available_stock) return;

    const newCart = cart.map((c, i) =>
      i === index ? { ...c, quantity: newQty } : c
    );
    updateCart(newCart);
  };

  const totalPrice =
    cart.reduce((sum, item) => sum + (item.price || 0) * (item.quantity || item.min_order_qty), 0) +
    DELIVERY_CHARGE_PER_ITEM * cart.length;

  const handleCheckout = () => setShowConfirmModal(true);

  const confirmCheckout = () => {
    alert("Order placed successfully!");
    localStorage.removeItem("cart");
    setCart([]);
    setShowConfirmModal(false);
  };

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

      <div className="space-y-4">
        {cart.map((item, index) => {
          const qty = item.quantity || item.min_order_qty;
          const itemTotal = item.price * qty;
          return (
            <div
              key={index}
              className="flex items-center justify-between bg-white rounded-xl shadow-md p-4 hover:shadow-lg transition"
            >
              <div className="flex items-center gap-4">
                {item.photo_path ? (
                  <img
                    src={`http://localhost:5001/uploads/${item.photo_path}`}
                    alt={item.item_name}
                    className="w-16 h-16 object-cover rounded-lg shadow"
                  />
                ) : (
                  <div className="w-16 h-16 bg-gray-200 rounded-lg flex items-center justify-center text-gray-500">
                    No Image
                  </div>
                )}

                <div>
                  <p className="text-lg font-semibold text-gray-800">{item.item_name}</p>
                  <p className="text-sm text-gray-600">
                    Farmer: {item.farmer_name || "Unknown"}
                  </p>
                  <p className="text-green-700 font-bold">Rs {item.price} / kg</p>
                  <p className="text-xs text-gray-400">
                    Min: {item.min_order_qty} | Stock: {item.available_stock}
                  </p>
                  <p className="text-gray-700 font-semibold mt-1">
                    Item Total: Rs {itemTotal}
                  </p>
                </div>
              </div>

              <div className="flex flex-col items-end gap-2">
                {/* Quantity */}
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => changeQuantity(index, -1)}
                    className="bg-gray-200 px-2 py-1 rounded hover:bg-gray-300 transition"
                  >
                    -
                  </button>
                  <span className="w-6 text-center">{qty}</span>
                  <button
                    onClick={() => changeQuantity(index, 1)}
                    className="bg-gray-200 px-2 py-1 rounded hover:bg-gray-300 transition"
                  >
                    +
                  </button>
                </div>

                <button
                  onClick={() => removeItem(index)}
                  className="text-red-600 hover:underline text-sm"
                >
                  Remove
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* Total & Checkout */}
      <div className="mt-8 p-4 bg-gray-100 rounded-xl flex justify-between items-center shadow-inner">
        <div>
          <p className="text-gray-600 text-sm">
            Delivery: Rs {DELIVERY_CHARGE_PER_ITEM * cart.length}
          </p>
          <p className="text-xl font-bold text-gray-800">Grand Total: Rs {totalPrice}</p>
        </div>
        <button
          onClick={handleCheckout}
          className="bg-green-600 text-white px-6 py-2 rounded-xl hover:bg-green-700 transition shadow-md"
        >
          Checkout
        </button>
      </div>

      {/* Confirm Modal */}
      {showConfirmModal && (
        <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-6 w-96 shadow-lg">
            <h3 className="text-xl font-bold mb-4">Confirm Your Order</h3>
            <p className="text-gray-700 mb-4">
              Grand Total: <span className="font-semibold">Rs {totalPrice}</span>
            </p>
            <div className="flex justify-end gap-4">
              <button
                onClick={() => setShowConfirmModal(false)}
                className="px-4 py-2 rounded bg-gray-200 hover:bg-gray-300 transition"
              >
                Cancel
              </button>
              <button
                onClick={confirmCheckout}
                className="px-4 py-2 rounded bg-green-600 text-white hover:bg-green-700 transition"
              >
                Confirm
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Cart;
