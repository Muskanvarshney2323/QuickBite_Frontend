import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { API } from '../api/client';
import { useToast } from '../store/toast';

function StarRow({ value, onChange }) {
  const [hover, setHover] = useState(0);
  const display = hover || value;
  return (
    <div style={{ display: 'flex', gap: 4, marginBottom: 8 }}>
      {[1, 2, 3, 4, 5].map((n) => (
        <button
          type="button"
          key={n}
          onClick={() => onChange(n)}
          onMouseEnter={() => setHover(n)}
          onMouseLeave={() => setHover(0)}
          style={{
            fontSize: '1.8rem',
            color: n <= display ? 'var(--mustard)' : 'var(--line)',
            transition: 'color 0.15s',
            padding: 0,
            lineHeight: 1,
          }}
          aria-label={`${n} star${n > 1 ? 's' : ''}`}
        >
          ★
        </button>
      ))}
    </div>
  );
}

export default function Review() {
  const { id } = useParams();
  const [food, setFood] = useState(5);
  const [delivery, setDelivery] = useState(5);
  const [body, setBody] = useState('');
  const [loading, setLoading] = useState(false);

  const toast = useToast((s) => s.push);
  const nav = useNavigate();

  const submit = async () => {
    setLoading(true);
    try {
      await API.submitReview({ orderId: id, foodRating: food, deliveryRating: delivery, body });
      toast('Thanks for the review!', 'success');
      nav('/orders');
    } catch {
      toast('Could not submit', 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="page">
      <div className="page-header" style={{ textAlign: 'center' }}>
        <span className="eyebrow">Order #{id}</span>
        <h1>How was it?</h1>
        <p>Your ratings help the kitchen and the agent get better.</p>
      </div>

      <div className="review-card">
        <h3>Food quality</h3>
        <StarRow value={food} onChange={setFood} />
        <p className="muted" style={{ fontSize: '0.85rem', marginBottom: 24 }}>
          {['', 'Not great', 'Could be better', 'Decent', 'Really good', 'Loved it'][food]}
        </p>

        <h3>Delivery experience</h3>
        <StarRow value={delivery} onChange={setDelivery} />
        <p className="muted" style={{ fontSize: '0.85rem', marginBottom: 24 }}>
          {['', 'Not great', 'Could be better', 'On time', 'Quick', 'Faster than expected'][delivery]}
        </p>

        <div className="field">
          <label>Tell us more (optional)</label>
          <textarea
            value={body}
            onChange={(e) => setBody(e.target.value)}
            placeholder="The biryani was perfectly spiced, agent was friendly…"
          />
        </div>

        <button className="btn btn-primary btn-block" onClick={submit} disabled={loading}>
          {loading ? 'Submitting…' : 'Submit review'}
        </button>
      </div>
    </div>
  );
}
