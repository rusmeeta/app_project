import React, { useState } from "react";
import axios from "axios";

function AddProduct() {
  const [formData, setFormData] = useState({
    item_name: "",
    price: "",
    location: "",
    min_order_qty: "",
    available_stock: "",
    photo: null,
  });

  const farmer_id = localStorage.getItem("farmer_id"); // get farmer id from login

  const handleChange = (e) => {
    const { name, value, files } = e.target;
    if (files) {
      setFormData({ ...formData, [name]: files[0] }); // store file
    } else {
      setFormData({ ...formData, [name]: value });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Validate all fields
    if (!formData.item_name || !formData.price || !formData.min_order_qty || !formData.available_stock || !formData.location || !formData.photo) {
      alert("Please fill all fields");
      return;
    }

    try {
      const payload = new FormData();
      payload.append("farmer_id", farmer_id);
      payload.append("item_name", formData.item_name);
      payload.append("price", parseInt(formData.price));
      payload.append("location", formData.location);
      payload.append("min_order_qty", parseInt(formData.min_order_qty));
      payload.append("available_stock", parseInt(formData.available_stock));
      payload.append("photo", formData.photo);

      const res = await axios.post("http://localhost:5001/farmer/add-product", payload, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      if (res.data.message) {
        alert(res.data.message);
        // Clear form
        setFormData({
          item_name: "",
          price: "",
          location: "",
          min_order_qty: "",
          available_stock: "",
          photo: null,
        });
      }
    } catch (error) {
      console.error("Add product error:", error.response?.data || error.message);
      alert(error.response?.data?.error || "Server error, please check your backend");
    }
  };

  return (
    <div style={styles.container}>
      <h2 ><b>Add Product</b></h2>
      <form onSubmit={handleSubmit} style={styles.form}>
        <input
          type="text"
          name="item_name"
          placeholder="Item Name"
          value={formData.item_name}
          onChange={handleChange}
          style={styles.input}
        />
        <input
          type="number"
          name="price"
          placeholder="Price"
          value={formData.price}
          onChange={handleChange}
          style={styles.input}
        />
        <input
          type="text"
          name="location"
          placeholder="Location"
          value={formData.location}
          onChange={handleChange}
          style={styles.input}
        />
        <input
          type="number"
          name="min_order_qty"
          placeholder="Minimum Order Quantity"
          value={formData.min_order_qty}
          onChange={handleChange}
          style={styles.input}
        />
        <input
          type="number"
          name="available_stock"
          placeholder="Available Stock"
          value={formData.available_stock}
          onChange={handleChange}
          style={styles.input}
        />
        <input
          type="file"
          name="photo"
          accept="image/*"
          onChange={handleChange}
          style={styles.input}
        />
        <button type="submit" style={styles.button}>Add Product</button>
      </form>
    </div>
  );
}

const styles = {
  container: { width: "400px", margin: "auto", marginTop: "40px", padding: "20px", borderRadius: "10px", backgroundColor: "white", boxShadow: "0 0 10px rgba(0,0,0,0.1)" },
  form: { display: "flex", flexDirection: "column" },
  input: { margin: "10px 0", padding: "10px", borderRadius: "5px", border: "1px solid #ccc" },
  button: { backgroundColor: "#28a745", color: "white", padding: "10px", borderRadius: "5px", border: "none", cursor: "pointer", marginTop: "10px" },
};

export default AddProduct;