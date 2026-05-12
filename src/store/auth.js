import { create } from "zustand";
import { API } from "../api/client";

function normalizeRole(role) {
  if (!role) return "Customer";
  const upper = role.trim().toUpperCase();

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

function normalizeUser(user) {
  if (!user) return user;
  return { ...user, role: normalizeRole(user.role) };
}

// Auth store for login, register and logout
const storedUser = (() => {
  try {
    return JSON.parse(localStorage.getItem("quickbite_user"));
  } catch {
    return null;
  }
})();

const storedToken = localStorage.getItem("quickbite_token") || null;
const initialUser = storedToken && storedUser && (storedUser.id || storedUser.userId || storedUser.userID) ? normalizeUser(storedUser) : null;

export const useAuthStore = create((set) => ({
  user: initialUser,
  token: initialUser ? storedToken : null,
  loading: false,

  // Register user
  register: async (payload) => {
    set({ loading: true });

    try {
      console.log("[AUTH.REGISTER] Calling API with payload role:", payload.role);
      
      const response = await API.register(payload);

      console.log("[AUTH.REGISTER] API response:", response);

      if (response.token && response.user) {
        console.log("[AUTH.REGISTER] Before normalization - user role:", response.user.role);
        
        const normalizedUser = normalizeUser(response.user);
        
        console.log("[AUTH.REGISTER] After normalization - user role:", normalizedUser.role);
        console.log("[AUTH.REGISTER] Saving to localStorage - user:", normalizedUser);
        
        localStorage.setItem("quickbite_token", response.token);
        localStorage.setItem("quickbite_user", JSON.stringify(normalizedUser));

        set({
          token: response.token,
          user: normalizedUser,
          loading: false,
        });
      } else {
        set({ loading: false });
      }

      return response.user ? { ...response, user: normalizeUser(response.user) } : response;
    } catch (error) {
      console.error("[AUTH.REGISTER] Error:", error);
      set({ loading: false });
      throw error;
    }
  },

  // Login user
  login: async (payload) => {
    set({ loading: true });

    try {
      console.log("[AUTH.LOGIN] Logging in with email:", payload.email);
      
      const response = await API.login(payload);

      console.log("[AUTH.LOGIN] API response:", response);

      // Save token and user after login
      const normalizedUser = normalizeUser(response.user);
      
      console.log("[AUTH.LOGIN] User role from backend:", response.user.role);
      console.log("[AUTH.LOGIN] Normalized role:", normalizedUser.role);
      console.log("[AUTH.LOGIN] Saving to localStorage - user:", normalizedUser);
      
      localStorage.setItem("quickbite_token", response.token);
      localStorage.setItem("quickbite_user", JSON.stringify(normalizedUser));

      set({
        token: response.token,
        user: normalizedUser,
        loading: false,
      });

      return { ...response, user: normalizedUser };
    } catch (error) {
      console.error("[AUTH.LOGIN] Error:", error);
      set({ loading: false });
      throw error;
    }
  },

  // Logout user
  logout: () => {
    localStorage.removeItem("quickbite_token");
    localStorage.removeItem("quickbite_user");
    sessionStorage.removeItem("quickbite_delivered_cache");

    set({
      user: null,
      token: null,
    });
  },
}));