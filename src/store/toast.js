import { create } from "zustand";

// Toast store for showing success/error messages
export const useToast = create((set) => ({
  items: [],

  // Add new toast message
  push: (message, type = "default") => {
    const id = Date.now();

    set((state) => ({
      items: [...state.items, { id, message, type }],
    }));

    // Auto remove toast after 3 seconds
    setTimeout(() => {
      set((state) => ({
        items: state.items.filter((toast) => toast.id !== id),
      }));
    }, 3000);
  },

  // Remove toast manually
  remove: (id) => {
    set((state) => ({
      items: state.items.filter((toast) => toast.id !== id),
    }));
  },
}));