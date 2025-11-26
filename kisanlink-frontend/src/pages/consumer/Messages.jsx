import React, { useState, useEffect } from "react";

const BACKEND_URL = "http://localhost:5001";

const Messages = () => {
  const [notifications, setNotifications] = useState([]);

  useEffect(() => {
    const fetchNotifications = async () => {
      try {
        const res = await fetch(`${BACKEND_URL}/notifications/`, { credentials: "include" });
        const data = await res.json();
        if (data.status === "success") setNotifications(data.notifications);
      } catch (err) {
        console.error(err);
      }
    };

    fetchNotifications();
  }, []);

  if (!notifications.length) return <p className="p-6 text-center">No messages yet.</p>;

  return (
    <div className="max-w-3xl mx-auto p-6">
      <h2 className="text-2xl font-bold mb-4">Messages</h2>
      <ul className="space-y-2">
        {notifications.map((n, index) => (
          <li key={index} className="bg-white p-4 rounded shadow">
            <p>{n.message}</p>
            <span className="text-gray-400 text-sm">{new Date(n.timestamp).toLocaleString()}</span>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default Messages;
