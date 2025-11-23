import React, { useState, useEffect } from "react";
import axios from "axios";

/**
 * AddProduct component:
 * Allows farmers to add products directly tied to their backend session.
 */
const AddProduct = () => {
  const [form, setForm] = useState({
    item_name: "",
    price: "",
    location: "",
    min_order_qty: 1,
    available_stock: 1,
  });

  const [photo, setPhoto] = useState(null);
  const [preview, setPreview] = useState(null);
  const [message, setMessage] = useState("");

  // Get farmer info from backend session
  const [farmer, setFarmer] = useState(null);

  useEffect(() => {
    const fetchFarmer = async () => {
      try {
        const res = await axios.get("http://localhost:5001/farmer/me", {
          withCredentials: true,
        });
        setFarmer(res.data);
      } catch (err) {
        console.error("Error fetching farmer info:", err);
      }
    };
    fetchFarmer();
  }, []);

  // Preview image before upload
  const handlePhotoChange = (e) => {
    const file = e.target.files[0];
    setPhoto(file);
    setPreview(file ? URL.createObjectURL(file) : null);
  };

  // Update form state
  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  // Submit new product to backend
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!farmer) {
      alert("Unable to fetch farmer info. Try reloading the page.");
      return;
    }
    if (!photo) {
      alert("Please select a product image");
      return;
    }

    try {
      const formData = new FormData();
      formData.append("item_name", form.item_name);
      formData.append("price", form.price);
      formData.append("location", form.location); // free-text location
      formData.append("min_order_qty", form.min_order_qty);
      formData.append("available_stock", form.available_stock);
      formData.append("photo", photo);

      const res = await axios.post(
        "http://localhost:5001/farmer/add-product",
        formData,
        { headers: { "Content-Type": "multipart/form-data" }, withCredentials: true }
      );

      setMessage(res.data.message);

      // Reset form
      setForm({
        item_name: "",
        price: "",
        location: "",
        min_order_qty: 1,
        available_stock: 1,
      });
      setPhoto(null);
      setPreview(null);

    } catch (err) {
      console.error(err);
      setMessage(err.response?.data?.error || "Failed to add product");
    }
  };

  return (
    <div className="max-w-3xl mx-auto bg-white p-6 rounded-xl shadow-md">
      <h2 className="text-2xl font-bold text-green-700 mb-4">Add New Product</h2>
      {message && <p className="text-green-600 font-semibold mb-4">{message}</p>}

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block font-semibold text-gray-700 mb-1">Product Name</label>
          <input
            type="text"
            name="item_name"
            value={form.item_name}
            onChange={handleChange}
            required
            placeholder="Enter product name"
            className="w-full border rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-500"
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block font-semibold text-gray-700 mb-1">Price (Rs / kg)</label>
            <input
              type="number"
              name="price"
              value={form.price}
              onChange={handleChange}
              required
              placeholder="0.0"
              className="w-full border rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-500"
            />
          </div>

          <div>
            <label className="block font-semibold text-gray-700 mb-1">Location</label>
            {/* Free-text input for specific location */}
            <input
              type="text"
              name="location"
              value={form.location}
              onChange={handleChange}
              required
              placeholder="e.g., Gatthaghar near BigMart"
              className="w-full border rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-500"
            />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block font-semibold text-gray-700 mb-1">Min Order Qty</label>
            <input
              type="number"
              name="min_order_qty"
              value={form.min_order_qty}
              min={1}
              onChange={handleChange}
              className="w-full border rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-500"
            />
          </div>

          <div>
            <label className="block font-semibold text-gray-700 mb-1">Available Stock</label>
            <input
              type="number"
              name="available_stock"
              value={form.available_stock}
              min={1}
              onChange={handleChange}
              className="w-full border rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-500"
            />
          </div>
        </div>

        <div>
          <label className="block font-semibold text-gray-700 mb-1">Product Image</label>
          <input type="file" onChange={handlePhotoChange} accept="image/*" className="mb-2" />
          {preview && (
            <img
              src={preview}
              alt="preview"
              className="w-32 h-32 object-cover rounded shadow"
            />
          )}
        </div>

        <button
          type="submit"
          className="bg-green-600 text-white font-bold px-6 py-2 rounded hover:bg-green-700 transition"
        >
          Add Product
        </button>
      </form>
    </div>
  );
};

export default AddProduct;
