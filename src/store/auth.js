import { create } from "zustand";
import { API } from "../api/client";

// Auth store for login, register and logout
export const useAuthStore = create((set) => ({
  user: JSON.parse(localStorage.getItem("quickbite_user")) || null,
  token: localStorage.getItem("quickbite_token") || null,
  loading: false,

  // Register user
  register: async (payload) => {
    set({ loading: true });

    try {
      const response = await API.register(payload);

      // Do not save token here because register may not return token
      set({ loading: false });

      return response;
    } catch (error) {
      set({ loading: false });
      throw error;
    }
  },

  // Login user
  login: async (payload) => {
    set({ loading: true });

    try {
      const response = await API.login(payload);

      // Save token and user after login
      localStorage.setItem("quickbite_token", response.token);
      localStorage.setItem("quickbite_user", JSON.stringify(response.user));

      set({
        token: response.token,
        user: response.user,
        loading: false,
      });

      return response;
    } catch (error) {
      set({ loading: false });
      throw error;
    }
  },

  // Logout user
  logout: () => {
    localStorage.removeItem("quickbite_token");
    localStorage.removeItem("quickbite_user");

    set({
      user: null,
      token: null,
    });
  },
}));