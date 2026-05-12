import { Navigate, Outlet } from "react-router-dom";
import { useAuthStore } from "../store/auth";
import AppNav from "./AppNav";

export function normalizeRole(role) {
  if (!role) return "Customer";

  const upper = String(role).trim().toUpperCase();

  if (upper === "CUSTOMER" || upper === "USER" || upper === "GUEST") return "Customer";
  if (upper === "ADMIN" || upper === "ADMINISTRATOR") return "Admin";

  if (
    ["OWNER", "RESTAURANT", "RESTAURANTOWNER", "RESTAURANT_OWNER"].some((key) =>
      upper.includes(key)
    )
  ) {
    return "RestaurantOwner";
  }

  if (
    [
      "AGENT",
      "DELIVERYPARTNER",
      "DELIVERY_PARTNER",
      "DELIVERY",
      "DELIVERY_AGENT",
      "DELIVERY AGENT",
      "DELIVERY PARTNER",
    ].some((key) => upper.includes(key))
  ) {
    return "DeliveryPartner";
  }

  return "Customer";
}

export function roleHome(role) {
  const normalizedRole = normalizeRole(role);

  if (normalizedRole === "Admin") return "/admin/dashboard";
  if (normalizedRole === "RestaurantOwner") return "/restaurant/dashboard";
  if (normalizedRole === "DeliveryPartner") return "/agent/dashboard";

  return "/restaurants";
}

export default function AppLayout({ roles = [] }) {
  const user = useAuthStore((state) => state.user);

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  const userRole = normalizeRole(user.role);

  if (roles.length > 0 && !roles.includes(userRole)) {
    return <Navigate to={roleHome(userRole)} replace />;
  }

  return (
    <>
      <AppNav />
      <Outlet />
    </>
  );
}