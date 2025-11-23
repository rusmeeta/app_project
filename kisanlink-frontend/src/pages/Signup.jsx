// src/pages/Signup.jsx
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";

// Signup component for KisanLink
function Signup() {
  const navigate = useNavigate(); // React Router hook to navigate programmatically

  // State to store form input values
  const [formData, setFormData] = useState({
    fullname: "",
    email: "",
    password: "",
    location: "",
    user_type: "", // farmer or consumer
  });

  // State for error messages
  const [error, setError] = useState("");

  // Update formData state on input change
  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault(); // Prevent page reload
    setError(""); // Clear previous error

    try {
      // Send POST request to backend signup API
      const response = await fetch("http://localhost:5001/auth/signup", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include", // Important for session cookies (if backend uses sessions)
        body: JSON.stringify(formData),
      });

      const data = await response.json(); // Parse JSON response from backend
      console.log("Signup response:", data);

      if (response.ok) {
        // Signup successful
        alert(data.message); // Show success message

        // Redirect to login page
        navigate("/login");
      } else {
        // Signup failed, show backend error
        setError(data.message || "Signup failed. Please try again.");
      }
    } catch (err) {
      console.error("Error signing up:", err);
      setError("Something went wrong. Please try again.");
    }
  };

  return (
    <div className="bg-green-50 flex items-center justify-center min-h-screen px-4">
      <div className="max-w-md w-full bg-white rounded-lg shadow-md p-8">
        {/* Signup title */}
        <h2 className="text-3xl font-bold text-green-700 mb-6 text-center">
          Create an Account
        </h2>

        {/* Signup form */}
        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Full Name */}
          <div>
            <label className="block text-sm font-semibold text-gray-700">
              Full Name
            </label>
            <input
              type="text"
              name="fullname"
              value={formData.fullname}
              onChange={handleChange}
              required
              placeholder="Your full name"
              className="mt-1 w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-500"
            />
          </div>

          {/* Email */}
          <div>
            <label className="block text-sm font-semibold text-gray-700">
              Email Address
            </label>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              required
              placeholder="example@mail.com"
              className="mt-1 w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-500"
            />
          </div>

          {/* Password */}
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
              placeholder="Enter a strong password"
              className="mt-1 w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-500"
            />
          </div>

          {/* Location */}
          <div>
            <label className="block text-sm font-semibold text-gray-700">
              Location
            </label>
            <select
              name="location"
              value={formData.location}
              onChange={handleChange}
              required
              className="mt-1 w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-500"
            >
              <option value="">Select your location</option>
              <option value="Naya Thimi">Naya Thimi</option>
              <option value="Gatthaghar">Gatthaghar</option>
              <option value="Kausaltar">Kausaltar</option>
              <option value="Lokanthali">Lokanthali</option>
            </select>
          </div>

          {/* User Type */}
          <div>
            <label className="block text-sm font-semibold text-gray-700">
              User Type
            </label>
            <select
              name="user_type"
              value={formData.user_type}
              onChange={handleChange}
              required
              className="mt-1 w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-500"
            >
              <option value="">Select your role</option>
              <option value="farmer">Farmer</option>
              <option value="consumer">Consumer</option>
            </select>
          </div>

          {/* Submit button */}
          <button
            type="submit"
            className="w-full bg-green-600 text-white font-semibold py-3 rounded-md hover:bg-green-700 transition"
          >
            Sign Up
          </button>
        </form>

        {/* Display error message if any */}
        {error && <p className="mt-4 text-red-600">{error}</p>}

        {/* Link to login page */}
        <p className="mt-6 text-center text-gray-600">
          Already have an account?{" "}
          <a
            href="/login"
            className="text-green-700 font-semibold hover:underline"
          >
            Log in
          </a>
        </p>
      </div>
    </div>
  );
}

export default Signup;
