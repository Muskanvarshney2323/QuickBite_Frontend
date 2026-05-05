import { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { API } from '../api/client';
import { useToast } from '../store/toast';

const steps = [
  { key: 'PLACED', title: 'Order placed', desc: 'Kitchen is confirming your items' },
  { key: 'CONFIRMED', title: 'Kitchen confirmed', desc: 'Your order has been accepted' },
  { key: 'PREPARING', title: 'Preparing', desc: 'Your food is being cooked' },
  { key: 'PICKED_UP', title: 'Picked up', desc: 'Delivery agent has picked up the order' },
  { key: 'OUT_FOR_DELIVERY', title: 'Out for delivery', desc: 'Agent is on the way' },
  { key: 'DELIVERED', title: 'Delivered', desc: 'Enjoy your meal!' },
];

export default function Track() {
  const { id } = useParams();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [cancelled, setCancelled] = useState(false);
  const toast = useToast((s) => s.push);
  const nav = useNavigate();

  const loadOrder = async () => {
    try {
      const data = await API.getOrder(id);
      setOrder(data);
      setCancelled(data.status === 'CANCELLED');
    } catch (error) {
      toast(error.message || 'Could not load order', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadOrder();
    const interval = setInterval(loadOrder, 10000);
    return () => clearInterval(interval);
  }, [id]);

  const cancel = async () => {
    if (!confirm('Cancel this order?')) return;
    try {
      await API.cancelOrder(id);
      setCancelled(true);
      setOrder((current) => ({ ...current, status: 'CANCELLED' }));
      toast('Order cancelled', 'default');
    } catch (error) {
      toast(error.message || 'Cancel failed', 'error');
    }
  };

  const status = order?.status || 'PLACED';
  const activeIdx = Math.max(0, steps.findIndex((s) => s.key === status));
  const isDelivered = status === 'DELIVERED';

  if (loading) return <div className="page"><div className="empty-state"><h3>Loading order...</h3></div></div>;

  return (
    <div className="page">
      <div className="tracker-wrap">
        <div className="tracker-head">
          <span className="eyebrow">Order #{id}</span>
          <h1>{cancelled ? 'Cancelled' : isDelivered ? 'Delivered.' : 'Track your order'}</h1>
          {!cancelled && !isDelivered && <p className="tracker-eta">Current status · <strong>{status.replace(/_/g, ' ')}</strong></p>}
        </div>

        {cancelled ? (
          <div className="empty-state">
            <div className="empty-state-emoji">❌</div>
            <h3>This order was cancelled</h3>
            <p>Refund, if any, will reach you in 3–5 business days.</p>
            <Link to="/restaurants" className="btn btn-primary">Order something else</Link>
          </div>
        ) : (
          <>
            <div className="tracker-timeline">
              {steps.map((s, i) => (
                <div key={s.key} className={`tracker-step ${i < activeIdx || (i === activeIdx && isDelivered) ? 'done' : i === activeIdx ? 'active' : ''}`}>
                  <h4>{s.title}</h4>
                  <p>{s.desc}</p>
                </div>
              ))}
            </div>

            <div style={{ display: 'flex', gap: 12, justifyContent: 'center', marginTop: 40 }}>
              {!isDelivered && <button className="btn btn-outline" onClick={cancel}>Cancel order</button>}
              {isDelivered && <button className="btn btn-primary" onClick={() => nav(`/review/${id}`)}>Leave a review →</button>}
              <Link to="/orders" className="btn btn-ghost">My orders</Link>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
