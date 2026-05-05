// Central API client for QuickBite frontend.
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:5000";
const getToken = () => localStorage.getItem("quickbite_token");

function buildHeaders(customHeaders = {}, endpoint = "") {
  const token = getToken();

  const isAuthEndpoint =
    endpoint.toLowerCase().includes("/auth/login") ||
    endpoint.toLowerCase().includes("/auth/register");

  return {
    "Content-Type": "application/json",
    ...(!isAuthEndpoint && token && {
      Authorization: `Bearer ${token}`,
    }),
    ...customHeaders,
  };
}

function extractErrorMessage(data) {
  if (!data) return "Something went wrong";
  if (typeof data === "string") return data;
  if (data.errors) return Object.values(data.errors).flat().join(" ");
  return data.message || data.error || data.title || "Something went wrong";
}

async function apiCall(endpoint, options = {}) {
  const config = {
    method: options.method || "GET",
    headers: buildHeaders(options.headers, endpoint),
  };

  if (options.body !== undefined) {
    config.body = JSON.stringify(options.body);
  }

  const response = await fetch(`${API_BASE_URL}${endpoint}`, config);

  const text = await response.text();
  let data = null;

  try {
    data = text ? JSON.parse(text) : null;
  } catch {
    data = text;
  }

  if (!response.ok) {
    const error = new Error(extractErrorMessage(data));
    error.status = response.status;
    error.data = data;
    throw error;
  }

  return data;
}

async function apiCallAny(endpoints, options = {}) {
  let lastError;

  for (const endpoint of endpoints) {
    try {
      return await apiCall(endpoint, options);
    } catch (error) {
      lastError = error;

      if (![404, 405].includes(error.status)) {
        throw error;
      }
    }
  }

  throw lastError;
}

function unwrapList(data, keys = []) {
  if (Array.isArray(data)) return data;

  for (const key of keys) {
    if (Array.isArray(data?.[key])) return data[key];
  }

  if (Array.isArray(data?.data)) return data.data;
  if (Array.isArray(data?.result)) return data.result;
  if (Array.isArray(data?.items)) return data.items;

  return [];
}

function unwrapObject(data) {
  return data?.data || data?.result || data || {};
}

function normalizeRole(role) {
  const value = String(role || "Customer").trim();
  const upper = value.toUpperCase();

  if (upper === "CUSTOMER") return "Customer";
  if (upper === "ADMIN") return "Admin";
  if (["OWNER", "RESTAURANT", "RESTAURANTOWNER"].includes(upper)) {
    return "RestaurantOwner";
  }
  if (["AGENT", "DELIVERYPARTNER", "DELIVERY_PARTNER"].includes(upper)) {
    return "DeliveryPartner";
  }

  return value;
}

function normalizeAuthResponse(data, email) {
  const source = unwrapObject(data);

  const token =
    source.token ||
    source.accessToken ||
    source.jwtToken ||
    data?.token ||
    data?.accessToken ||
    data?.data?.token ||
    data?.data?.accessToken;

  const user = source.user || source.userDetails || source;

  return {
    token,
    user: {
      id: user.id || user.userId || user.userID || "",
      name: user.fullName || user.name || user.userName || "",
      email: user.email || email || "",
      phone: user.phone || user.phoneNumber || "",
      role: normalizeRole(user.role),
    },
  };
}

function cuisineEmoji(cuisine = "") {
  const c = cuisine.toLowerCase();

  if (c.includes("pizza") || c.includes("italian")) return "🍕";
  if (c.includes("burger") || c.includes("fast")) return "🍔";
  if (c.includes("chinese")) return "🥡";
  if (c.includes("south")) return "🍛";
  if (c.includes("dessert") || c.includes("sweet")) return "🍰";
  if (c.includes("healthy")) return "🥗";

  return "🍽️";
}

function normalizeRestaurant(item) {
  const r = unwrapObject(item);

  const id = r.id || r.restaurantId || r.restaurantID;
  const eta =
    r.estimatedDeliveryTimeInMinutes ||
    r.estimatedDeliveryMin ||
    r.deliveryTime ||
    r.eta ||
    "N/A";

  const minOrder = r.minimumOrderAmount || r.minOrderAmount || r.priceFor2 || 0;

  return {
    ...r,
    id,
    name: r.name || r.restaurantName || "Unnamed Restaurant",
    description:
      r.description || r.desc || "Fresh food available from this restaurant.",
    desc: r.description || r.desc || "Fresh food available from this restaurant.",
    cuisine: r.cuisine || "Multi Cuisine",
    city: r.city || "",
    address: r.address || "",
    phone: r.phone || "",
    rating: r.avgRating || r.rating || "New",
    eta,
    priceFor2: r.priceFor2 || minOrder || 0,
    minimumOrderAmount: minOrder,
    emoji: r.emoji || cuisineEmoji(r.cuisine),
  };
}

function normalizeMenuItem(item) {
  const m = unwrapObject(item);
  const id = m.id || m.menuItemId || m.itemId;

  return {
    ...m,
    id,
    name: m.name || m.itemName || "Menu item",
    desc: m.description || m.desc || "",
    description: m.description || m.desc || "",
    price: Number(m.price || m.amount || 0),
    veg: m.isVeg ?? m.veg ?? m.isVegetarian ?? true,
    category: m.category || m.categoryName || "Menu Items",
    isAvailable: m.isAvailable ?? m.available ?? true,
    emoji: m.emoji || "🍴",
  };
}

