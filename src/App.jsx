import { Navigate, Route, Routes } from "react-router-dom";

import AppLayout from "./components/AppLayout";
import AdminDashboard from "./pages/AdminDashboard";
import AgentDashboard from "./pages/AgentDashboard";
import Cart from "./pages/Cart";
import Checkout from "./pages/Checkout";
import CustomerDashboard from "./pages/CustomerDashboard";
import Landing from "./pages/Landing";
import Login from "./pages/Login";
import Menu from "./pages/Menu";
import Orders from "./pages/Orders";
import Register from "./pages/Register";
import RestaurantDashboard from "./pages/RestaurantDashboard";
import Restaurants from "./pages/Restaurants";
import Review from "./pages/Review";
import Track from "./pages/Track";

export default function App() {
  return (
      <Routes>
        <Route path="/" element={<Landing />} />
        <Route path="/register" element={<Register />} />
        <Route path="/login" element={<Login />} />

        <Route element={<AppLayout roles={["Customer"]} />}>
          <Route path="/customer" element={<CustomerDashboard />} />
          <Route path="/restaurants" element={<Restaurants />} />
          <Route path="/restaurants/:id" element={<Menu />} />
          <Route path="/cart" element={<Cart />} />
          <Route path="/checkout" element={<Checkout />} />
          <Route path="/orders" element={<Orders />} />
          <Route path="/track/:id" element={<Track />} />
          <Route path="/review/:id" element={<Review />} />
        </Route>

        <Route element={<AppLayout roles={["RestaurantOwner"]} />}>
          <Route path="/restaurant" element={<RestaurantDashboard />} />
          <Route path="/restaurant/dashboard" element={<RestaurantDashboard />} />
        </Route>

        <Route element={<AppLayout roles={["DeliveryPartner"]} />}>
          <Route path="/agent" element={<AgentDashboard />} />
          <Route path="/agent/dashboard" element={<AgentDashboard />} />
        </Route>

        <Route element={<AppLayout roles={["Admin"]} />}>
          <Route path="/admin" element={<AdminDashboard />} />
          <Route path="/admin/dashboard" element={<AdminDashboard />} />
        </Route>

        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    );
}
