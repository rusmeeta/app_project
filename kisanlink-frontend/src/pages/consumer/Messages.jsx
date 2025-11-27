import React, { useState, useEffect } from "react";
import { useLocation } from "react-router-dom";

const BACKEND_URL = "http://localhost:5001";

/**
 * Parse a timestamp into a Date object robustly.
 * - Handles:
 *   - ISO strings with timezone: "2025-11-27T15:42:42.000Z" (native)
 *   - ISO strings without timezone: "2025-11-27T15:42:42" (assume UTC)
 *   - Space-separated "YYYY-MM-DD HH:MM:SS" (assume UTC)
 *   - Epoch seconds (1234567890) or epoch milliseconds (1234567890123)
 */
const parseTimestampToDate = (ts) => {
  if (ts == null) return new Date(NaN);

  // If number (epoch seconds or ms)
  if (typeof ts === "number") {
    // Heuristic: if < 1e12 it's seconds, convert to ms
    return new Date(ts < 1e12 ? ts * 1000 : ts);
  }

  // If it's a string of digits only -> epoch
  if (/^\d+$/.test(ts)) {
    const numeric = Number(ts);
    return new Date(numeric < 1e12 ? numeric * 1000 : numeric);
  }

  // If it's ISO like "2025-11-27T15:42:42Z" or with offset, the Date constructor is fine
  // If it's ISO without timezone "2025-11-27T15:42:42" -> treat as UTC by appending 'Z'
  if (/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(\.\d+)?$/.test(ts)) {
    return new Date(ts + "Z"); // assume UTC
  }

  // If it's space-separated "YYYY-MM-DD HH:MM:SS" -> convert to ISO and assume UTC
  if (/^\d{4}-\d{2}-\d{2} \d{2}:\d{2}:\d{2}$/.test(ts)) {
    return new Date(ts.replace(" ", "T") + "Z");
  }

  // Fallback: let Date try to parse (may be local)
  return new Date(ts);
};

const Messages = () => {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const location = useLocation();

  useEffect(() => {
    const fetchNotifications = async () => {
      setLoading(true);
      try {
        const res = await fetch(`${BACKEND_URL}/notifications/`, { credentials: "include" });
        const data = await res.json();

        if (data && data.status === "success" && Array.isArray(data.notifications)) {
          // Normalize each notification's timestamp into a Date object and attach as parsedDate
          const normalized = data.notifications.map((n) => {
            const parsedDate = parseTimestampToDate(n.timestamp);
            return { ...n, parsedDate };
          });

          // Sort latest-first using the parsed Date
          normalized.sort((a, b) => b.parsedDate - a.parsedDate);

          setNotifications(normalized);
        } else {
          setNotifications([]);
        }
      } catch (err) {
        console.error("Failed to fetch notifications:", err);
        setNotifications([]);
      } finally {
        setLoading(false);
      }
    };

    fetchNotifications();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [location.pathname]);

  if (loading) return <p className="p-6 text-center">Loading messages…</p>;
  if (!notifications.length) return <p className="p-6 text-center">No messages yet.</p>;

  return (
    <div className="max-w-3xl mx-auto p-6">
      <h2 className="text-2xl font-bold mb-4">Messages</h2>
      <ul className="space-y-2">
        {notifications.map((n, index) => {
          // If parsedDate is invalid, show original timestamp as fallback
          const parsed = n.parsedDate;
          const timeLabel = parsed && !isNaN(parsed)
            ? parsed.toLocaleString("en-NP", { timeZone: "Asia/Kathmandu" })
            : String(n.timestamp || "Unknown time");

          return (
            <li key={index} className="bg-white p-4 rounded shadow">
              <p className="mb-2">{n.message}</p>
              <span className="text-gray-400 text-sm">{timeLabel}</span>
            </li>
          );
        })}
      </ul>
    </div>
  );
};

export default Messages;
