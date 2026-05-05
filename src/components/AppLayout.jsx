import { Navigate, Outlet, useLocation } from "react-router-dom";
import AppNav from "./AppNav";
import { useAuthStore } from "../store/auth";

export function roleHome(role) {
  switch (role) {
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

export default function AppLayout({ roles }) {
  const user = useAuthStore((state) => state.user);
  const location = useLocation();

  if (!user) {
    return <Navigate to={`/login?from=${encodeURIComponent(location.pathname)}`} replace />;
  }

  if (roles && !roles.includes(user.role)) {
    return <Navigate to={roleHome(user.role)} replace />;
  }

  return (
    <div className="app-shell">
      <AppNav />
      <Outlet />
    </div>
  );
}
