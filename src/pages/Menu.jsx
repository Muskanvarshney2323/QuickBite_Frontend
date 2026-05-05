import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { API } from '../api/client';
import { useCart } from '../store/cart';
import { useToast } from '../store/toast';

export default function Menu() {
  const { id } = useParams();
  const [data, setData] = useState(null);
  const [activeCat, setActiveCat] = useState(null);

  const add = useCart((s) => s.add);
  const toast = useToast((s) => s.push);

  useEffect(() => {
    const loadMenu = async () => {
      try {
        const menuData = await API.getMenu(id);
        setData(menuData);
        setActiveCat(menuData.categories[0]?.id);
      } catch (error) {
        toast(error.message || 'Failed to load menu', 'error');
        setData({ restaurant: null, categories: [] });
      }
    };

    loadMenu();
  }, [id, toast]);

  if (!data) return <div className="page"><p className="muted">Loading menu…</p></div>;

  const { restaurant, categories } = data;

  if (!restaurant) {
    return (
      <div className="page">
        <div className="empty-state">
          <div className="empty-state-emoji">🍽️</div>
          <h3>Menu not available</h3>
          <p>Please add menu items for this restaurant from your backend.</p>
        </div>
      </div>
    );
  }

  const scrollToCat = (cid) => {
    setActiveCat(cid);
    const el = document.getElementById(`cat-${cid}`);
    if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  const addItem = (item) => {
    add(item, restaurant);
    toast(`Added ${item.name}`, 'success');
  };

  return (
    <div className="page">
      <div className="restaurant-header">
        <div className="restaurant-header-emoji">{restaurant.emoji}</div>
        <div className="restaurant-header-body">
          <span className="eyebrow">{restaurant.cuisine}</span>
          <h1>{restaurant.name}</h1>
          <p className="muted">{restaurant.desc}</p>
          <div className="restaurant-header-meta">
            <span><span className="rating">★ {restaurant.rating}</span></span>
            <span>· {restaurant.eta} min</span>
            <span>· ₹{restaurant.priceFor2} for two</span>
          </div>
        </div>
      </div>

      <div className="menu-layout">
        <aside className="menu-side">
          <h4>On the menu</h4>
          <ul>
            {categories.map((c) => (
              <li key={c.id}>
                <a
                  href={`#cat-${c.id}`}
                  className={activeCat === c.id ? 'active' : ''}
                  onClick={(e) => {
                    e.preventDefault();
                    scrollToCat(c.id);
                  }}
                >
                  {c.name} <span className="muted" style={{ fontSize: '0.8rem' }}>· {c.items.length}</span>
                </a>
              </li>
            ))}
          </ul>
        </aside>

        <div>
          {categories.map((c) => (
            <section key={c.id} id={`cat-${c.id}`} className="menu-section">
              <h2>{c.name}</h2>
              {c.items.map((it) => (
                <div key={it.id} className="menu-item">
                  <div>
                    <h3>
                      <span className={`dietary-dot ${it.veg ? '' : 'nonveg'}`}></span>
                      {it.name}
                    </h3>
                    <p>{it.desc}</p>
                    <span className="menu-item-price">₹{it.price}</span>
                  </div>
                  <div className="menu-item-right">
                    <div style={{ fontSize: '2.4rem' }}>{it.emoji}</div>
                    <button className="btn btn-primary btn-sm" onClick={() => addItem(it)}>
                      Add
                    </button>
                  </div>
                </div>
              ))}
            </section>
          ))}
        </div>
      </div>
    </div>
  );
}
