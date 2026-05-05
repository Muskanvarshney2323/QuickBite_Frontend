import { useEffect, useState } from 'react';
import { API } from '../api/client';

export default function Notifications() {
  const [items, setItems] = useState([]);

  useEffect(() => {
    API.listNotifications().then(setItems);
  }, []);

  const markRead = (id) => {
    setItems((list) => list.map((n) => (n.id === id ? { ...n, unread: false } : n)));
  };

  return (
    <div className="page">
      <div className="page-header">
        <h1>Notifications</h1>
        <p>Order updates, promos, and little nudges.</p>
      </div>

      {items.length === 0 ? (
        <div className="empty-state">
          <div className="empty-state-emoji">🔔</div>
          <h3>All quiet</h3>
          <p>You're caught up.</p>
        </div>
      ) : (
        <div className="notif-list">
          {items.map((n) => (
            <div key={n.id} className={`notif-row ${n.unread ? 'unread' : ''}`} onClick={() => markRead(n.id)}>
              <div className="notif-icon">{n.icon}</div>
              <div className="notif-body">
                <h4>{n.title}</h4>
                <p>{n.body}</p>
                <span className="notif-time">{n.time} · {n.type}</span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
