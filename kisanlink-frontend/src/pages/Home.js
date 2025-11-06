import React from "react";
import { Link } from "react-router-dom";

const Home = () => {
  return (
    <div className="bg-gradient-to-b from-green-100 via-white to-white font-sans text-gray-800">
      {/* Hero Section */}
      <section className="text-center py-24 px-4">
        <h1 className="text-4xl md:text-5xl font-bold mb-4 text-green-700 leading-tight">
          Welcome to Kisanlink
        </h1>

        <h3 className="text-2xl md:text-3xl font-semibold mb-4 text-green-700 leading-tight">
          Empowering Farmers. Connecting Communities
        </h3>

        <p className="text-lg md:text-xl mb-8 max-w-2xl mx-auto text-gray-600">
          Kisanlink is a smart farm recommendation platform connecting farmers and customers.
          Get personalized insights and boost productivity.
        </p>

        <div className="flex justify-center gap-4 flex-col sm:flex-row">
          <Link
            to="/login"
            className="bg-green-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-green-700 transition"
          >
            Login
          </Link>

          <Link
            to="/signup"
            className="border border-green-600 text-green-700 px-6 py-3 rounded-lg font-semibold hover:bg-green-50 transition"
          >
            Signup
          </Link>
        </div>
      </section>

      {/* Feature Cards */}
      <section className="max-w-4xl mx-auto px-4 grid grid-cols-1 md:grid-cols-2 gap-8 pb-20">
        {/* Smart Recommendations */}
        <div className="bg-white rounded-xl shadow-md p-6 text-center hover:shadow-lg transition">
          <img
            src="/images/recommendations.png"
            alt="Recommendations"
            className="w-16 h-16 mx-auto mb-4 object-contain"
          />
          <h3 className="text-lg font-semibold text-green-700 mb-2">
            Smart Crop & Product Recommendations
          </h3>
          <p className="text-sm text-gray-600">
            Receive tailored suggestions based on your location, soil, weather, and market demand
            to boost productivity.
          </p>
        </div>

        {/* Farmer Marketplace */}
        <div className="bg-white rounded-xl shadow-md p-6 text-center hover:shadow-lg transition">
          <img
            src="/images/users.png"
            alt="Marketplace"
            className="w-16 h-16 mx-auto mb-4 object-contain"
          />
          <h3 className="text-lg font-semibold text-green-700 mb-2">
            Farmer-Customer Marketplace
          </h3>
          <p className="text-sm text-gray-600">
            Farmers can list fresh produce. Customers can browse listings, connect directly,
            and support local agriculture.
          </p>
        </div>
      </section>

      {/* CTA Section */}
      <section className="bg-green-600 text-white text-center py-10 px-4">
        <h2 className="text-xl md:text-2xl font-semibold mb-3">
          Ready to grow smarter?
        </h2>
        <p className="mb-6 text-base md:text-lg">
          Join Kisanlink today and be part of a more efficient, transparent, and community-driven
          farming future.
        </p>
        <Link
          to="/signup"
          className="bg-white text-green-700 px-6 py-3 rounded-lg font-semibold hover:bg-green-100 transition"
        >
          Get Started
        </Link>
      </section>
    </div>
  );
};

export default Home;
