import { useState } from 'react';
import { useNavigate, Navigate } from 'react-router-dom';
import { useCart } from '../store/cart';
import { useToast } from '../store/toast';
import { API } from '../api/client';

const paymentMethods = [
  { id: 'CARD', label: 'Card', icon: '💳' },
  { id: 'UPI', label: 'UPI', icon: '📱' },
  { id: 'WALLET', label: 'Wallet', icon: '👛' },
  { id: 'COD', label: 'Cash', icon: '💵' },
];

export default function Checkout() {
  const items = useCart((s) => s.items);
  const restaurantId = useCart((s) => s.restaurantId);
  const restaurantName = useCart((s) => s.restaurantName);
  const totals = useCart((s) => s.totals());
  const clear = useCart((s) => s.clear);

  const [addr, setAddr] = useState({ line1: '', city: 'Mathura', pin: '281001', phone: '' });
  const [method, setMethod] = useState('UPI');
  const [loading, setLoading] = useState(false);

  const toast = useToast((s) => s.push);
  const nav = useNavigate();

  if (items.length === 0) return <Navigate to="/cart" replace />;

  const place = async () => {
    if (!addr.line1 || !addr.phone) return toast('Enter address and phone', 'error');
    setLoading(true);
    try {
      const order = await API.placeOrder({
        restaurantId,
        restaurantName,
        items,
        totals,
        address: addr,
        paymentMethod: method,
      });
      await API.pay({ orderId: order.id, method, amount: totals.total });
      clear();
      toast('Order placed!', 'success');
      nav(`/track/${order.id}`);
    } catch (error) {
      toast(error.message || 'Something went wrong', 'error');
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
              />
            </div>
            <div className="field-row">
              <div className="field">
                <label>City</label>
                <input value={addr.city} onChange={(e) => setAddr({ ...addr, city: e.target.value })} />
              </div>
              <div className="field">
                <label>PIN</label>
                <input value={addr.pin} onChange={(e) => setAddr({ ...addr, pin: e.target.value })} />
              </div>
            </div>
            <div className="field">
              <label>Phone</label>
              <input value={addr.phone} onChange={(e) => setAddr({ ...addr, phone: e.target.value })} placeholder="+91 98xxxxxxx" />
            </div>
          </section>

          <section className="panel" style={{ marginTop: 20 }}>
            <h3 style={{ marginBottom: 16 }}>Payment method</h3>
            <div className="pay-picker">
              {paymentMethods.map((m) => (
                <div
                  key={m.id}
                  className={`pay-tile ${method === m.id ? 'active' : ''}`}
                  onClick={() => setMethod(m.id)}
                >
                  <span className="pay-tile-icon">{m.icon}</span>
                  <span className="pay-tile-label">{m.label}</span>
                </div>
              ))}
            </div>
            <p className="muted" style={{ fontSize: '0.85rem' }}>
              {method === 'COD'
                ? 'Pay in cash when the order arrives.'
                : 'Secure payment, we never store your card.'}
            </p>
          </section>
        </div>

        <aside className="cart-summary">
          <h3>Your order</h3>
          {items.map((i) => (
            <div key={i.id} className="summary-row">
              <span>{i.qty}× {i.name}</span>
              <span>₹{i.price * i.qty}</span>
            </div>
          ))}
          <div className="summary-row" style={{ marginTop: 12 }}><span>Subtotal</span><span>₹{totals.sub}</span></div>
          <div className="summary-row"><span>Delivery</span><span>{totals.delivery === 0 ? 'Free' : `₹${totals.delivery}`}</span></div>
          <div className="summary-row"><span>Taxes</span><span>₹{totals.tax}</span></div>
          <div className="summary-row total"><span>Pay now</span><span>₹{totals.total}</span></div>
          <button className="btn btn-primary btn-block" onClick={place} disabled={loading} style={{ marginTop: 12 }}>
            {loading ? 'Placing order…' : `Place order — ₹${totals.total}`}
          </button>
        </aside>
      </div>
    </div>
  );
}
