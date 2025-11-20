import React, { useEffect, useState } from "react";
import axios from "axios";

const ProductList = () => {
  const [products, setProducts] = useState([]);
  const [editingId, setEditingId] = useState(null);
  const [editForm, setEditForm] = useState({});
  const [newPhoto, setNewPhoto] = useState(null);
  const [previewPhoto, setPreviewPhoto] = useState(null);

  const farmer_id = localStorage.getItem("farmer_id");

  const fetchProducts = async () => {
    try {
      const res = await axios.get(
        `http://localhost:5001/farmer/products/${farmer_id}`
      );
      setProducts(res.data.products);
    } catch (err) {
      console.error(err);
      alert("Error fetching products");
    }
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure to delete this product?")) return;
    try {
      await axios.delete(`http://localhost:5001/farmer/delete-product/${id}`);
      fetchProducts();
    } catch (err) {
      console.error(err);
      alert("Error deleting product");
    }
  };

  const handleEditClick = (product) => {
    setEditingId(product.id);
    setEditForm(product);
    setNewPhoto(null);
    setPreviewPhoto(product.photo_path ? `http://localhost:5001/uploads/${product.photo_path}` : null);
  };

  const handleEditChange = (e) => {
    setEditForm({ ...editForm, [e.target.name]: e.target.value });
  };

  const handlePhotoChange = (e) => {
    const file = e.target.files[0];
    setNewPhoto(file);
    if (file) {
      setPreviewPhoto(URL.createObjectURL(file));
    } else {
      setPreviewPhoto(editForm.photo_path ? `http://localhost:5001/uploads/${editForm.photo_path}` : null);
    }
  };

  const handleUpdate = async (id) => {
    try {
      const formData = new FormData();
      formData.append("item_name", editForm.item_name);
      formData.append("price", editForm.price);
      formData.append("location", editForm.location);
      formData.append("min_order_qty", editForm.min_order_qty);
      formData.append("available_stock", editForm.available_stock);

      if (newPhoto) {
        formData.append("photo", newPhoto);
      }

      const res = await axios.put(
        `http://localhost:5001/farmer/update-product/${id}`,
        formData,
        { headers: { "Content-Type": "multipart/form-data" } }
      );

      alert(res.data.message);
      setEditingId(null);
      setNewPhoto(null);
      setPreviewPhoto(null);
      fetchProducts();
    } catch (err) {
      console.error("Update error:", err.response?.data || err);
      alert(err.response?.data?.error || "Error updating product");
    }
  };

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

              {editingId === p.id ? (
                <>
                  <td><input name="item_name" value={editForm.item_name} onChange={handleEditChange} /></td>
                  <td><input name="price" type="number" value={editForm.price} onChange={handleEditChange} /></td>
                  <td><input name="location" value={editForm.location} onChange={handleEditChange} /></td>
                  <td><input name="min_order_qty" type="number" value={editForm.min_order_qty} onChange={handleEditChange} /></td>
                  <td><input name="available_stock" type="number" value={editForm.available_stock} onChange={handleEditChange} /></td>
                  <td>
                    <input type="file" onChange={handlePhotoChange} />
                    <button onClick={() => handleUpdate(p.id)} className="bg-green-600 text-white px-2 py-1 rounded mr-2">Save</button>
                    <button onClick={() => setEditingId(null)} className="bg-gray-400 text-white px-2 py-1 rounded">Cancel</button>
                  </td>
                </>
              ) : (
                <>
                  <td>{p.item_name}</td>
                  <td>{p.price}</td>
                  <td>{p.location}</td>
                  <td>{p.min_order_qty}</td>
                  <td>{p.available_stock}</td>
                  <td>
                    <button onClick={() => handleEditClick(p)} className="bg-yellow-400 text-white px-2 py-1 rounded mr-2">Edit</button>
                    <button onClick={() => handleDelete(p.id)} className="bg-red-600 text-white px-2 py-1 rounded">Delete</button>
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