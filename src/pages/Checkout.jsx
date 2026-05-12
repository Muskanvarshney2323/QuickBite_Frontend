import { useState } from "react";
import { useNavigate, Navigate } from "react-router-dom";
import { useCart } from "../store/cart";
import { useToast } from "../store/toast";
import { API } from "../api/client";

const paymentMethods = [
  { id: "CARD", label: "Card", icon: "💳" },
  { id: "UPI", label: "UPI", icon: "📱" },
  { id: "WALLET", label: "Wallet", icon: "👛" },
  { id: "COD", label: "Cash", icon: "💵" },
];

export default function Checkout() {
  const items = useCart((s) => s.items);
  const restaurantId = useCart((s) => s.restaurantId);
  const restaurantName = useCart((s) => s.restaurantName);
  const totals = useCart((s) => s.totals());
  const clear = useCart((s) => s.clear);

  const [addr, setAddr] = useState({
    line1: "",
    city: "",
    pin: "",
    phone: "",
  });

  const [method, setMethod] = useState("UPI");

  const [paymentDetails, setPaymentDetails] = useState({
    upiId: "",
    cardNumber: "",
    expiry: "",
    cvv: "",
    walletMobile: "",
  });

  const [loading, setLoading] = useState(false);
  const [paymentError, setPaymentError] = useState(null);

  const toast = useToast((s) => s.push);
  const nav = useNavigate();

  if (items.length === 0) {
    return <Navigate to="/cart" replace />;
  }

  const validatePaymentDetails = () => {
    if (method === "UPI" && !paymentDetails.upiId.trim()) {
      toast("Please enter your UPI ID", "error");
      return false;
    }

    if (method === "CARD") {
      if (
        !paymentDetails.cardNumber.trim() ||
        !paymentDetails.expiry.trim() ||
        !paymentDetails.cvv.trim()
      ) {
        toast("Please enter complete card details", "error");
        return false;
      }
    }

    if (method === "WALLET" && !paymentDetails.walletMobile.trim()) {
      toast("Please enter wallet mobile number", "error");
      return false;
    }

    return true;
  };

  const place = async () => {
    if (!addr.line1.trim() || !addr.phone.trim()) {
      toast("Enter address and phone", "error");
      return;
    }

    if (!validatePaymentDetails()) {
      return;
    }

    setLoading(true);
    setPaymentError(null);

    try {
      const order = await API.placeOrder({
        restaurantId,
        restaurantName,
        items,
        totals,
        address: addr,
        paymentMethod: method,
      });

      const finalOrderId = order.id || order.orderId || order.orderID;

      if (!finalOrderId) {
        throw new Error("Order created but orderId was not returned.");
      }

      if (method !== "COD") {
        await API.pay({
          orderId: finalOrderId,
          method,
          amount: totals.total,
        });
      }

      clear();
      toast("Order placed successfully!", "success");
      nav(`/track/${finalOrderId}`);
    } catch (error) {
      console.error("Checkout error:", error);
      const errorMsg =
        error.message || "Failed to place order/payment. Please try again.";
      setPaymentError(errorMsg);
      toast(errorMsg, "error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="page">
      <div className="page-header">
        <h1>Checkout</h1>
        <p>One more step and it's on the way.</p>
      </div>

      <div className="cart-layout">
        <div>
          <section className="panel">
            <h3 style={{ marginBottom: 16 }}>Delivery address</h3>

            <div className="field">
              <label>Address line</label>
              <input
                value={addr.line1}
                onChange={(e) => setAddr({ ...addr, line1: e.target.value })}
                placeholder="House no, street, landmark"
                disabled={loading}
              />
            </div>

            <div className="field-row">
              <div className="field">
                <label>City</label>
                <input
                  value={addr.city}
                  onChange={(e) => setAddr({ ...addr, city: e.target.value })}
                  disabled={loading}
                />
              </div>

              <div className="field">
                <label>PIN</label>
                <input
                  value={addr.pin}
                  onChange={(e) => setAddr({ ...addr, pin: e.target.value })}
                  disabled={loading}
                />
              </div>
            </div>

            <div className="field">
              <label>Phone</label>
              <input
                value={addr.phone}
                onChange={(e) => setAddr({ ...addr, phone: e.target.value })}
                placeholder="+91 98xxxxxxx"
                disabled={loading}
              />
            </div>
          </section>

          <section className="panel" style={{ marginTop: 20 }}>
            <h3 style={{ marginBottom: 16 }}>Payment method</h3>

            <div className="pay-picker">
              {paymentMethods.map((m) => (
                <div
                  key={m.id}
                  className={`pay-tile ${method === m.id ? "active" : ""}`}
                  onClick={() => !loading && setMethod(m.id)}
                  style={{
                    cursor: loading ? "not-allowed" : "pointer",
                    opacity: loading ? 0.5 : 1,
                  }}
                >
                  <span className="pay-tile-icon">{m.icon}</span>
                  <span className="pay-tile-label">{m.label}</span>
                </div>
              ))}
            </div>

            {method === "UPI" && (
              <div className="field" style={{ marginTop: 16 }}>
                <label>UPI ID</label>
                <input
                  value={paymentDetails.upiId}
                  onChange={(e) =>
                    setPaymentDetails({
                      ...paymentDetails,
                      upiId: e.target.value,
                    })
                  }
                  placeholder="example@upi"
                  disabled={loading}
                />
              </div>
            )}

            {method === "CARD" && (
              <div style={{ marginTop: 16 }}>
                <div className="field">
                  <label>Card number</label>
                  <input
                    value={paymentDetails.cardNumber}
                    onChange={(e) =>
                      setPaymentDetails({
                        ...paymentDetails,
                        cardNumber: e.target.value,
                      })
                    }
                    placeholder="1234 5678 9012 3456"
                    maxLength="19"
                    disabled={loading}
                  />
                </div>

                <div className="field-row">
                  <div className="field">
                    <label>Expiry</label>
                    <input
                      value={paymentDetails.expiry}
                      onChange={(e) =>
                        setPaymentDetails({
                          ...paymentDetails,
                          expiry: e.target.value,
                        })
                      }
                      placeholder="MM/YY"
                      maxLength="5"
                      disabled={loading}
                    />
                  </div>

                  <div className="field">
                    <label>CVV</label>
                    <input
                      type="password"
                      value={paymentDetails.cvv}
                      onChange={(e) =>
                        setPaymentDetails({
                          ...paymentDetails,
                          cvv: e.target.value,
                        })
                      }
                      placeholder="123"
                      maxLength="3"
                      disabled={loading}
                    />
                  </div>
                </div>
              </div>
            )}

            {method === "WALLET" && (
              <div className="field" style={{ marginTop: 16 }}>
                <label>Wallet mobile number</label>
                <input
                  value={paymentDetails.walletMobile}
                  onChange={(e) =>
                    setPaymentDetails({
                      ...paymentDetails,
                      walletMobile: e.target.value,
                    })
                  }
                  placeholder="+91 98xxxxxxx"
                  disabled={loading}
                />
              </div>
            )}

            {method === "COD" && (
              <p className="muted" style={{ fontSize: "0.85rem", marginTop: 12 }}>
                Pay in cash when the order arrives.
              </p>
            )}
          </section>

          {paymentError && (
            <div
              className="panel"
              style={{
                marginTop: 20,
                background: "rgba(220, 50, 50, 0.05)",
                border: "1px solid rgba(220, 50, 50, 0.2)",
                borderRadius: 8,
                padding: 12,
              }}
            >
              <p style={{ margin: 0, color: "#c83232", fontSize: "0.9rem" }}>
                <strong>⚠️ Error:</strong> {paymentError}
              </p>
            </div>
          )}
        </div>

        <aside className="cart-summary">
          <h3>Your order</h3>

          {items.map((i) => (
            <div key={i.id} className="summary-row">
              <span>
                {i.qty}× {i.name}
              </span>
              <span>₹{i.price * i.qty}</span>
            </div>
          ))}

          <div className="summary-row" style={{ marginTop: 12 }}>
            <span>Subtotal</span>
            <span>₹{totals.sub}</span>
          </div>

          <div className="summary-row">
            <span>Delivery</span>
            <span>
              {totals.delivery === 0 ? "Free" : `₹${totals.delivery}`}
            </span>
          </div>

          <div className="summary-row">
            <span>Taxes</span>
            <span>₹{totals.tax}</span>
          </div>

          <div className="summary-row total">
            <span>Pay now</span>
            <span>₹{totals.total}</span>
          </div>

          <button
            className="btn btn-primary btn-block"
            onClick={place}
            disabled={loading}
            style={{ marginTop: 12 }}
          >
            {loading ? "Placing order…" : `Place order — ₹${totals.total}`}
          </button>
        </aside>
      </div>
    </div>
  );
}