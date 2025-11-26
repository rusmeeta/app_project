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
      const res = await fetch("http://localhost:5001/cart/", {
        credentials: "include",
      });
      if (!res.ok) throw new Error("Failed to fetch cart");
      const data = await res.json();

      const updatedData = data.map((item) => ({
        ...item,
        farmer_name: item.farmer_name || "Unknown",
      }));

      setCart(updatedData);

      // By default select all items
      const initialSelected = {};
      updatedData.forEach((item) => {
        initialSelected[item.id] = true;
      });
      setSelectedItems(initialSelected);
    } catch (err) {
      console.error(err);
      setCart([]);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchCart();
  }, []);

  // Toggle selection
  const toggleSelect = (itemId) => {
    setSelectedItems((prev) => ({
      ...prev,
      [itemId]: !prev[itemId],
    }));
  };

  // Change quantity
  const changeQuantity = async (item, delta) => {
    const newQty = item.quantity + delta;
    if (newQty < 1 || newQty > item.available_stock) return;

    try {
      await fetch(`http://localhost:5001/cart/${item.id}`, {
        method: "PUT",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ quantity: newQty }),
      });
      fetchCart();
    } catch (err) {
      console.error(err);
    }
  };

  // Remove item
  const removeItem = async (item) => {
    if (!window.confirm("Remove this item?")) return;
    try {
      await fetch(`http://localhost:5001/cart/${item.id}`, {
        method: "DELETE",
        credentials: "include",
      });
      fetchCart();
    } catch (err) {
      console.error(err);
    }
  };

  // Group items by farmer
  const groupedByFarmer = cart.reduce((acc, item) => {
    const farmerName = item.farmer_name;
    if (!acc[farmerName]) acc[farmerName] = [];
    acc[farmerName].push(item);
    return acc;
  }, {});

  // Calculate totals only for selected items
  const selectedCart = cart.filter((item) => selectedItems[item.id]);
  const subtotal = selectedCart.reduce((sum, i) => sum + i.price * i.quantity, 0);

  // Calculate unique farmers for selected items
  const uniqueSelectedFarmers = [
    ...new Set(selectedCart.map((i) => i.farmer_name)),
  ];
  const shipping = uniqueSelectedFarmers.length * DELIVERY_PER_FARMER;
  const total = subtotal + shipping;

  if (loading) return <p className="p-6 text-center">Loading cart...</p>;
  if (cart.length === 0) return <p className="p-6 text-center">Your cart is empty.</p>;

  return (
    <div className="max-w-7xl mx-auto p-6 flex gap-6">
      {/* Left: Cart Items */}
      <div className="flex-1 space-y-6">
        {Object.keys(groupedByFarmer).map((farmer) => {
          const items = groupedByFarmer[farmer];

          return (
            <div key={farmer} className="bg-white p-4 rounded-xl shadow space-y-4">
              <h3 className="font-bold text-xl border-b pb-2">{farmer}</h3>

              {items.map((item) => (
                <div
                  key={item.id}
                  className="flex items-center justify-between border-b py-3"
                >
                  {/* Select Checkbox */}
                  <input
                    type="checkbox"
                    checked={!!selectedItems[item.id]}
                    onChange={() => toggleSelect(item.id)}
                    className="mr-2"
                  />

                  {/* Product Image */}
                  <img
                    src={
                      item.photo_path
                        ? `http://localhost:5001/uploads/${item.photo_path}`
                        : "https://via.placeholder.com/80"
                    }
                    alt={item.item_name}
                    className="w-20 h-20 object-cover rounded"
                  />

                  {/* Product Info */}
                  <div className="flex-1 ml-4">
                    <p className="font-semibold">{item.item_name}</p>
                    <p className="text-gray-500">Rs {item.price} / kg</p>
                    <p className="text-gray-400 text-sm">
                      Stock: {item.available_stock}
                    </p>
                    <p className="text-gray-700 font-medium mt-1">
                      Item Total: Rs {item.price * item.quantity}
                    </p>
                  </div>

                  {/* Quantity & Remove */}
                  <div className="flex flex-col items-center gap-2">
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => changeQuantity(item, -1)}
                        className="px-2 bg-gray-200 rounded"
                      >
                        -
                      </button>
                      <span>{item.quantity}</span>
                      <button
                        onClick={() => changeQuantity(item, 1)}
                        className="px-2 bg-gray-200 rounded"
                      >
                        +
                      </button>
                    </div>
                    <button
                      onClick={() => removeItem(item)}
                      className="text-red-600 text-sm"
                    >
                      Remove
                    </button>
                  </div>
                </div>
              ))}

              {/* Farmer Delivery */}
              <div className="text-right font-semibold">
                Delivery Fee: Rs{" "}
                {items.some((i) => selectedItems[i.id]) ? DELIVERY_PER_FARMER : 0}
              </div>
            </div>
          );
        })}
      </div>

      {/* Right: Sticky Order Summary */}
      <div className="w-80 sticky top-6 self-start h-fit">
        <div className="bg-gray-100 p-4 rounded-xl shadow space-y-2">
          <h3 className="font-bold text-lg">Order Summary</h3>
          <p>Subtotal ({selectedCart.length} items): Rs {subtotal}</p>
          <p>Shipping Fee: Rs {shipping}</p>
          <p className="font-bold text-xl">Total: Rs {total}</p>
          <button className="w-full bg-green-600 text-white py-2 rounded hover:bg-green-700 transition">
            Proceed to Checkout ({selectedCart.length})
          </button>
        </div>
      </div>
    </div>
  );
};

export default Cart;
