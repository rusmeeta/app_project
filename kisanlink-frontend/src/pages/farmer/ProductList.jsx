import React, { useEffect, useState } from "react";
import axios from "axios";

const ProductList = () => {
  // State to store the list of products
  const [products, setProducts] = useState([]);

  // State to track which product is being edited
  const [editingId, setEditingId] = useState(null);

  // State to store form data for editing a product
  const [editForm, setEditForm] = useState({});

  // State to store new photo file if user uploads a new one
  const [newPhoto, setNewPhoto] = useState(null);

  // State to store preview URL for uploaded photo
  const [previewPhoto, setPreviewPhoto] = useState(null);

  // ------------------- Fetch Products -------------------
  // This function fetches products from the backend API
  const fetchProducts = async () => {
    try {
      // Call backend endpoint to get all products for the logged-in farmer
      const res = await axios.get("http://localhost:5001/farmer/products", {
        withCredentials: true, // Required to send session cookie
      });
      setProducts(res.data.products); // Save products in state
    } catch (err) {
      console.error(err);
      alert("Error fetching products"); // Show alert if API fails
    }
  };

  // Fetch products once component mounts
  useEffect(() => {
    fetchProducts();
  }, []);

  // ------------------- Delete Product -------------------
  const handleDelete = async (id) => {
    // Confirm before deleting
    if (!window.confirm("Are you sure to delete this product?")) return;

    try {
      await axios.delete(`http://localhost:5001/farmer/delete-product/${id}`, {
        withCredentials: true,
      });
      fetchProducts(); // Refresh product list after deletion
    } catch (err) {
      console.error(err);
      alert("Error deleting product");
    }
  };

  // ------------------- Edit Product -------------------
  // When clicking edit, populate form fields with current product data
  const handleEditClick = (product) => {
    setEditingId(product.id); // Set the editing product ID
    setEditForm(product); // Populate form with product info
    setNewPhoto(null); // Clear any previous new photo
    setPreviewPhoto(
      product.photo_path
        ? `http://localhost:5001/uploads/${product.photo_path}`
        : null
    ); // Set current photo preview
  };

  // Handle changes in form fields during editing
  const handleEditChange = (e) => {
    setEditForm({ ...editForm, [e.target.name]: e.target.value });
  };

  // Handle file input for new photo
  const handlePhotoChange = (e) => {
    const file = e.target.files[0];
    setNewPhoto(file); // Save selected file
    if (file) setPreviewPhoto(URL.createObjectURL(file)); // Preview new file
    else
      setPreviewPhoto(
        editForm.photo_path
          ? `http://localhost:5001/uploads/${editForm.photo_path}`
          : null
      );
  };

  // ------------------- Update Product -------------------
  const handleUpdate = async (id) => {
    try {
      const formData = new FormData();
      formData.append("item_name", editForm.item_name);
      formData.append("price", editForm.price);
      formData.append("location", editForm.location);
      formData.append("min_order_qty", editForm.min_order_qty);
      formData.append("available_stock", editForm.available_stock);

      if (newPhoto) formData.append("photo", newPhoto); // Append new photo if exists

      // Call backend API to update product
      const res = await axios.put(
        `http://localhost:5001/farmer/update-product/${id}`,
        formData,
        {
          headers: { "Content-Type": "multipart/form-data" },
          withCredentials: true, // Required for session authentication
        }
      );

      alert(res.data.message); // Show success message
      setEditingId(null); // Exit editing mode
      setNewPhoto(null); // Clear new photo
      setPreviewPhoto(null); // Clear preview
      fetchProducts(); // Refresh product list
    } catch (err) {
      console.error("Update error:", err.response?.data || err);
      alert(err.response?.data?.error || "Error updating product");
    }
  };

  // ------------------- Render -------------------
  return (
    <div>
      <h2 className="text-2xl font-semibold mb-4">Listed Products</h2>

      <table className="w-full border">
        <thead>
          <tr>
            <th>Photo</th>
            <th>Name</th>
            <th>Price</th>
            <th>Location</th>
            <th>Min Qty</th>
            <th>Stock</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {products.map((p) => (
            <tr key={p.id} className="text-center border-t">
              {/* Photo Column */}
              <td>
                {editingId === p.id ? (
                  previewPhoto ? (
                    <img src={previewPhoto} alt="preview" className="w-16 h-16 mx-auto" />
                  ) : (
                    "No Photo"
                  )
                ) : p.photo_path ? (
                  <img
                    src={`http://localhost:5001/uploads/${p.photo_path}`}
                    alt={p.item_name}
                    className="w-16 h-16 mx-auto"
                  />
                ) : (
                  "No Photo"
                )}
              </td>

              {/* Editable Fields */}
              {editingId === p.id ? (
                <>
                  <td>
                    <input
                      name="item_name"
                      value={editForm.item_name}
                      onChange={handleEditChange}
                    />
                  </td>
                  <td>
                    <input
                      name="price"
                      type="number"
                      value={editForm.price}
                      onChange={handleEditChange}
                    />
                  </td>
                  <td>
                    <input
                      name="location"
                      value={editForm.location}
                      onChange={handleEditChange}
                    />
                  </td>
                  <td>
                    <input
                      name="min_order_qty"
                      type="number"
                      value={editForm.min_order_qty}
                      onChange={handleEditChange}
                    />
                  </td>
                  <td>
                    <input
                      name="available_stock"
                      type="number"
                      value={editForm.available_stock}
                      onChange={handleEditChange}
                    />
                  </td>
                  <td>
                    <input type="file" onChange={handlePhotoChange} />
                    <button
                      onClick={() => handleUpdate(p.id)}
                      className="bg-green-600 text-white px-2 py-1 rounded mr-2"
                    >
                      Save
                    </button>
                    <button
                      onClick={() => setEditingId(null)}
                      className="bg-gray-400 text-white px-2 py-1 rounded"
                    >
                      Cancel
                    </button>
                  </td>
                </>
              ) : (
                // Display Fields
                <>
                  <td>{p.item_name}</td>
                  <td>{p.price}</td>
                  <td>{p.location}</td>
                  <td>{p.min_order_qty}</td>
                  <td>{p.available_stock}</td>
                  <td>
                    <button
                      onClick={() => handleEditClick(p)}
                      className="bg-yellow-400 text-white px-2 py-1 rounded mr-2"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => handleDelete(p.id)}
                      className="bg-red-600 text-white px-2 py-1 rounded"
                    >
                      Delete
                    </button>
                  </td>
                </>
              )}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default ProductList;
