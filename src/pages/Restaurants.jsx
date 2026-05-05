import { useEffect, useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { API } from '../api/client';

export default function Restaurants() {
  const [restaurants, setRestaurants] = useState([]);
  const [query, setQuery] = useState('');
  const [cuisine, setCuisine] = useState('All');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadRestaurants = async () => {
      try {
        setLoading(true);
        setRestaurants(await API.listRestaurants());
      } finally {
        setLoading(false);
      }
    };

    loadRestaurants();
  }, []);

  const cuisines = useMemo(() => {
    const names = restaurants.map((r) => r.cuisine).filter(Boolean);
    return ['All', ...Array.from(new Set(names))];
  }, [restaurants]);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return restaurants.filter((r) => {
      if (cuisine !== 'All' && r.cuisine !== cuisine) return false;
      if (q && !(r.name + r.cuisine).toLowerCase().includes(q)) return false;
      return true;
    });
  }, [restaurants, query, cuisine]);

  const greeting = (() => {
    const h = new Date().getHours();
    if (h < 11) return 'Good morning';
    if (h < 17) return 'Good afternoon';
    return 'Good evening';
  })();

  return (
    <div className="page">
      <div className="hero-strip">
        <div className="hero-strip-inner">
          <span className="eyebrow">{greeting}</span>
          <h1>What are you <span className="italic">hungry</span> for?</h1>
          <div className="search-bar">
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search restaurants or cuisines…"
            />
            <button className="btn btn-primary btn-sm">Search</button>
          </div>
        </div>
      </div>

      <div className="cuisine-chips">
        {cuisines.map((c) => (
          <button
            key={c}
            className={`chip ${cuisine === c ? 'active' : ''}`}
            onClick={() => setCuisine(c)}
          >
            {c}
          </button>
        ))}
      </div>

      {loading ? (
        <p className="muted">Loading kitchens…</p>
      ) : filtered.length === 0 ? (
        <div className="empty-state">
          <div className="empty-state-emoji">🍽️</div>
          <h3>No kitchens match</h3>
          <p>Try different search or cuisine.</p>
        </div>
      ) : (
        <div className="restaurant-grid">
          {filtered.map((r) => (
            <Link key={r.id} to={`/restaurants/${r.id}`} className="restaurant-tile">
              <div className="tile-image">
                {r.emoji}
                {r.tag && <span className="tile-badge">{r.tag}</span>}
              </div>
              <div className="tile-body">
                <h3>{r.name}</h3>
                <div className="muted" style={{ fontSize: '0.88rem' }}>{r.cuisine}</div>
                <div className="tile-meta">
                  <span className="rating">★ {r.rating}</span>
                  <span>· {r.eta} min</span>
                  <span>· ₹{r.priceFor2} for two</span>
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
