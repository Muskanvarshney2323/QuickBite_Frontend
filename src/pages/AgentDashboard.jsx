import { useEffect, useState, useCallback } from "react";
import { Link } from "react-router-dom";
import { API } from "../api/client";
import { useAuthStore } from "../store/auth";
import { useToast } from "../store/toast";

const AUTO_REFRESH_MS = 10000;

export default function AgentDashboard() {
  const user = useAuthStore((state) => state.user);
  const [activeOrders, setActiveOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [enteredOtp, setEnteredOtp] = useState({});
  const toast = useToast((state) => state.push);

  const loadActiveOrders = useCallback(async () => {
    try {
      console.log("[AGENT_DASHBOARD] Fetching active delivery orders...");
      const data = await API.listDeliveryOrders();
      setActiveOrders(Array.isArray(data) ? data : []);
      console.log("[AGENT_DASHBOARD] Active orders count:", Array.isArray(data) ? data.length : 0);
    } catch (loadError) {
      console.error("[AGENT_DASHBOARD] Error loading active orders:", loadError);
      setError(loadError.message || "Could not load active orders");
      toast(loadError.message || "Could not load active orders", "error");
      setActiveOrders([]);
    }
  }, [toast]);

  const loadOrders = useCallback(async () => {
    if (!user) {
      console.log("[AGENT_DASHBOARD] No agent logged in, skipping order refresh");
      return;
    }

    setLoading(true);
    setError(null);

    try {
      await loadActiveOrders();
    } catch (refreshError) {
      console.warn("[AGENT_DASHBOARD] Order refresh failed:", refreshError);
    } finally {
      setLoading(false);
    }
  }, [user, loadActiveOrders]);

  useEffect(() => {
    if (!user) return;

    loadOrders();
    const intervalId = window.setInterval(loadOrders, AUTO_REFRESH_MS);

    const handleVisibilityChange = () => {
      if (document.visibilityState === "visible") {
        console.log("[AGENT_DASHBOARD] Page visible, refreshing orders");
        loadOrders();
      }
    };

    const handleWindowFocus = () => {
      console.log("[AGENT_DASHBOARD] Window focused, refreshing orders");
      loadOrders();
    };

    window.addEventListener("focus", handleWindowFocus);
    document.addEventListener("visibilitychange", handleVisibilityChange);

    return () => {
      clearInterval(intervalId);
      window.removeEventListener("focus", handleWindowFocus);
      document.removeEventListener("visibilitychange", handleVisibilityChange);
    };
  }, [user, loadOrders]);

  const updateStatus = async (orderId, status, successMessage) => {
    try {
      setLoading(true);
      await API.updateOrderStatus(orderId, status);
      toast(successMessage, "success");
      await loadOrders();
    } catch (updateError) {
      console.error("[AGENT_DASHBOARD] Error updating order status:", updateError);
      toast(updateError.message || "Unable to update order status", "error");
    } finally {
      setLoading(false);
    }
  };

  const verifyOtpAndDeliver = async (order) => {
    const typedOtp = String(enteredOtp[order.id] || "").trim();

    if (!typedOtp) {
      toast("Enter customer OTP first", "error");
      return;
    }

    try {
      console.log("[AGENT_DASHBOARD] Verifying OTP for order:", order.id);
      await API.verifyOtp(order.id, typedOtp);
      toast("OTP verified and delivery confirmed", "success");
      await loadOrders();
      setEnteredOtp((prev) => {
        const next = { ...prev };
        delete next[order.id];
        return next;
      });
    } catch (verifyError) {
      console.error("[AGENT_DASHBOARD] OTP verification failed:", verifyError);
      toast(verifyError.message || "OTP verification failed", "error");
    } finally {
      setLoading(false);
    }
  };

  const orders = activeOrders;

  return (
    <div className="page">
      <div className="page-header">
        <h1>Delivery service dashboard</h1>
        <p>See pickup and delivery details for assigned orders.</p>
      </div>

      <div style={{ marginBottom: 20, display: "flex", gap: 8, flexWrap: "wrap" }}>
        <button className="btn btn-primary">Active Orders</button>
      </div>

      {loading && activeOrders.length === 0 ? (
        <p className="muted">Loading orders…</p>
      ) : error ? (
        <div className="error-message">{error}</div>
      ) : activeOrders.length === 0 ? (
        <div className="empty-state">
          <div className="empty-state-emoji">🛵</div>
          <h3>No active deliveries</h3>
          <p>New delivery orders will appear here automatically.</p>
        </div>
      ) : (
        <div className="panel" style={{ padding: 0, overflow: "hidden" }}>
          {orders.map((order) => (
            <div
              key={order.id}
              style={{
                padding: 20,
                borderBottom: "1px solid var(--line)",
                display: "flex",
                flexDirection: "column",
                gap: 16,
                background: "var(--bg)",
                borderRadius: 8,
                marginBottom: 16,
                boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
              }}
            >
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "flex-start",
                  flexWrap: "wrap",
                  gap: 10,
                }}
              >
                <div style={{ flex: 1 }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 8 }}>
                    <strong style={{ fontSize: "1.1rem" }}>Order #{order.id}</strong>
                    <span className="badge badge-warn" style={{ fontSize: "0.8rem", padding: "4px 8px" }}>
                      {String(order.status || "PLACED").replace(/_/g, " ")}
                    </span>
                  </div>
                  <p style={{ margin: 0, fontWeight: 600, color: "var(--text)" }}>
                    {order.restaurantName}
                  </p>
                  <p className="muted" style={{ margin: "4px 0 0 0" }}>
                    {order.items} item{order.items === 1 ? "" : "s"} • ₹{order.total}
                  </p>
                </div>
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
                <div>
                  <strong>Pickup From</strong>
                  <p className="muted" style={{ marginTop: 6 }}>{order.pickupLocation || order.restaurantName}</p>
                </div>
                <div>
                  <strong>Deliver To</strong>
                  <p className="muted" style={{ marginTop: 6 }}>{order.deliveryAddress}</p>
                </div>
              </div>

              {order.status === "OUT_FOR_DELIVERY" && (
                <div
                  style={{
                    display: "flex",
                    flexWrap: "wrap",
                    gap: 12,
                    alignItems: "center",
                    marginTop: 8,
                    padding: 16,
                    background: "var(--bg-secondary)",
                    borderRadius: 8,
                  }}
                >
                  <div style={{ flex: "1 1 220px" }}>
                    <label style={{ display: "block", marginBottom: 6, fontWeight: 600, fontSize: "0.9rem" }}>
                      Enter customer OTP
                    </label>
                    <input
                      type="text"
                      value={enteredOtp[order.id] || ""}
                      onChange={(e) =>
                        setEnteredOtp((prev) => ({
                          ...prev,
                          [order.id]: e.target.value,
                        }))
                      }
                      placeholder="Enter 4 digit OTP"
                      style={{ width: "100%", padding: 10, borderRadius: 8, border: "1px solid var(--line)", fontSize: "1rem" }}
                    />
                  </div>
                  <button className="btn btn-success" onClick={() => verifyOtpAndDeliver(order)} style={{ padding: "10px 16px" }}>
                    Verify OTP & Deliver
                  </button>
                </div>
              )}

              <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginTop: 8 }}>
                {order.status === "PLACED" && (
                  <button className="btn btn-primary" onClick={() => updateStatus(order.id, "CONFIRMED", "Order confirmed")}>Confirm Order</button>
                )}
                {order.status === "CONFIRMED" && (
                  <button className="btn btn-primary" onClick={() => updateStatus(order.id, "PICKED_UP", "Order picked up")}>Pick Up Order</button>
                )}
                {order.status === "PICKED_UP" && (
                  <button className="btn btn-primary" onClick={() => updateStatus(order.id, "OUT_FOR_DELIVERY", "Order is out for delivery")}>Start Delivery</button>
                )}
                <Link to={`/track/${order.id}`} className="btn btn-outline">Track</Link>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
