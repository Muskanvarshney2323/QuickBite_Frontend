import { create } from "zustand";
import { persist } from "zustand/middleware";

// Helper function to normalize a cart item
function normalizeCartItem(item) {
  return {
    id: item.id || item.menuItemId || item.itemId || "",
    name: item.name || item.itemName || "Menu Item",
    price: Number(item.price || item.amount || 0),
    qty: Number(item.qty || item.quantity || 1),
    emoji: item.emoji || "🍴",
    desc: item.desc || item.description || "",
    category: item.category || item.categoryName || "Menu Items",
    veg: item.veg !== undefined ? item.veg : (item.isVeg !== undefined ? item.isVeg : true),
  };
}

export const useCart = create(
  persist(
    (set, get) => ({
      restaurantId: null,
      restaurantName: null,
      items: [],

      // Add item to cart or increase quantity if already present
      add: (item, restaurant) => {
        const current = get();
        
        // If switching restaurants, clear previous items
        if (current.restaurantId && current.restaurantId !== restaurant.id) {
          set({
            restaurantId: restaurant.id,
            restaurantName: restaurant.name,
            items: [normalizeCartItem({ ...item, qty: 1 })],
          });
          return;
        }

        // Normalize the item to ensure it has all required fields
        const normalizedItem = normalizeCartItem(item);
        
        // Check if item already exists in cart
        const existing = current.items.find((cartItem) => cartItem.id === normalizedItem.id);
        
        if (existing) {
          // Increase quantity if item already in cart
          set({
            items: current.items.map((cartItem) =>
              cartItem.id === normalizedItem.id 
                ? { ...cartItem, qty: cartItem.qty + 1 } 
                : cartItem
            ),
          });
        } else {
          // Add new item to cart
          set({
            restaurantId: restaurant.id,
            restaurantName: restaurant.name,
            items: [...current.items, { ...normalizedItem, qty: 1 }],
          });
        }
      },

      // Remove item from cart completely
      remove: (id) => {
        const current = get();
        const items = current.items.filter((item) => item.id !== id);
        set({
          items,
          // Clear restaurant info if cart is now empty
          restaurantId: items.length ? current.restaurantId : null,
          restaurantName: items.length ? current.restaurantName : null,
        });
      },

      // Set quantity of an item (0 removes it)
      setQty: (id, qty) => {
        const parsedQty = Math.max(0, parseInt(qty) || 0);
        if (parsedQty <= 0) {
          return get().remove(id);
        }
        set({
          items: get().items.map((item) => 
            item.id === id ? { ...item, qty: parsedQty } : item
          ),
        });
      },

      // Clear entire cart
      clear: () => set({ 
        items: [], 
        restaurantId: null, 
        restaurantName: null 
      }),

      // Get total item count
      count: () => get().items.reduce((total, item) => total + (item.qty || 1), 0),

      // Get subtotal (before delivery and tax)
      subtotal: () => get().items.reduce((total, item) => {
        const price = Number(item.price || 0);
        const qty = Number(item.qty || 1);
        return total + (price * qty);
      }, 0),

      // Get all totals (subtotal, delivery, tax, total)
      totals: () => {
        const sub = get().subtotal();
        // Free delivery for orders over ₹300, ₹29 otherwise
        const delivery = sub > 0 && sub < 300 ? 29 : 0;
        // 5% tax on subtotal
        const tax = Math.round(sub * 0.05);
        const total = sub + delivery + tax;
        
        return { 
          sub: Math.round(sub), 
          discount: 0, 
          delivery, 
          tax, 
          total: Math.round(total) 
        };
      },
    }),
    { 
      name: "qb_cart",
      // Only persist specific keys to avoid serialization issues
      partialize: (state) => ({
        restaurantId: state.restaurantId,
        restaurantName: state.restaurantName,
        items: state.items,
      })
    }
  )
);
