import { Link, useNavigate } from "react-router-dom";
import { useCart } from "../store/cart";

export default function Cart() {
  const items = useCart((state) => state.items);
  const restaurantName = useCart((state) => state.restaurantName);
  const setQty = useCart((state) => state.setQty);
  const remove = useCart((state) => state.remove);
  const { sub, delivery, tax, total } = useCart((state) => state.totals());
  const navigate = useNavigate();

  if (items.length === 0) {
    return (
      <div className="page">
        <div className="page-header"><h1>Your cart</h1></div>
        <div className="empty-state">
          <div className="empty-state-emoji">🛒</div>
          <h3>Nothing here yet</h3>
          <p>Pick a restaurant and start building your order.</p>
          <Link to="/restaurants" className="btn btn-primary">Browse restaurants</Link>
        </div>
      </div>
    );
  }

  return (
    <div className="page">
      <div className="page-header">
        <h1>Your cart</h1>
        <p>From <strong>{restaurantName}</strong></p>
      </div>

      <div className="cart-layout">
        <div>
          {items.map((item) => (
            <div key={item.id} className="cart-line">
              <div className="cart-line-emoji">{item.emoji || "🍴"}</div>
              <div>
                <h4>{item.name}</h4>
                <span className="muted">₹{item.price} each</span>
              </div>
              <div className="qty">
                <button onClick={() => setQty(item.id, item.qty - 1)}>−</button>
                <span>{item.qty}</span>
                <button onClick={() => setQty(item.id, item.qty + 1)}>+</button>
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                <span className="cart-line-price">₹{item.price * item.qty}</span>
                <button className="icon-btn" onClick={() => remove(item.id)} title="Remove" style={{ fontSize: "0.9rem" }}>✕</button>
              </div>
            </div>
          ))}
        </div>

        <aside className="cart-summary">
          <h3>Summary</h3>
          <div className="summary-row"><span>Subtotal</span><span>₹{sub}</span></div>
          <div className="summary-row"><span>Delivery</span><span>{delivery === 0 ? "Free" : `₹${delivery}`}</span></div>
          <div className="summary-row"><span>Taxes</span><span>₹{tax}</span></div>
          <div className="summary-row total"><span>Total</span><span>₹{total}</span></div>
          <button className="btn btn-primary btn-block" style={{ marginTop: 8 }} onClick={() => navigate("/checkout")}>
            Checkout — ₹{total}
          </button>
        </aside>
      </div>
    </div>
  );
}
