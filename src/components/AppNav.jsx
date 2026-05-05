import { useEffect, useRef, useState } from "react";
import { Link, NavLink, useNavigate } from "react-router-dom";
import { useAuthStore } from "../store/auth";
import { useCart } from "../store/cart";
import Brand from "./Brand";

export default function AppNav() {
  const user = useAuthStore((state) => state.user);
  const logout = useAuthStore((state) => state.logout);
  const cartCount = useCart((state) => state.count());
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);
  const ref = useRef(null);

  useEffect(() => {
    const handler = (event) => {
      if (ref.current && !ref.current.contains(event.target)) setOpen(false);
    };
    document.addEventListener("click", handler);
    return () => document.removeEventListener("click", handler);
  }, []);

  const role = user?.role || "Customer";

  const links = (() => {
    if (role === "RestaurantOwner") return [{ to: "/restaurant/dashboard", label: "Dashboard" }];
    if (role === "DeliveryPartner") return [{ to: "/agent/dashboard", label: "Dashboard" }];
    if (role === "Admin") return [{ to: "/admin/dashboard", label: "Dashboard" }];
    return [
      { to: "/restaurants", label: "Restaurants" },
      { to: "/orders", label: "My orders" },
    ];
  })();

  const initials = (user?.name || "U")
    .split(" ")
    .map((part) => part[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();

  const doLogout = () => {
    logout();
    navigate("/login");
  };

  return (
    <nav className="app-nav">
      <Link to={links[0]?.to || "/restaurants"}>
        <Brand />
      </Link>

      <div className="app-nav-links">
        {links.map((link) => (
          <NavLink key={link.to} to={link.to} className={({ isActive }) => (isActive ? "active" : "")}>
            {link.label}
          </NavLink>
        ))}
      </div>

      <div className="app-nav-right">
        {role === "Customer" && (
          <Link to="/cart" className="icon-btn" aria-label="Cart">
            <span>🛒</span>
            {cartCount > 0 && <span className="cart-badge">{cartCount}</span>}
          </Link>
        )}

        <div ref={ref} style={{ position: "relative" }}>
          <button className="user-chip" onClick={() => setOpen((value) => !value)}>
            <span className="avatar">{initials}</span>
            <span>{user?.name || "User"}</span>
          </button>

          {open && (
            <div className="user-menu">
              <span style={{ display: "block", padding: "10px 16px", fontSize: "0.78rem", color: "var(--ink-3)", borderBottom: "1px solid var(--line)" }}>
                {user?.email} · {role}
              </span>
              {role === "Customer" && <Link to="/orders" onClick={() => setOpen(false)}>My orders</Link>}
              <button onClick={doLogout}>Log out</button>
            </div>
          )}
        </div>
      </div>
    </nav>
  );
}
