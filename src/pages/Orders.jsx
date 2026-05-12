import { useEffect, useState, useCallback } from "react";
import { Link, useLocation } from "react-router-dom";
import { API } from "../api/client";

const statusBadge = (s) => {
  if (s === "DELIVERED") return "badge badge-success";
  if (s === "CANCELLED") return "badge badge-danger";
  if (s === "OUT_FOR_DELIVERY" || s === "PREPARING") return "badge badge-warn";
  return "badge badge-info";
};

export default function Orders() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const location = useLocation();

  const loadOrders = useCallback(async () => {
    try {
      setLoading(true);

      // Always fetch fresh orders from backend
      const loadedOrders = await API.listOrders();

      setOrders(Array.isArray(loadedOrders) ? loadedOrders : []);
    } catch (error) {
      console.error("Failed to load orders:", error);
      setOrders([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadOrders();
  }, [loadOrders, location.pathname]);

  // Refresh orders again when user comes back to this tab/page
  useEffect(() => {
    const handleFocus = () => {
      loadOrders();
    };

    window.addEventListener("focus", handleFocus);

    return () => {
      window.removeEventListener("focus", handleFocus);
    };
  }, [loadOrders]);

  // Auto-refresh every 50 seconds while customer is on My Orders page
  useEffect(() => {
    const interval = setInterval(() => {
      loadOrders();
    }, 50000);

    return () => clearInterval(interval);
  }, [loadOrders]);

  return (
    <div className="page">
      <div className="page-header">
        <h1>My orders</h1>
        <p>A history of everything you've ordered from QuickBite.</p>
      </div>

      {loading ? (
        <p className="muted">Loading…</p>
      ) : Array.isArray(orders) && orders.length > 0 ? (
        <div className="panel" style={{ padding: 0, overflow: "hidden" }}>
          <table className="table">
            <thead>
              <tr>
                <th>Order</th>
                <th>Restaurant</th>
                <th>Date</th>
                <th>Items</th>
                <th>Total</th>
                <th>Status</th>
                <th></th>
              </tr>
            </thead>

            <tbody>
              {orders.map((o) => (
                <tr key={o.id}>
                  <td>
                    <strong>#{o.id}</strong>
                  </td>

                  <td>{o.restaurantName}</td>
                  <td>{o.date}</td>
                  <td>{o.items}</td>

                  <td>
                    <strong>₹{o.total}</strong>
                  </td>

                  <td>
                    <span className={statusBadge(o.status)}>
                      {String(o.status || "PLACED").replace(/_/g, " ")}
                    </span>
                  </td>

                  <td style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                    <Link to={`/track/${o.id}`} className="btn btn-outline btn-sm">
                      Track
                    </Link>

                    {o.status === "DELIVERED" && (
                      <Link to={`/review/${o.id}`} className="btn btn-primary btn-sm">
                        Review
                      </Link>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <div className="empty-state">
          <div className="empty-state-emoji">🍽️</div>
          <h3>No orders yet</h3>
          <p>Place your first order in under a minute.</p>
          <Link to="/restaurants" className="btn btn-primary">
            Browse kitchens
          </Link>
        </div>
      )}
    </div>
  );
}