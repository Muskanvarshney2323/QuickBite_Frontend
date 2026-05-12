import { Link } from "react-router-dom";
import Brand from "../components/Brand";

// Normalize role string to standard role names
export function normalizeRole(role) {
  if (!role) return "Customer";
  const upper = String(role).trim().toUpperCase();

  if (upper === "CUSTOMER" || upper === "USER" || upper === "GUEST") return "Customer";
  if (upper === "ADMIN" || upper === "ADMINISTRATOR") return "Admin";
  if (
    ["OWNER", "RESTAURANT", "RESTAURANTOWNER", "RESTAURANT_OWNER"].some((key) => upper.includes(key))
  ) {
    return "RestaurantOwner";
  }
  if (
    ["AGENT", "DELIVERYPARTNER", "DELIVERY_PARTNER", "DELIVERY", "DELIVERY_AGENT", "DELIVERY AGENT", "DELIVERY PARTNER"].some((key) => upper.includes(key))
  ) {
    return "DeliveryPartner";
  }

  return "Customer";
}

// Get home page URL based on user role
export function roleHome(role) {
  const normalized = normalizeRole(role);
  switch (normalized) {
    case "Admin":
      return "/admin/dashboard";
    case "RestaurantOwner":
      return "/restaurant/dashboard";
    case "DeliveryPartner":
      return "/agent/dashboard";
    case "Customer":
    default:
      return "/restaurants";
  }
}

export default function Landing() {
  const primary = { to: "/register", label: "Get started — it's free" };

  return (
    <>
      <nav className="landing-nav">
        <Brand />

        <div className="landing-nav-links">
          <a href="#features">Features</a>
          <a href="#how">How it works</a>
          <Link to="/restaurants">Browse</Link>
        </div>

        <div className="nav-cta">
          <Link to="/login" className="btn btn-outline btn-sm">
            Log in
          </Link>
          <Link to="/register" className="btn btn-ink btn-sm">
            Sign up
          </Link>
        </div>
      </nav>

      <section className="hero">
        <div className="hero-left">
          <span className="eyebrow">Food, fast</span>

          <h1>
            Hot meals,<br />
            delivered <span className="italic">in a hurry</span>.
          </h1>

          <p className="hero-lead">
            Discover neighbourhood kitchens, order quickly, and track your food from kitchen to doorstep.
          </p>

          <div className="hero-cta">
            <Link to={primary.to} className="btn btn-primary">
              {primary.label}
            </Link>

            <Link to="/restaurants" className="btn btn-ghost">
              Browse restaurants →
            </Link>
          </div>

          <div className="hero-meta">
            <div className="hero-meta-item">
              <span className="hero-meta-num">20 min</span>
              <span className="hero-meta-label">Median delivery</span>
            </div>

            <div className="hero-meta-item">
              <span className="hero-meta-num">1.2k+</span>
              <span className="hero-meta-label">Kitchens on board</span>
            </div>

            <div className="hero-meta-item">
              <span className="hero-meta-num">4.8 ★</span>
              <span className="hero-meta-label">Avg. rating</span>
            </div>
          </div>
        </div>

        <div className="hero-right">
          <div className="food-card card-1">
            <span className="food-emoji">🍜</span>
            <div className="food-name">Spicy ramen</div>
            <div className="food-sub">18 min · ₹320</div>
          </div>

          <div className="food-card card-2">
            <span className="food-emoji">🍕</span>
            <div className="food-name">Margherita</div>
            <div className="food-sub">22 min · ₹280</div>
          </div>

          <div className="food-card card-3">
            <span className="food-emoji">🍔</span>
            <div className="food-name">Smash burger</div>
            <div className="food-sub">15 min · ₹240</div>
          </div>

          <div className="food-card card-4">
            <span className="food-emoji">🥘</span>
            <div className="food-name">Biryani</div>
            <div className="food-sub">20 min · ₹360</div>
          </div>
        </div>
      </section>

      <section className="features" id="features">
        <div className="features-inner">
          <h2>
            Built for everyone who <span className="italic">touches the plate</span>.
          </h2>

          <div className="feature-grid">
            <div className="feature-card">
              <span className="feature-icon">🍽️</span>
              <h3>For customers</h3>
              <p>Browse restaurants, add food to cart, place orders, and track delivery.</p>
            </div>

            <div className="feature-card">
              <span className="feature-icon">👩‍🍳</span>
              <h3>For restaurants</h3>
              <p>Manage menus, update availability, and process incoming orders.</p>
            </div>

            <div className="feature-card">
              <span className="feature-icon">🛵</span>
              <h3>For agents</h3>
              <p>View assigned deliveries and update delivery status.</p>
            </div>

            <div className="feature-card">
              <span className="feature-icon">🛡️</span>
              <h3>For admins</h3>
              <p>Approve restaurants, verify agents, and monitor platform activity.</p>
            </div>
          </div>
        </div>
      </section>

      <section className="how" id="how">
        <div className="how-header">
          <h2>
            How it <span className="italic">works</span>.
          </h2>
          <p>Three simple steps to get your food delivered.</p>
        </div>

        <div className="how-steps">
          <div className="how-step">
            <span className="how-step-num">01</span>
            <h3>Pick a restaurant</h3>
            <p>Search and browse restaurants based on cuisine, rating, and delivery time.</p>
          </div>

          <div className="how-step">
            <span className="how-step-num">02</span>
            <h3>Place your order</h3>
            <p>Add menu items to cart and checkout with your preferred payment mode.</p>
          </div>

          <div className="how-step">
            <span className="how-step-num">03</span>
            <h3>Track delivery</h3>
            <p>Follow order status from placed to delivered.</p>
          </div>
        </div>
      </section>

      <footer className="footer">
        <div className="footer-bottom">
          <span>© 2026 QuickBite · Food, fast.</span>
        </div>
      </footer>
    </>
  );
}