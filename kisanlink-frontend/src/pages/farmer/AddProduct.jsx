import React, { useState } from "react";

const AddProduct = () => {
  const [formData, setFormData] = useState({
    name: "",
    price: "",
    description: "",
  });
  const [message, setMessage] = useState("");

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage("");

    try {
      const res = await fetch("http://localhost:5001/farmer/add-product", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });
      const data = await res.json();

      if (data.status === "success") {
        setMessage("Product added successfully!");
        setFormData({ name: "", price: "", description: "" }); // reset form
      } else {
        setMessage(data.message || "Failed to add product");
      }
    } catch (err) {
      console.error(err);
      setMessage("Server error, try again later.");
    }
  };

  return (
    <div className="flex justify-center items-center min-h-screen bg-green-50 px-4">
      <div className="max-w-md w-full bg-white rounded-lg shadow-md p-8">
        <h2 className="text-3xl font-bold text-green-700 mb-6 text-center">
          Add Product
        </h2>

        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="block text-sm font-semibold text-gray-700">
              Product Name
            </label>
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleChange}
              required
              className="mt-1 w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-500"
              placeholder="Enter product name"
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700">
              Price
            </label>
            <input
              type="number"
              name="price"
              value={formData.price}
              onChange={handleChange}
              required
              className="mt-1 w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-500"
              placeholder="Enter price"
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700">
              Description
            </label>
            <textarea
              name="description"
              value={formData.description}
              onChange={handleChange}
              className="mt-1 w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-500"
              placeholder="Enter description"
            />
          </div>

          <button
            type="submit"
            className="w-full bg-green-600 text-white font-semibold py-3 rounded-md hover:bg-green-700 transition"
          >
            Add Product
          </button>
        </form>

        {message && (
          <p className="mt-4 text-center text-green-600 font-semibold">{message}</p>
        )}
      </div>
    </div>
  );
};

export default AddProduct;
