import React, { useEffect, useState } from "react";

const Message = () => {
  const [messages, setMessages] = useState([]);

  useEffect(() => {
    fetchMessages();
  }, []);

  const fetchMessages = async () => {
    const res = await fetch("http://localhost:5001/notifications"); // your backend notifications API
    const data = await res.json();
    setMessages(data);
  };

  const markAsRead = (id) => {
    const updated = messages.map(msg => msg.id === id ? { ...msg, read: true } : msg);
    setMessages(updated);
  };

  if (messages.length === 0) return <p className="text-gray-500 mt-4">No messages yet.</p>;

  return (
    <div className="p-6">
      <h2 className="text-3xl font-bold mb-6">Messages</h2>
      <div className="space-y-4">
        {messages.map(msg => (
          <div key={msg.id} className={`p-4 rounded shadow ${msg.read ? "bg-gray-100" : "bg-white"}`}>
            <p className="font-semibold">{msg.message}</p>
            <p className="text-gray-500 text-sm">{new Date(msg.created_at).toLocaleString()}</p>
            {!msg.read && (
              <button
                className="mt-2 bg-green-600 text-white px-3 py-1 rounded hover:bg-green-700 transition"
                onClick={() => markAsRead(msg.id)}
              >
                Mark as Read
              </button>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default Message;