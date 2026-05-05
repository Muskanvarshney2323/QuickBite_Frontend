import { create } from "zustand";
import { persist } from "zustand/middleware";

export const useCart = create(
  persist(
    (set, get) => ({
      restaurantId: null,
      restaurantName: null,
      items: [],

      add: (item, restaurant) => {
        const current = get();
        if (current.restaurantId && current.restaurantId !== restaurant.id) {
          set({
            restaurantId: restaurant.id,
            restaurantName: restaurant.name,
            items: [{ ...item, qty: 1 }],
          });
          return;
        }

        const existing = current.items.find((cartItem) => cartItem.id === item.id);
        if (existing) {
          set({
            items: current.items.map((cartItem) =>
              cartItem.id === item.id ? { ...cartItem, qty: cartItem.qty + 1 } : cartItem
            ),
          });
        } else {
          set({
            restaurantId: restaurant.id,
            restaurantName: restaurant.name,
            items: [...current.items, { ...item, qty: 1 }],
          });
        }
      },

      remove: (id) => {
        const current = get();
        const items = current.items.filter((item) => item.id !== id);
        set({
          items,
          restaurantId: items.length ? current.restaurantId : null,
          restaurantName: items.length ? current.restaurantName : null,
        });
      },

      setQty: (id, qty) => {
        if (qty <= 0) return get().remove(id);
        set({
          items: get().items.map((item) => (item.id === id ? { ...item, qty } : item)),
        });
      },

      clear: () => set({ items: [], restaurantId: null, restaurantName: null }),

      count: () => get().items.reduce((total, item) => total + item.qty, 0),

      subtotal: () => get().items.reduce((total, item) => total + item.price * item.qty, 0),

      totals: () => {
        const sub = get().subtotal();
        const delivery = sub > 0 && sub < 300 ? 29 : 0;
        const tax = Math.round(sub * 0.05);
        const total = sub + delivery + tax;
        return { sub, discount: 0, delivery, tax, total };
      },
    }),
    { name: "qb_cart" }
  )
);
