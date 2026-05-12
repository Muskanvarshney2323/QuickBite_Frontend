import { useEffect, useState } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { API } from "../api/client";
import { useToast } from "../store/toast";

const steps = [
  { key: "PLACED", title: "Order placed", desc: "Kitchen is confirming your items" },
  { key: "CONFIRMED", title: "Kitchen confirmed", desc: "Your order has been accepted" },
  { key: "PREPARING", title: "Preparing", desc: "Your food is being cooked" },
  { key: "PICKED_UP", title: "Picked up", desc: "Delivery agent has picked up the order" },
  { key: "OUT_FOR_DELIVERY", title: "Out for delivery", desc: "Agent is on the way" },
  { key: "DELIVERED", title: "Delivered", desc: "Enjoy your meal!" },
];

function generateOtp(orderId) {
  return String(
    1000 +
      (Math.abs(
        String(orderId)
          .split("")
          .reduce((sum, ch) => sum + ch.charCodeAt(0), 0)
      ) %
        9000)
  ).padStart(4, "0");
}

export default function TrackOrder() {
  const { id } = useParams();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [cancelled, setCancelled] = useState(false);

  const toast = useToast((state) => state.push);
  const nav = useNavigate();

  const loadOrder = async () => {
    try {
      const data = await API.getOrder(id);
      setOrder(data);
      setCancelled(data.status === "CANCELLED");
    } catch (error) {
      toast(error.message || "Could not load order", "error");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadOrder();

    // Refresh order status every 10 seconds
    const interval = setInterval(loadOrder, 10000);

    return () => clearInterval(interval);
  }, [id]);

  const cancel = async () => {
    if (!confirm("Cancel this order?")) return;

    try {
      await API.cancelOrder(id);

      setCancelled(true);
      setOrder((current) => ({
        ...current,
        status: "CANCELLED",
      }));

      toast("Order cancelled successfully", "success");
    } catch (error) {
      toast(error.message || "Cancel failed", "error");
    }
  };

  if (loading) {
    return (
      <div className="page">
        <div className="empty-state">
          <h3>Loading order...</h3>
        </div>
      </div>
    );
  }

  const status = order?.status || "PLACED";
  const activeIdx = Math.max(0, steps.findIndex((step) => step.key === status));
  const isDelivered = status === "DELIVERED";
  const deliveryOtp = generateOtp(id);

  return (
    <div className="page">
      <div className="tracker-wrap">
        <div className="tracker-head">
          <span className="eyebrow">Order #{id}</span>

          <h1>
            {cancelled
              ? "Cancelled"
              : isDelivered
              ? "Delivered."
              : "Track your order"}
          </h1>

          {!cancelled && !isDelivered && (
            <p className="tracker-eta">
              Current status · <strong>{status.replace(/_/g, " ")}</strong>
            </p>
          )}
        </div>

        {cancelled ? (
          <div className="empty-state">
            <div className="empty-state-emoji">❌</div>
            <h3>This order was cancelled</h3>
            <p>Refund, if any, will reach you in 3–5 business days.</p>

            <Link to="/restaurants" className="btn btn-primary">
              Order something else
            </Link>
          </div>
        ) : (
          <>
            <div className="tracker-timeline" style={{ position: 'relative', padding: '20px 0' }}>
              {steps.map((step, index) => {
                const isDone = index < activeIdx || (index === activeIdx && isDelivered);
                const isActive = index === activeIdx && !isDelivered;
                const isUpcoming = index > activeIdx;

                return (
                  <div
                    key={step.key}
                    className={`tracker-step ${isDone ? "done" : isActive ? "active" : ""}`}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      marginBottom: 24,
                      position: 'relative',
                      opacity: isUpcoming ? 0.5 : 1,
                    }}
                  >
                    <div
                      style={{
                        width: 40,
                        height: 40,
                        borderRadius: '50%',
                        background: isDone ? '#10b981' : isActive ? '#f59e0b' : '#e5e7eb',
                        color: 'white',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontSize: '1.2rem',
                        marginRight: 16,
                        position: 'relative',
                        zIndex: 2,
                      }}
                    >
                      {isDone ? '✓' : index + 1}
                    </div>
                    <div style={{ flex: 1 }}>
                      <h4 style={{ margin: 0, color: isDone ? '#10b981' : isActive ? '#f59e0b' : '#6b7280' }}>
                        {step.title}
                      </h4>
                      <p style={{ margin: '4px 0 0 0', color: '#6b7280', fontSize: '0.9rem' }}>
                        {step.desc}
                      </p>
                    </div>
                    {index < steps.length - 1 && (
                      <div
                        style={{
                          position: 'absolute',
                          left: 20,
                          top: 40,
                          width: 2,
                          height: 24,
                          background: isDone ? '#10b981' : '#e5e7eb',
                          zIndex: 1,
                        }}
                      />
                    )}
                  </div>
                );
              })}
            </div>

            {!isDelivered && (
              <div
                className="panel"
                style={{
                  padding: 18,
                  marginTop: 28,
                  textAlign: "center",
                  borderRadius: 16,
                  maxWidth: 420,
                  marginLeft: "auto",
                  marginRight: "auto",
                }}
              >
                <h3 style={{ marginBottom: 8 }}>Delivery OTP</h3>

                <div
                  style={{
                    fontSize: "2.2rem",
                    fontWeight: "bold",
                    letterSpacing: 8,
                    margin: "12px 0",
                  }}
                >
                  {deliveryOtp}
                </div>

                <p className="muted" style={{ margin: 0 }}>
                  Share this OTP with the delivery partner only after receiving
                  your order.
                </p>
              </div>
            )}

            <div
              style={{
                display: "flex",
                gap: 12,
                justifyContent: "center",
                marginTop: 40,
                flexWrap: "wrap",
              }}
            >
              {!isDelivered && (
                <button className="btn btn-outline" onClick={cancel}>
                  Cancel order
                </button>
              )}

              {isDelivered && (
                <button
                  className="btn btn-primary"
                  onClick={() => nav(`/review/${id}`)}
                >
                  Leave a review →
                </button>
              )}

              <Link to="/orders" className="btn btn-ghost">
                My orders
              </Link>
            </div>
          </>
        )}
      </div>
    </div>
  );
}