function groupMenu(restaurant, items) {
  const groups = items.reduce((acc, item) => {
    const key = item.category || "Menu Items";

    if (!acc[key]) {
      acc[key] = [];
    }

    acc[key].push(item);
    return acc;
  }, {});

  return {
    restaurant,
    categories: Object.entries(groups).map(([name, categoryItems]) => ({
      id: name.replace(/\s+/g, "-").toLowerCase(),
      name,
      items: categoryItems,
    })),
  };
}

function normalizeOrder(order) {
  const o = unwrapObject(order);
  const rawItems = o.items || o.orderItems || [];

  return {
    ...o,
    id: o.id || o.orderId || o.orderID,
    restaurantName: o.restaurantName || o.restaurant?.name || "Restaurant",
    date: o.createdAt || o.orderDate || o.date || "",
    items: Array.isArray(rawItems) ? rawItems.length : rawItems || 0,
    total: o.total || o.totalAmount || o.amount || 0,
    status: o.status || o.orderStatus || "PLACED",
  };
}

export const API = {
  register: async (payload) => {
    localStorage.removeItem("quickbite_token");
    localStorage.removeItem("quickbite_user");

    const data = await apiCallAny(["/api/Auth/register", "/api/auth/register"], {
      method: "POST",
      body: {
        fullName: payload.name,
        name: payload.name,
        email: payload.email,
        password: payload.password,
        phone: payload.phone,
        role: normalizeRole(payload.role),
      },
    });

    return normalizeAuthResponse(data, payload.email);
  },

  login: async (payload) => {
    localStorage.removeItem("quickbite_token");
    localStorage.removeItem("quickbite_user");

    const data = await apiCallAny(["/api/Auth/login", "/api/auth/login"], {
      method: "POST",
      body: {
        email: payload.email,
        password: payload.password,
      },
    });

    const result = normalizeAuthResponse(data, payload.email);

    if (!result.token) {
      throw new Error("Login response does not contain token.");
    }

    return result;
  },

  getRestaurants: async () => {
    const data = await apiCallAny([
      "/api/Restaurants",
      "/api/Restaurant",
      "/api/restaurants",
    ]);

    return unwrapList(data, ["restaurants"]).map(normalizeRestaurant);
  },

  listRestaurants: async () => API.getRestaurants(),

  getRestaurantById: async (id) => {
    const data = await apiCallAny([
      `/api/Restaurants/${id}`,
      `/api/Restaurant/${id}`,
      `/api/restaurants/${id}`,
    ]);

    return normalizeRestaurant(data);
  },

  getMenuByRestaurant: async (restaurantId) => {
    const data = await apiCallAny([
      `/api/Menu/restaurant/${restaurantId}`,
      `/api/MenuItems/restaurant/${restaurantId}`,
      `/api/Menu/${restaurantId}`,
      `/api/menu/restaurant/${restaurantId}`,
    ]);

    return unwrapList(data, ["menuItems", "menus"])
      .map(normalizeMenuItem)
      .filter((item) => item.isAvailable);
  },

  getMenu: async (restaurantId) => {
    const [restaurant, items] = await Promise.all([
      API.getRestaurantById(restaurantId),
      API.getMenuByRestaurant(restaurantId),
    ]);

    return groupMenu(restaurant, items);
  },

  listOrders: async () => {
    const data = await apiCallAny(["/api/Orders/my", "/api/Orders", "/api/orders"]);

    return unwrapList(data, ["orders"]).map(normalizeOrder);
  },

  getOrder: async (id) => {
    const data = await apiCallAny([`/api/Orders/${id}`, `/api/orders/${id}`]);

    return normalizeOrder(data);
  },

  placeOrder: async ({ restaurantId, items, address, paymentMethod, totals }) => {
    const body = {
      restaurantId,
      deliveryAddress: `${address.line1}, ${address.city} - ${address.pin}`,
      address,
      paymentMethod,
      totalAmount: totals.total,
      items: items.map((item) => ({
        menuItemId: item.id,
        itemId: item.id,
        name: item.name,
        quantity: item.qty,
        price: item.price,
      })),
    };

    const data = await apiCallAny(["/api/Orders", "/api/orders"], {
      method: "POST",
      body,
    });

    return normalizeOrder(data);
  },

  pay: async ({ orderId, method, amount }) => {
    const body = {
      orderId,
      paymentMethod: method,
      amount,
    };

    return apiCallAny(["/api/Payments", "/api/Payment", "/api/payments"], {
      method: "POST",
      body,
    });
  },

  cancelOrder: async (id) => {
    return apiCallAny(
      [`/api/Orders/${id}/cancel`, `/api/orders/${id}/cancel`, `/api/Orders/cancel/${id}`],
      {
        method: "PUT",
      }
    );
  },

  submitReview: async ({ orderId, foodRating, deliveryRating, body }) => {
    return apiCallAny(["/api/Reviews", "/api/Review", "/api/reviews"], {
      method: "POST",
      body: {
        orderId,
        foodRating,
        deliveryRating,
        rating: Math.round((foodRating + deliveryRating) / 2),
        comment: body,
      },
    });
  },
};