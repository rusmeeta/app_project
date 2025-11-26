import React, { useState, useEffect } from "react";

const BACKEND_URL = "http://localhost:5001";

const Messages = () => {
  const [notifications, setNotifications] = useState([]);

  useEffect(() => {
    const fetchNotifications = async () => {
      try {
        const res = await fetch(`${BACKEND_URL}/notifications/`, {
          credentials: "include",
        });
        const data = await res.json();
        if (data.status === "success") {
          // Sort latest first
          const sorted = data.notifications.sort(
            (a, b) => new Date(b.timestamp) - new Date(a.timestamp)
          );
          setNotifications(sorted);
        }
      } catch (err) {
        console.error(err);
      }
    };

    fetchNotifications();
  }, []);

  // Convert UTC to NST
  const toNST = (utcString) => {
    const date = new Date(utcString);
    // NST is UTC+5:45, i.e., 5*60 + 45 = 345 minutes
    const nstTime = new Date(date.getTime() + 345 * 60 * 1000);
    return nstTime.toLocaleString("en-NP", {
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
      hour12: false,
    });
  };

  if (!notifications.length)
    return <p className="p-6 text-center">No messages yet.</p>;

  return (
    <div className="max-w-3xl mx-auto p-6">
      <h2 className="text-2xl font-bold mb-4">Messages</h2>
      <ul className="space-y-2">
        {notifications.map((n, index) => (
          <li key={index} className="bg-white p-4 rounded shadow">
            <p>{n.message}</p>
            <span className="text-gray-400 text-sm">{toNST(n.timestamp)}</span>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default Messages;
