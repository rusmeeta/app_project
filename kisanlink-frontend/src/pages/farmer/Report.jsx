import React, { useEffect, useState } from "react";
import {
  LineChart, Line, XAxis, YAxis, Tooltip,
  PieChart, Pie, Cell, Legend
} from "recharts";

function Report({ farmerId }) {
  const [summary, setSummary] = useState({
    totalRevenue: 0,
    totalOrders: 0,
    mostSoldProduct: "N/A",
    lowStock: 0
  });
  const [salesData, setSalesData] = useState([]);
  const [revenueData, setRevenueData] = useState([]);
  const [inventory, setInventory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!farmerId) return;

    fetch(`http://localhost:5001/api/farmer/report/${farmerId}`)
      .then(res => {
        if (!res.ok) throw new Error("Failed to fetch report data");
        return res.json();
      })
      .then(data => {
        setSummary(data.summary || summary);
        setSalesData(data.salesTrend || []);
        setRevenueData(data.revenueBreakdown || []);
        setInventory(data.inventoryTable || []);
        setLoading(false);
      })
      .catch(err => {
        console.error(err);
        setError(err.message);
        setLoading(false);
      });
  }, [farmerId]);

  const COLORS = ["#2E7D32", "#66BB6A", "#43A047", "#81C784"];

  const downloadPDF = () => {
    if (!farmerId) return;
    window.open(`http://localhost:5001/api/farmer/report/pdf/${farmerId}`, "_blank");
  };

  if (loading) return <p className="p-6">Loading report...</p>;
  if (error) return <p className="p-6 text-red-600">Error: {error}</p>;

  return (
    <div className="p-6 bg-gray-100 min-h-screen">
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

      <h2 className="text-2xl font-semibold mt-10 mb-4">Analytics</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
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
