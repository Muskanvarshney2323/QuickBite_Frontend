import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { API } from "../api/client";
import { useAuthStore } from "../store/auth";
import { useToast } from "../store/toast";

export default function CustomerDashboard() {
  const user = useAuthStore((state) => state.user);
  const toast = useToast((state) => state.push);
  const [restaurants, setRestaurants] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchRestaurants = async () => {
      try {
        setLoading(true);
        setRestaurants(await API.getRestaurants());
      } catch (error) {
        toast(error.message || "Failed to load restaurants", "error");
      } finally {
        setLoading(false);
      }
    };

    fetchRestaurants();
  }, [toast]);

  return (
    <div className="page">
      <div className="page-header">
        <h1>Welcome, {user?.name || "Customer"} 👋</h1>
        <p>Browse restaurants and order your favorite food.</p>
      </div>

      <h2 style={{ marginBottom: 18 }}>Available Restaurants</h2>

      {loading && <p className="muted">Loading restaurants...</p>}

      {!loading && restaurants.length === 0 && (
        <div className="empty-state">
          <div className="empty-state-emoji">🍽️</div>
          <h3>No restaurants found</h3>
          <p>Add restaurants from backend Swagger/database, then refresh this page.</p>
        </div>
      )}

      {!loading && restaurants.length > 0 && (
        <div className="restaurant-grid">
          {restaurants.map((restaurant) => (
            <Link key={restaurant.id} to={`/restaurants/${restaurant.id}`} className="restaurant-tile">
              <div className="tile-image">{restaurant.emoji}</div>
              <div className="tile-body">
                <h3>{restaurant.name}</h3>
                <div className="muted" style={{ fontSize: "0.88rem" }}>{restaurant.cuisine}</div>
                <div className="tile-meta">
                  <span className="rating">★ {restaurant.rating}</span>
                  <span>· {restaurant.eta} min</span>
                  <span>· ₹{restaurant.minimumOrderAmount || restaurant.priceFor2} minimum</span>
                </div>
                {restaurant.city && <p className="muted" style={{ marginTop: 8 }}>{restaurant.city}</p>}
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
