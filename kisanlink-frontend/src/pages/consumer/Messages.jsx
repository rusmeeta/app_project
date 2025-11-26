import React, { useEffect, useState } from "react";

const Messages = () => {
  const [messages, setMessages] = useState([]);

  const fetchMessages = async () => {
    const res = await fetch("http://localhost:5001/notifications", {
      credentials: "include",
    });
    const data = await res.json();
    setMessages(data);
  };

  useEffect(() => {
    fetchMessages();
  }, []);

  return (
    <div className="p-6">
      <h2 className="text-2xl font-bold mb-4">Messages</h2>
      {messages.length === 0 && <p>No messages yet.</p>}
      <ul>
        {messages.map((m) => (
          <li key={m.id} className="border-b py-2">
            {m.message} <span className="text-gray-400 text-sm">({new Date(m.created_at).toLocaleString()})</span>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default Messages;
