import React, { useState, useEffect } from "react";

const Cart = () => {
  const [cart, setCart] = useState([]);

  useEffect(() => {
    const storedCart = JSON.parse(localStorage.getItem("cart")) || [];
    setCart(storedCart);
  }, []);

  const removeItem = (index) => {
    const newCart = cart.filter((_, i) => i !== index);
    setCart(newCart);
    localStorage.setItem("cart", JSON.stringify(newCart));
  };

  const totalPrice = cart.reduce((sum, item) => sum + item.price, 0);

  const checkout = () => {
    alert("Order placed successfully!");
    localStorage.removeItem("cart");
    setCart([]);
  };

  if (cart.length === 0) return <p className="text-gray-500 mt-4">Your cart is empty.</p>;

  return (
    <div className="p-6">
      <h2 className="text-3xl font-bold mb-6">My Cart</h2>
      <div className="space-y-4">
        {cart.map((item, index) => (
          <div key={index} className="flex justify-between items-center bg-white p-4 rounded shadow">
            <div>
              <p className="font-semibold">{item.name}</p>
              <p className="text-green-700 font-bold">Rs {item.price}</p>
            </div>
            <button
              className="bg-red-600 text-white px-3 py-1 rounded hover:bg-red-700 transition"
              onClick={() => removeItem(index)}
            >
              Remove
            </button>
          </div>
        ))}
      </div>
      <div className="mt-6 flex justify-between items-center">
        <p className="text-xl font-bold">Total: Rs {totalPrice}</p>
        <button
          className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700 transition"
          onClick={checkout}
        >
          Checkout
        </button>
      </div>
    </div>
  );
};

export default Cart;
