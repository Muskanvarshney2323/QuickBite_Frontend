import { useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import Brand from "../components/Brand";
import { roleHome } from "../components/AppLayout";
import { useAuthStore } from "../store/auth";
import { useToast } from "../store/toast";

const roles = [
  { id: "Customer", label: "Order food", icon: "🍔" },
  { id: "RestaurantOwner", label: "List my kitchen", icon: "👩‍🍳" },
  { id: "DeliveryPartner", label: "Deliver orders", icon: "🛵" },
];

export default function Register() {
  const [params] = useSearchParams();

  const defaultRole =
    params.get("role") === "restaurant"
      ? "RestaurantOwner"
      : params.get("role") === "agent"
      ? "DeliveryPartner"
      : "Customer";

  const [role, setRole] = useState(defaultRole);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [address, setAddress] = useState("");
  const [password, setPassword] = useState("");

  const register = useAuthStore((state) => state.register);
  const loading = useAuthStore((state) => state.loading);
  const toast = useToast((state) => state.push);
  const navigate = useNavigate();

  const submit = async (e) => {
    e.preventDefault();

    if (!name || !email || !password || !address) {
      toast("Fill in all required fields", "error");
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email.trim())) {
      toast("Please enter a valid email address", "error");
      return;
    }

    const cleanPhone = phone.replace(/[^\d+]/g, "");
    if (!cleanPhone || cleanPhone.replace(/\D/g, "").length < 10) {
      toast("Please enter a valid phone number", "error");
      return;
    }

    if (password.length < 6) {
      toast("Password must be at least 6 characters", "error");
      return;
    }

    try {
      const selectedRole = role;

      const payload = {
        name: name.trim(),
        fullName: name.trim(),
        email: email.trim().toLowerCase(),
        phone: cleanPhone,
        address: address.trim(),
        password,
        role: selectedRole,
      };

      console.log("[REGISTER] Selected role:", selectedRole);
      console.log("[REGISTER] Sending payload:", payload);

      const result = await register(payload);

      console.log("[REGISTER] Backend response:", result);

      toast("Registration successful. Please login now.", "success");

      // Login page will redirect based on role after login
      navigate(`/login?from=${roleHome(selectedRole)}`);
    } catch (error) {
      console.error("[REGISTER] Error:", error);
      toast(error.message || error.data?.message || "Registration failed", "error");
    }
  };

  return (
    <div className="auth-wrap">
      <div className="auth-left">
        <div className="auth-card">
          <Brand />

          <h1 style={{ marginTop: 40 }}>
            Join{" "}
            <span className="italic" style={{ color: "var(--ember)" }}>
              QuickBite
            </span>
            .
          </h1>

          <p className="auth-sub">Pick how you want to show up.</p>

          <div className="role-picker">
            {roles.map((r) => (
              <div
                key={r.id}
                className={`role-tile ${role === r.id ? "active" : ""}`}
                onClick={() => setRole(r.id)}
              >
                <span className="role-tile-icon">{r.icon}</span>
                <span className="role-tile-label">{r.label}</span>
              </div>
            ))}
          </div>

          <form onSubmit={submit}>
            <div className="field">
              <label>Full name</label>
              <input
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Enter full name"
              />
            </div>

            <div className="field-row">
              <div className="field">
                <label>Email</label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@example.com"
                />
              </div>

              <div className="field">
                <label>Phone</label>
                <input
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="+91 98xxxxxxx"
                />
              </div>
            </div>

            <div className="field">
              <label>Address</label>
              <input
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                placeholder="Street, city, state"
              />
            </div>

            <div className="field">
              <label>Password</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
              />
            </div>

            <button type="submit" className="btn btn-primary btn-block" disabled={loading}>
              {loading ? "Creating..." : "Create account →"}
            </button>
          </form>

          <p className="auth-foot">
            Already have one? <Link to="/login">Sign in</Link>
          </p>
        </div>
      </div>

      <div className="auth-right">
        <Brand />

        <div className="auth-testimonial">
          <span className="eyebrow">Why join</span>
          <blockquote>
            {role === "DeliveryPartner"
              ? "Start delivering with clear order details: who ordered, where to pick up, and where to drop off."
              : "QuickBite connects customers, restaurants, and delivery agents in one simple platform."}
          </blockquote>
          <cite>— QuickBite platform</cite>
        </div>

        <div className="auth-footer">© 2026 QuickBite</div>
      </div>
    </div>
  );
}