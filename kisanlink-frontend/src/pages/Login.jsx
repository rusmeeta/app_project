import React, { useState } from "react";
import { useNavigate } from "react-router-dom";

// Login component for KisanLink
function Login() {
  const navigate = useNavigate(); // React Router hook to navigate programmatically

  // State for form inputs
  const [formData, setFormData] = useState({ email: "", password: "" });
  // State for displaying errors
  const [error, setError] = useState("");

  // Update formData state on input change
  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault(); // Prevent page reload
    setError(""); // Reset previous error

    try {
      // Call backend login API using fetch (Flask session will be set)
      const response = await fetch("http://localhost:5001/auth/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        credentials: "include", // Important: send cookies for session
        body: JSON.stringify(formData)
      });

      const data = await response.json();
      console.log("Backend response:", data);

      // Check if login was successful
      if (data.status === "success") {
        const userType = data.user_type; // Get user type from backend

        // Redirect user based on user type
        if (userType === "farmer") {
          navigate("/farmer/dashboard");
        } else if (userType === "consumer") {
          navigate("/consumer/dashboard");
        } else if (userType === "admin") {
          navigate("/admin/dashboard");
        } else {
          // Unknown user type returned
          setError("Unknown user type");
        }
      } else {
        // Login failed, display backend error
        setError(data.message || "Login failed");
      }
    } catch (err) {
      console.error("Login error:", err);
      setError("Login failed. Please try again.");
    }
  };

  return (
    <div className="flex justify-center items-center min-h-screen bg-green-50 px-4">
      <div className="max-w-md w-full bg-white rounded-lg shadow-md p-8">
        {/* Login title */}
        <h2 className="text-3xl font-bold text-green-700 mb-6 text-center">
          Login
        </h2>

        {/* Login form */}
        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Email input */}
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

          {/* Password input */}
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

          {/* Submit button */}
          <button
            type="submit"
            className="w-full bg-green-600 text-white font-semibold py-3 rounded-md hover:bg-green-700 transition"
          >
            Login
          </button>
        </form>

        {/* Display error message if any */}
        {error && <p className="mt-4 text-red-600">{error}</p>}

        {/* Signup link */}
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
