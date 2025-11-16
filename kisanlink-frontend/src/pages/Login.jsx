import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { login } from "../api/auth"; // adjust path to your auth.js

function Login() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({ email: "", password: "" });
  const [error, setError] = useState("");

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    try {
      const data = await login(formData);
      console.log("Backend response:", data);

      const user = data.user || data; // handle different backend structures
      const userType = user.user_type || user.userType;

      if (data.status === "success") {
        // Save user info
        localStorage.setItem("user", JSON.stringify(user));
        localStorage.setItem("user_id", user.id);

        // Redirect based on user type
        if (userType === "farmer") {
          navigate("/farmer/dashboard");
        } else if (userType === "consumer") {
          navigate("/consumer/dashboard"); // make sure this route exists
        } else {
          setError("Unknown user type");
        }
      } else {
        setError(data.message || "Login failed");
      }
    } catch (err) {
      console.error(err);
      setError("Login failed. Please try again.");
    }
  };

  return (
    <div className="flex justify-center items-center min-h-screen bg-green-50 px-4">
      <div className="max-w-md w-full bg-white rounded-lg shadow-md p-8">
        <h2 className="text-3xl font-bold text-green-700 mb-6 text-center">
          Login
        </h2>
        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="block text-sm font-semibold text-gray-700">
              Email
            </label>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              required
              className="mt-1 w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-500"
              placeholder="Your email"
            />
          </div>
          <div>
            <label className="block text-sm font-semibold text-gray-700">
              Password
            </label>
            <input
              type="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              required
              className="mt-1 w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-500"
              placeholder="Your password"
            />
          </div>
          <button
            type="submit"
            className="w-full bg-green-600 text-white font-semibold py-3 rounded-md hover:bg-green-700 transition"
          >
            Login
          </button>
        </form>
        {error && <p className="mt-4 text-red-600">{error}</p>}
        <p className="mt-6 text-center text-gray-600">
          Don't have an account?{" "}
          <a
            href="/signup"
            className="text-green-700 font-semibold hover:underline"
          >
            Sign Up
          </a>
        </p>
      </div>
    </div>
  );
}

export default Login;
