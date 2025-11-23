import React, { useEffect, useState } from "react";
import axios from "axios";
import {
  LineChart, Line, XAxis, YAxis, Tooltip,
  PieChart, Pie, Cell, Legend
} from "recharts";

/**
 * Report component
 * Fetches and displays real-time farmer report data including:
 * 1. Summary (Revenue, Orders, Most Sold Product, Low Stock)
 * 2. Sales trend chart
 * 3. Revenue breakdown pie chart
 * 4. Inventory status table
 */
function Report() {
  const [farmerId, setFarmerId] = useState(null); // farmer ID from session
  const [summary, setSummary] = useState({});
  const [salesData, setSalesData] = useState([]);
  const [revenueData, setRevenueData] = useState([]);
  const [inventory, setInventory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const COLORS = ["#2E7D32", "#66BB6A", "#43A047", "#81C784", "#1B5E20", "#A5D6A7"];

  // Fetch farmer ID from session backend
  useEffect(() => {
    const fetchFarmer = async () => {
      try {
        const res = await axios.get("http://localhost:5001/farmer/me", {
          withCredentials: true
        });
        setFarmerId(res.data.id);
      } catch (err) {
        console.error("Failed to fetch farmer info:", err);
        setError("Unable to fetch farmer info");
        setLoading(false);
      }
    };
    fetchFarmer();
  }, []);

  // Fetch report data once farmerId is available
  useEffect(() => {
    if (!farmerId) return;

    const fetchReport = async () => {
      try {
        const res = await axios.get(`http://localhost:5001/api/farmer/report/${farmerId}`, {
          withCredentials: true
        });
        const data = res.data;

        // Set state with actual backend data
        setSummary(data.summary || {});
        setSalesData(data.salesTrend || []);
        setRevenueData(data.revenueBreakdown || []);
        setInventory(data.inventoryTable || []);
        setLoading(false);
      } catch (err) {
        console.error("Failed to fetch report:", err);
        setError("Failed to load report data");
        setLoading(false);
      }
    };

    fetchReport();
  }, [farmerId]);

  // Open PDF in new tab
  const downloadPDF = () => {
    if (!farmerId) return;
    window.open(`http://localhost:5001/api/farmer/report/pdf/${farmerId}`, "_blank");
  };

  if (loading) return <p className="p-6">Loading report...</p>;
  if (error) return <p className="p-6 text-red-600">Error: {error}</p>;

  return (
    <div className="p-6 bg-gray-100 min-h-screen">
      {/* Summary Section */}
      <h2 className="text-2xl font-semibold mb-4">Report Summary</h2>
      <div className="grid grid-cols-1 md:grid-cols-4 gap-5">
        <div className="bg-white p-5 rounded-xl shadow">
          <h3 className="text-gray-600">Total Revenue</h3>
          <p className="text-2xl font-bold text-green-700">Rs. {summary.totalRevenue || 0}</p>
        </div>
        <div className="bg-white p-5 rounded-xl shadow">
          <h3 className="text-gray-600">Total Orders</h3>
          <p className="text-2xl font-bold">{summary.totalOrders || 0}</p>
        </div>
        <div className="bg-white p-5 rounded-xl shadow">
          <h3 className="text-gray-600">Most Sold Product</h3>
          <p className="text-xl font-semibold text-green-700">{summary.mostSoldProduct || "N/A"}</p>
        </div>
        <div className="bg-white p-5 rounded-xl shadow">
          <h3 className="text-gray-600">Low Stock Items</h3>
          <p className="text-xl font-semibold text-red-600">{summary.lowStock || 0}</p>
        </div>
      </div>

      {/* Analytics Section */}
      <h2 className="text-2xl font-semibold mt-10 mb-4">Analytics</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Sales Trend Chart */}
        <div className="bg-white p-5 rounded-xl shadow">
          <h3 className="text-lg font-medium mb-3">Sales Trend</h3>
          {salesData.length > 0 ? (
            <LineChart width={550} height={300} data={salesData}>
              <XAxis dataKey="date" />
              <YAxis />
              <Tooltip />
              <Line type="monotone" dataKey="sales" stroke="#2E7D32" strokeWidth={3} />
            </LineChart>
          ) : (
            <p className="text-gray-500">No sales data available</p>
          )}
        </div>

        {/* Revenue Breakdown Pie Chart */}
        <div className="bg-white p-5 rounded-xl shadow">
          <h3 className="text-lg font-medium mb-3">Revenue Breakdown</h3>
          {revenueData.length > 0 ? (
            <PieChart width={350} height={300}>
              <Pie
                data={revenueData}
                dataKey="value"
                nameKey="product"
                outerRadius={120}
                label
              >
                {revenueData.map((entry, index) => (
                  <Cell key={index} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Legend />
              <Tooltip />
            </PieChart>
          ) : (
            <p className="text-gray-500">No revenue data available</p>
          )}
        </div>
      </div>

      {/* Inventory Table */}
      <h2 className="text-2xl font-semibold mt-10 mb-4">Inventory Status</h2>
      <div className="bg-white p-5 rounded-xl shadow overflow-x-auto">
        {inventory.length > 0 ? (
          <table className="w-full text-left">
            <thead>
              <tr className="border-b text-gray-600">
                <th className="py-2">Product</th>
                <th>Stock</th>
                <th>Low Stock Alert</th>
              </tr>
            </thead>
            <tbody>
              {inventory.map((item, i) => (
                <tr key={i} className="border-b">
                  <td className="py-2">{item.product}</td>
                  <td>{item.stock}</td>
                  <td className={item.stock < 15 ? "text-red-600 font-semibold" : "text-green-700"}>
                    {item.stock < 15 ? "Low" : "OK"}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : (
          <p className="text-gray-500">No inventory data available</p>
        )}
      </div>

      {/* PDF Download Button */}
      <div className="mt-8 flex justify-end">
        <button
          onClick={downloadPDF}
          className="bg-green-700 text-white px-6 py-3 rounded-lg shadow hover:bg-green-800"
        >
          Download Report PDF
        </button>
      </div>

      <p className="text-center text-gray-500 text-sm mt-10">KisanLink © 2025 Farmer Dashboard</p>
    </div>
  );
}

export default Report;
