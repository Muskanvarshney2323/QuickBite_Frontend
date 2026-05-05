import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { API } from '../api/client';

const statusBadge = (s) => {
  if (s === 'DELIVERED') return 'badge badge-success';
  if (s === 'CANCELLED') return 'badge badge-danger';
  if (s === 'OUT_FOR_DELIVERY' || s === 'PREPARING') return 'badge badge-warn';
  return 'badge badge-info';
};

export default function Orders() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadOrders = async () => {
      try {
        setLoading(true);
        setOrders(await API.listOrders());
      } finally {
        setLoading(false);
      }
    };

    loadOrders();
  }, []);

  return (
    <div className="page">
      <div className="page-header">
        <h1>My orders</h1>
        <p>A history of everything you've ordered from QuickBite.</p>
      </div>

      {loading ? (
        <p className="muted">Loading…</p>
      ) : orders.length === 0 ? (
        <div className="empty-state">
          <div className="empty-state-emoji">🍽️</div>
          <h3>No orders yet</h3>
          <p>Place your first order in under a minute.</p>
          <Link to="/restaurants" className="btn btn-primary">Browse kitchens</Link>
        </div>
      ) : (
        <div className="panel" style={{ padding: 0, overflow: 'hidden' }}>
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
                  <td><strong>#{o.id}</strong></td>
                  <td>{o.restaurantName}</td>
                  <td>{o.date}</td>
                  <td>{o.items}</td>
                  <td><strong>₹{o.total}</strong></td>
                  <td><span className={statusBadge(o.status)}>{o.status.replace(/_/g, ' ')}</span></td>
                  <td>
                    <Link to={`/track/${o.id}`} className="btn btn-outline btn-sm">View</Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
