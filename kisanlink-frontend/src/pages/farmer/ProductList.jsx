import React, { useEffect, useState } from "react";

const ProductList = () => {
  const [products, setProducts] = useState([]);

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const user = JSON.parse(localStorage.getItem("user"));
        const res = await fetch(`http://127.0.0.1:5001/api/farmer/get-products/${user.id}`);
        const data = await res.json();
        setProducts(data);
      } catch (err) {
        console.error(err);
      }
    };

    fetchProducts();
  }, []);

  return (
    <div style={{ maxWidth: "600px", margin: "50px auto" }}>
      <h2>Your Products</h2>
      {products.length === 0 && <p>No products found.</p>}
      {products.map((p) => (
        <div key={p.id} style={{ border: "1px solid #ccc", padding: "10px", marginBottom: "10px" }}>
          <strong>{p.name}</strong> <br />
          Price: {p.price} <br />
          Quantity: {p.quantity}
        </div>
      ))}
    </div>
  );
};

export default ProductList;
