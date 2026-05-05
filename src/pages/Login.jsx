import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import Brand from "../components/Brand";
import { useAuthStore } from "../store/auth";
import { useToast } from "../store/toast";

function roleHome(role) {
  if (role === "Admin") return "/admin/dashboard";
  if (role === "RestaurantOwner") return "/restaurant/dashboard";
  if (role === "DeliveryPartner") return "/agent/dashboard";
  return "/restaurants";
}

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const login = useAuthStore((state) => state.login);
  const loading = useAuthStore((state) => state.loading);
  const toast = useToast((state) => state.push);
  const navigate = useNavigate();

  const submit = async (e) => {
    e.preventDefault();

    if (!email || !password) {
      toast("Enter email and password", "error");
      return;
    }

    try {
      const response = await login({ email, password });

      toast(`Welcome back, ${response.user.name || "User"}`, "success");
      navigate(roleHome(response.user.role));
    } catch (error) {
      toast(error.message || "Login failed", "error");
    }
  };

  return (
    <div className="auth-wrap">
      <div className="auth-left">
        <div className="auth-card">
          <Brand />

          <h1 style={{ marginTop: 40 }}>
            Welcome <span className="italic" style={{ color: "var(--ember)" }}>back</span>.
          </h1>

          <p className="auth-sub">Sign in to order, track, or manage.</p>

          <form onSubmit={submit}>
            <div className="field">
              <label>Email</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                autoFocus
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
              {loading ? "Signing in..." : "Sign in →"}
            </button>
          </form>

          <p className="auth-foot">
            New here? <Link to="/register">Create an account</Link>
          </p>
        </div>
      </div>

      <div className="auth-right">
        <Brand />

        <div className="auth-testimonial">
          <span className="eyebrow">What diners say</span>
          <blockquote>
            "Ordered dinner in minutes and tracked it clearly from kitchen to doorstep."
          </blockquote>
          <cite>— QuickBite customer</cite>
        </div>

        <div className="auth-footer">© 2026 QuickBite · Food, fast.</div>
      </div>
    </div>
  );
}