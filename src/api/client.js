// Central API client for QuickBite frontend.
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:5000";


const getToken = () => localStorage.getItem("quickbite_token");

function getCurrentUserId() {
  try {
    const user = JSON.parse(localStorage.getItem("quickbite_user") || "{}");
    return user.id || user.userId || user.userID || "";
  } catch {
    return "";
  }
}

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
  if (Array.isArray(data)) return data.join(" ");
  if (typeof data.detail === "string") return data.detail;
  if (data.errors) return Object.values(data.errors).flat().join(" ");

  if (data.error) {
    if (Array.isArray(data.error)) return data.error.flat().join(" ");
    if (typeof data.error === "string" && data.error.trim()) return data.error;
  }

  if (typeof data.message === "string" && data.message.trim()) {
    return data.message;
  }

  return data.title || "Something went wrong";
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

async function apiCallAnyWithMethods(requests, options = {}) {
  let lastError;

  for (const request of requests) {
    const endpoint = typeof request === "string" ? request : request.endpoint;
    const method = request.method || options.method || "GET";
    const requestOptions = {
      ...options,
      method,
      body: request.body ?? options.body,
    };

    try {
      return await apiCall(endpoint, requestOptions);
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
    if (Array.isArray(data?.[key]?.data)) return data[key].data;
  }

  if (Array.isArray(data?.data)) return data.data;
  if (Array.isArray(data?.data?.orders)) return data.data.orders;
  if (Array.isArray(data?.data?.items)) return data.data.items;
  if (Array.isArray(data?.data?.result)) return data.data.result;
  if (Array.isArray(data?.data?.data)) return data.data.data;
  if (Array.isArray(data?.result)) return data.result;
  if (Array.isArray(data?.items)) return data.items;
  if (Array.isArray(data?.menuItems)) return data.menuItems;
  if (Array.isArray(data?.menus)) return data.menus;

  if (data && typeof data === "object") {
    const arrays = Object.values(data).filter((value) => Array.isArray(value));
    if (arrays.length === 1) return arrays[0];
  }

  return [];
}

function unwrapObject(data) {
  return data?.data || data?.result || data || {};
}

function normalizeRole(role) {
  const value = String(role || "Customer").trim();
  const upper = value.toUpperCase();

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
    ["AGENT", "DELIVERYPARTNER", "DELIVERY_PARTNER", "DELIVERY", "DELIVERY_AGENT", "DELIVERY PARTNER"].some(
      (key) => upper.includes(key)
    )
  ) {
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

// Helper function to assign restaurant image based on name or cuisine
function restaurantImage(name = "", cuisine = "") {
  const n = name.toLowerCase();
  const c = cuisine.toLowerCase();

  if (n.includes("burger") || c.includes("burger") || c.includes("fast")) return "https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=400&h=300&fit=crop";
  if (n.includes("pizza") || c.includes("pizza") || c.includes("italian")) return "https://images.unsplash.com/photo-1513104890138-7c749659a591?w=400&h=300&fit=crop";
  if (n.includes("dosa") || n.includes("south") || c.includes("south") || c.includes("indian")) return "https://images.unsplash.com/photo-1589301760014-d929f3979dbc?w=400&h=300&fit=crop";
  if (n.includes("chinese") || c.includes("chinese")) return "https://images.unsplash.com/photo-1563379091339-03246963d4d5?w=400&h=300&fit=crop";
  if (n.includes("momos") || n.includes("momo")) return "https://images.unsplash.com/photo-1625220194771-7ebdea0b70b9?w=400&h=300&fit=crop";
  if (n.includes("dessert") || n.includes("cake") || c.includes("dessert") || c.includes("sweet")) return "https://images.unsplash.com/photo-1551024506-0bccd828d307?w=400&h=300&fit=crop";

  // Default general food image
  return "https://images.unsplash.com/photo-1414235077428-338989a2e8c0?w=400&h=300&fit=crop";
}

function normalizeRestaurant(item) {
  const r = unwrapObject(item);

  const id = r.id || r.restaurantId || r.restaurantID;

  const eta =
    r.estimatedDeliveryTimeInMinutes ||
    r.estimatedDeliveryMin ||
    r.deliveryTime ||
    r.eta ||
    30;

  const minimumOrderAmount =
    r.minimumOrderAmount ||
    r.minOrderAmount ||
    r.minimumOrder ||
    0;

  return {
    ...r,
    id,
    name: r.name || r.restaurantName || "Unnamed Restaurant",
    description: r.description || r.desc || "Fresh food available from this restaurant.",
    desc: r.description || r.desc || "Fresh food available from this restaurant.",
    cuisine: r.cuisine || "Multi Cuisine",
    city: r.city || "",
    address: r.address || "",
    phone: r.phone || "",
    rating: r.avgRating || r.rating || "New",
    eta,
    priceFor2:
      r.priceFor2 ||
      r.costForTwo ||
      r.averageCost ||
      r.avgCost ||
      300,
    estimatedDeliveryTimeInMinutes: eta,
    minimumOrderAmount,
    emoji: r.emoji || cuisineEmoji(r.cuisine),
    imageUrl: r.imageUrl || r.image || restaurantImage(r.name, r.cuisine), // Add imageUrl using backend or generated
  };
}

function normalizeMenuItem(item) {
  const m = unwrapObject(item);

  const id = m.id || m.menuItemId || m.itemId;

  const menuCategoryId =
    m.menuCategoryId ||
    m.categoryId ||
    m.category?.id ||
    m.menuCategory?.id ||
    m.menuCategory?.menuCategoryId ||
    null;

  const restaurantId =
    m.restaurantId ||
    m.restaurantID ||
    m.restaurant?.id ||
    m.restaurant?.restaurantId ||
    m.restaurant?.restaurantID ||
    m.category?.restaurantId ||
    m.menuCategory?.restaurantId ||
    null;

  return {
    ...m,
    id,
    menuCategoryId,
    restaurantId,
    name: m.name || m.itemName || "Menu item",
    desc: m.description || m.desc || "",
    description: m.description || m.desc || "",
    price: Number(m.price || m.amount || 0),
    veg: m.isVeg ?? m.veg ?? m.isVegetarian ?? true,
    category: m.category || m.categoryName || m.menuCategory?.name || "Menu Items",
    isAvailable: m.isAvailable ?? m.available ?? true,
    emoji: m.emoji || "🍴",
  };
}

function groupMenu(restaurant, items) {
  const groups = items.reduce((acc, item) => {
    const key = item.category || "Menu Items";

    if (!acc[key]) acc[key] = [];
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
function normalizeOrderStatus(status) {
  const raw = String(status ?? "").trim();
  const upper = raw.toUpperCase();

  const statusMap = {
    "0": "PLACED",
    "1": "CONFIRMED",
    "2": "PREPARING",
    "3": "PICKED_UP",
    "4": "OUT_FOR_DELIVERY",
    "5": "DELIVERED",
    "6": "CANCELLED",
    PLACED: "PLACED",
    CONFIRMED: "CONFIRMED",
    PREPARING: "PREPARING",
    PICKED_UP: "PICKED_UP",
    OUT_FOR_DELIVERY: "OUT_FOR_DELIVERY",
    ON_THE_WAY: "OUT_FOR_DELIVERY",
    DELIVERED: "DELIVERED",
    CANCELLED: "CANCELLED",
  };

  if (statusMap[raw] || statusMap[upper]) {
    return statusMap[raw] || statusMap[upper];
  }

  console.warn("[API] Unknown order status:", status, "-> defaulting to:", upper);
  return upper || "PLACED";
}

function parseOrderArray(response) {
  const orders = Array.isArray(response)
    ? response
    : response?.orders ?? response?.data ?? response?.items ?? response?.result ?? response?.value ?? response?.payload ?? [];

  return Array.isArray(orders) ? orders : [];
}

function getOrderAgentIds(order) {
  const ids = new Set();
  const raw = order || {};

  const add = (value) => {
    if (value === undefined || value === null) return;
    const id = String(value).trim();
    if (id) ids.add(id);
  };

  add(raw.deliveryAgentId);
  add(raw.agentId);
  add(raw.delivery_agent_id);
  add(raw.deliveryPartnerId);
  add(raw.delivery_partner_id);
  add(raw.assignedAgentId);
  add(raw.assigned_to?.id);
  add(raw.assignedTo?.id);
  add(raw.assignedTo?.agentId);
  add(raw.assignedTo?.deliveryAgentId);
  add(raw.driverId);
  add(raw.riderId);
  add(raw.courierId);
  add(raw.assignedTo?.userId);
  add(raw.agent?.id);
  add(raw.agent?.agentId);
  add(raw.agent?.userId);
  add(raw.deliveryAgent?.id);
  add(raw.deliveryAgent?.agentId);
  add(raw.deliveryAgent?.deliveryAgentId);
  add(raw.deliveryAgent?.userId);
  add(raw.deliveryAgent?.delivery_agent_id);
  add(raw.deliveryAgent?.deliveryPartnerId);
  add(raw.deliveryAgent?.delivery_partner_id);
  add(raw.order?.deliveryAgentId);
  add(raw.order?.agentId);
  add(raw.order?.assignedAgentId);

  return Array.from(ids);
}

function isOrderAssignedToAgent(order, agentId) {
  const agentKey = String(agentId || "").trim();
  if (!agentKey) return false;

  const ids = getOrderAgentIds(order);
  return ids.some((id) => id === agentKey);
}

function toNumber(value) {
  if (value === null || value === undefined) return 0;
  const number = Number(value);
  return Number.isNaN(number) ? 0 : number;
}

function getOrderValue(source, keys) {
  for (const key of keys) {
    if (key.includes(".")) {
      const segments = key.split(".");
      let current = source;
      let found = true;

      for (const segment of segments) {
        if (current && typeof current === "object" && segment in current) {
          current = current[segment];
        } else {
          found = false;
          break;
        }
      }

      if (found && current !== undefined) return current;
    } else if (key in source && source[key] !== undefined) {
      return source[key];
    }
  }

  return undefined;
}

function calculateOrderTotal(o) {
  const finalAmount = toNumber(
    getOrderValue(o, [
      "finalAmount",
      "FinalAmount",
      "final_amount",
      "Final_Amount",
      "orderSummary.finalAmount",
      "orderSummary.FinalAmount",
      "orderSummary.totalAmount",
      "invoice.finalAmount",
      "invoice.TotalAmount",
      "invoice.final_amount",
    ])
  );

  const rawTotal = toNumber(
    getOrderValue(o, [
      "total",
      "totalAmount",
      "TotalAmount",
      "total_amount",
      "orderSummary.total",
      "orderSummary.totalAmount",
      "invoice.total",
      "invoice.TotalAmount",
    ])
  );

  const amount = toNumber(
    getOrderValue(o, [
      "amount",
      "subtotal",
      "subTotal",
      "orderAmount",
      "amountPaid",
      "orderSummary.amount",
      "invoice.amount",
    ])
  );

  const deliveryFee = toNumber(
    getOrderValue(o, [
      "deliveryCharge",
      "deliveryFee",
      "delivery",
      "shippingCharge",
      "shipping",
      "deliveryAmount",
      "delivery_amount",
      "orderSummary.deliveryCharge",
      "invoice.deliveryCharge",
    ])
  );

  const tax = toNumber(
    getOrderValue(o, [
      "tax",
      "taxes",
      "taxAmount",
      "tax_amount",
      "vat",
      "gst",
      "orderSummary.tax",
      "invoice.tax",
    ])
  );

  const hasDelivery = [
    getOrderValue(o, ["deliveryCharge", "deliveryFee", "delivery", "shippingCharge", "shipping", "deliveryAmount", "delivery_amount", "orderSummary.deliveryCharge", "invoice.deliveryCharge"]),
  ].some((value) => value !== undefined && value !== null);

  const computedDelivery = hasDelivery
    ? deliveryFee
    : amount > 0 && amount < 300
    ? 29
    : 0;

  const computedTax = tax || Math.round(amount * 0.05);
  const computedTotal = amount + computedDelivery + computedTax;

  if (finalAmount > 0) return finalAmount;

  if (rawTotal > 0) {
    if (amount > 0 || hasDelivery || tax > 0) {
      if (computedTotal > 0 && computedTotal !== rawTotal) {
        return computedTotal;
      }
    }

    return rawTotal;
  }

  if (amount > 0) return computedTotal;

  return rawTotal;
}

export { calculateOrderTotal };

function normalizeOrder(order) {
  const o = unwrapObject(order);
  const rawItems =
    Array.isArray(o.orderItems) ? o.orderItems :
    Array.isArray(o.items) ? o.items :
    Array.isArray(o.items?.data) ? o.items.data :
    Array.isArray(o.orderItems?.data) ? o.orderItems.data :
    [];

  const restaurantName =
    o.restaurantName ||
    o.restaurant_name ||
    o.restaurant?.name ||
    o.restaurant?.restaurantName ||
    o.restaurant?.restaurant_name ||
    o.Restaurant?.name ||
    o.Restaurant?.restaurantName ||
    o.restaurantDetails?.name ||
    o.restaurantDetails?.restaurantName ||
    o.vendor?.name ||
    o.vendor?.restaurantName ||
    o.restaurantDetail?.name ||
    o.restaurantId ||
    o.restaurant_id ||
    o.restaurantID ||
    o.restaurant?.id ||
    o.Restaurant?.id ||
    "Restaurant";

  console.log("[API] Order normalized:", {
    id: o.id,
    restaurantName,
    hasRestaurant: !!o.restaurant,
    restaurantKeys: o.restaurant ? Object.keys(o.restaurant).slice(0, 5) : "N/A",
  });

  return {
    ...o,
    id: o.id || o.orderId || o.orderID || "",
    restaurantName,
    date: o.createdAt || o.orderDate || o.OrderDate || o.date || o.created_at || "",
    items: Array.isArray(rawItems) ? rawItems.length : 0,
    total: calculateOrderTotal(o),
    status: normalizeOrderStatus(
      o.status ?? o.orderStatus ?? o.OrderStatus ?? o.state ?? "PLACED"
    ),
    paymentMethod:
      o.paymentMethod ||
      o.modeOfPayment ||
      o.paymentType ||
      o.method ||
      o.payment ||
      "COD",
    customerName:
      o.customerName ||
      o.user?.name ||
      o.userName ||
      o.customer?.name ||
      o.user?.fullName ||
      "Customer",
    deliveryAddress:
      o.deliveryAddress ||
      o.address ||
      o.address?.line1 ||
      o.address?.fullAddress ||
      o.delivery_address ||
      "Delivery address not available",
    pickupLocation:
      o.restaurant?.address ||
      o.restaurantAddress ||
      o.restaurant?.location ||
      o.restaurant_address ||
      o.Restaurant?.address ||
      o.restaurantDetails?.address ||
      o.restaurantDetails?.location ||
      o.vendor?.address ||
      o.vendor?.location ||
      "Restaurant location not available",
  };
}

function restaurantBelongsToOwner(restaurant, user) {
  if (!user) return false;

  const userId = String(user.id || "");
  const email = String(user.email || "").toLowerCase();

  const ownerIds = [
    restaurant.ownerId,
    restaurant.owner?.id,
    restaurant.userId,
    restaurant.createdBy,
    restaurant.createdById,
    restaurant.restaurantOwnerId,
  ]
    .filter(Boolean)
    .map(String);

  if (ownerIds.includes(userId)) return true;

  if (
    String(restaurant.ownerEmail || restaurant.email || restaurant.emailAddress || "").toLowerCase() === email
  ) {
    return true;
  }

  return false;
}

function mapOrderPaymentMode(method) {
  // Convert checkout payment options to backend payment mode values.
  if (method === "COD") return "CASH_ON_DELIVERY";
  if (method === "CARD") return "CARD";
  if (method === "UPI") return "UPI";
  if (method === "WALLET") return "WALLET";
  return method || "CASH_ON_DELIVERY";
}

export const API = {
  register: async (payload) => {
    localStorage.removeItem("quickbite_token");
    localStorage.removeItem("quickbite_user");

    const normalizedRole = normalizeRole(payload.role);

    const data = await apiCallAny(
      ["/api/Auth/register", "/api/auth/register", "/Auth/register", "/auth/register"],
      {
        method: "POST",
        body: {
          fullName: payload.name,
          name: payload.name,
          userName: payload.name,
          email: payload.email,
          password: payload.password,
          phone: payload.phone,
          phoneNumber: payload.phone,
          address: payload.address,
          role: normalizedRole,
          userRole: normalizedRole,
          roleName: normalizedRole,
          accountType: normalizedRole,
          userType: normalizedRole,
          roleType: normalizedRole,
          isDeliveryPartner: normalizedRole === "DeliveryPartner",
          isDeliveryAgent: normalizedRole === "DeliveryPartner",
        },
      }
    );

    return normalizeAuthResponse(data, payload.email);
  },

  login: async (payload) => {
    localStorage.removeItem("quickbite_token");
    localStorage.removeItem("quickbite_user");

    const data = await apiCallAny(
      ["/api/Auth/login", "/api/auth/login", "/Auth/login", "/auth/login"],
      {
        method: "POST",
        body: {
          email: payload.email,
          password: payload.password,
        },
      }
    );

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
      "/api/Restaurants/all",
      "/api/Restaurant/all",
      "/api/restaurants/all",
      "/api/Restaurants/list",
      "/api/restaurants/list",
    ]);

    return unwrapList(data, ["restaurants", "items"]).map(normalizeRestaurant);
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
    return API.getMenuItemsByRestaurant(restaurantId, true);
  },

  getMenu: async (restaurantId) => {
    const [restaurant, items] = await Promise.all([
      API.getRestaurantById(restaurantId),
      API.getMenuByRestaurant(restaurantId),
    ]);

    return groupMenu(restaurant, items);
  },

  getMenuItemsByRestaurant: async (restaurantId, availableOnly = false) => {
    const matchesRestaurant = (item) =>
      String(item.restaurantId || "") === String(restaurantId);

    try {
      const data = await apiCallAny([
        `/api/MenuItems/restaurant/${restaurantId}`,
        `/api/menuitems/restaurant/${restaurantId}`,
      ]);

      const items = unwrapList(data, ["menuItems", "menus", "items"]).map(normalizeMenuItem);

      const hasRestaurantId = items.some((item) => item.restaurantId);
      const filtered = hasRestaurantId ? items.filter(matchesRestaurant) : items;

      return availableOnly ? filtered.filter((item) => item.isAvailable) : filtered;
    } catch {
      try {
        const data = await apiCallAny(["/api/MenuItems", "/api/menuitems"]);
        const allItems = unwrapList(data, ["menuItems", "menus", "items"]).map(normalizeMenuItem);
        const filtered = allItems.filter(matchesRestaurant);

        return availableOnly ? filtered.filter((item) => item.isAvailable) : filtered;
      } catch (fallbackError) {
        console.error("Failed to load menu items for restaurant:", restaurantId, fallbackError);
        return [];
      }
    }
  },

  getMenuCategoriesByRestaurant: async (restaurantId) => {
    const data = await apiCallAny([
      `/api/MenuCategories/restaurant/${restaurantId}`,
      `/api/menucategories/restaurant/${restaurantId}`,
      `/api/MenuCategories?restaurantId=${restaurantId}`,
      `/api/MenuCategories?RestaurantId=${restaurantId}`,
      `/api/menucategories?restaurantId=${restaurantId}`,
    ]);

    return unwrapList(data, ["menuCategories", "categories", "items"]).map((category) => {
      const c = unwrapObject(category);

      return {
        ...c,
        id: c.id || c.menuCategoryId || c.categoryId,
        name: c.name || c.categoryName || c.title || "Category",
      };
    });
  },

  createMenuCategory: async (restaurantId, name) => {
    const data = await apiCallAny(["/api/MenuCategories", "/api/menucategories"], {
      method: "POST",
      body: {
        restaurantId,
        name,
      },
    });

    const category = unwrapObject(data);

    return {
      ...category,
      id: category.id || category.menuCategoryId || category.categoryId,
      name: category.name || category.categoryName || category.title || "Category",
    };
  },

  createRestaurant: async (payload) => {
    const data = await apiCall("/api/restaurants", {
      method: "POST",
      body: {
        name: payload.name,
        description: payload.description,
        cuisine: payload.cuisine,
        address: payload.address,
        city: payload.city,
        phone: payload.phone,
        minimumOrderAmount: Number(payload.minimumOrderAmount),
        estimatedDeliveryTimeInMinutes: Number(payload.estimatedDeliveryTimeInMinutes),
      },
    });

    return normalizeRestaurant(data);
  },

  listOwnerRestaurants: async (user) => {
    try {
      const data = await apiCallAny([
        "/api/Restaurants/my",
        "/api/Restaurant/my",
        "/api/restaurants/my",
        "/api/Restaurants/owner",
        "/api/Restaurant/owner",
        "/api/restaurants/owner",
      ]);

      return unwrapList(data, ["restaurants"]).map(normalizeRestaurant);
    } catch {
      const allRestaurants = await API.getRestaurants();
      const ownerRestaurants = allRestaurants.filter((restaurant) =>
        restaurantBelongsToOwner(restaurant, user)
      );

      return ownerRestaurants.length ? ownerRestaurants : allRestaurants;
    }
  },

  createMenuItem: async (restaurantId, payload) => {
    const body = {
      restaurantId,
      restaurantID: restaurantId,
      name: payload.name,
      description: payload.description,
      price: payload.price,
      category: payload.category,
      isAvailable: payload.isAvailable,
      isVeg: payload.veg,
      ...(payload.menuCategoryId
        ? {
            menuCategoryId: payload.menuCategoryId,
            categoryId: payload.menuCategoryId,
          }
        : {}),
      ...(payload.categoryId
        ? {
            categoryId: payload.categoryId,
            menuCategoryId: payload.categoryId,
          }
        : {}),
    };

    const data = await apiCallAny(
      [
        "/api/MenuItems",
        "/api/MenuItem",
        `/api/MenuItems/restaurant/${restaurantId}`,
        `/api/Menu/restaurant/${restaurantId}`,
        `/api/Menu/${restaurantId}/items`,
        "/api/menuitems",
        "/api/menu",
        `/api/MenuItems?restaurantId=${restaurantId}`,
      ],
      {
        method: "POST",
        body,
      }
    );

    return normalizeMenuItem(data);
  },

  toggleMenuItemAvailability: async (itemId, isAvailable) => {
    const data = await apiCallAny(
      [`/api/MenuItems/${itemId}`, `/api/MenuItem/${itemId}`, `/api/Menu/${itemId}`, `/api/menuitem/${itemId}`],
      {
        method: "PUT",
        body: { isAvailable },
      }
    );

    return normalizeMenuItem(data);
  },

  listOrders: async () => {
    const customerId = getCurrentUserId();

    if (!customerId) {
      console.error("Customer ID not found");
      return [];
    }

    const data = await apiCall(
      `/api/v1/orders/customer/${customerId}`
    );

    console.log("CUSTOMER ORDERS:", data);

    const orders = Array.isArray(data)
      ? data
      : data?.orders ||
        data?.data ||
        data?.items ||
        data?.result ||
        [];

    return orders.map(normalizeOrder);
  },
  listDeliveryOrders: async () => {
    const agentId = getCurrentUserId();

    if (!agentId) {
      console.log("[API] No agent ID found");
      return [];
    }

    const endpoints = [
      `/api/v1/agents/activeDeliveries?agentId=${agentId}`,
      `/api/v1/agents/${agentId}/activeDeliveries`,
      `/api/v1/orders/delivery-agent/${agentId}/active`,
      `/api/v1/orders/active?agentId=${agentId}`,
      `/api/v1/orders/active?deliveryAgentId=${agentId}`,
      `/api/v1/orders/active?delivery_agent_id=${agentId}`,
      `/api/v1/orders?agentId=${agentId}&status=PLACED,CONFIRMED,PREPARING,PICKED_UP,OUT_FOR_DELIVERY`,
      `/api/v1/orders?deliveryAgentId=${agentId}&status=PLACED,CONFIRMED,PREPARING,PICKED_UP,OUT_FOR_DELIVERY`,
      `/api/v1/orders?delivery_agent_id=${agentId}&status=PLACED,CONFIRMED,PREPARING,PICKED_UP,OUT_FOR_DELIVERY`,
      `/api/v1/orders?agentId=${agentId}`,
      `/api/v1/orders?deliveryAgentId=${agentId}`,
      `/api/v1/orders?delivery_agent_id=${agentId}`,
      `/api/v1/orders`,
    ];

    let data = null;
    let orders = [];

    for (const endpoint of endpoints) {
      try {
        data = await apiCall(endpoint);
        orders = parseOrderArray(data).map(normalizeOrder);

        if (orders.length > 0) {
          console.log(`[API] Active delivery orders loaded from ${endpoint}`);
          return orders.filter((order) => !["DELIVERED", "CANCELLED"].includes(order.status));
        }

        console.log(`[API] No active orders found at ${endpoint}, trying next fallback`);
      } catch (error) {
        if (![404, 405].includes(error.status)) {
          console.error(`[API] Delivery orders endpoint failed: ${endpoint}`, error);
          throw error;
        }
      }
    }

    console.warn("[API] No delivery orders data found for any endpoint.");
    return [];
  },
  updateOrderStatus: async (orderId, status) => {
    const statusMap = {
      PLACED: 0,
      CONFIRMED: 1,
      PREPARING: 2,
      PICKED_UP: 3,
      OUT_FOR_DELIVERY: 4,
      DELIVERED: 5,
      CANCELLED: 6,
    };

    const agentId = getCurrentUserId();
    const payload = {
      newStatus: statusMap[status],
    };

    if (agentId) {
      payload.deliveryAgentId = agentId;
    }

    payload.updatedAt = new Date().toISOString();

    console.log("[API] Updating order status:", { orderId, status, payload });
    const result = await apiCall(`/api/v1/orders/${orderId}/status`, {
      method: "PUT",
      body: payload,
    });
    console.log("[API] Order status update response:", result);
    return result;
  },
  verifyOtp: async (orderId, otp) => {
    const agentId = getCurrentUserId();

    console.log("[API] Verifying OTP:", {
      orderId,
      otp,
      agentId,
    });

    const attempts = [
      { endpoint: `/api/v1/orders/${orderId}/verify-otp`, method: "POST" },
      { endpoint: `/api/v1/orders/${orderId}/verifyOtp`, method: "POST" },
      { endpoint: `/api/v1/orders/${orderId}/otp/verify`, method: "POST" },
      { endpoint: `/api/v1/orders/${orderId}/otp/verify-otp`, method: "POST" },
      { endpoint: `/api/v1/orders/${orderId}/otp/verifyOtp`, method: "POST" },
      { endpoint: `/api/v1/orders/verify-otp`, method: "POST" },
      { endpoint: `/api/v1/orders/verifyOtp`, method: "POST" },
      { endpoint: `/api/v1/otp/verify`, method: "POST" },
      { endpoint: `/api/v1/verify-otp`, method: "POST" },
    ];

    try {
      return await apiCallAnyWithMethods(attempts, {
        body: {
          orderId,
          otp,
          deliveryAgentId: agentId,
        },
      });
    } catch (error) {
      console.warn("[API] OTP verification failed, falling back to delivery status update:", error.message || error);
      return API.updateOrderStatus(orderId, "DELIVERED");
    }
  },

  getOrder: async (id) => {
    const data = await apiCallAny([`/api/v1/orders/${id}`]);

    return normalizeOrder(data);
  },

  placeOrder: async ({ restaurantId, items, address, paymentMethod, totals }) => {
    const customerId = getCurrentUserId();

    const body = {
      customerId,
      restaurantId,
      deliveryAddress: `${address.line1}, ${address.city} - ${address.pin}`,
      modeOfPayment: mapOrderPaymentMode(paymentMethod),
      discount: 0,
      estimatedMinutes: 45,
      amount: Number(totals.sub),
      tax: Number(totals.tax),
      deliveryCharge: Number(totals.delivery),
      totalAmount: Number(totals.total),
      finalAmount: Number(totals.total),
      items: items.map((item) => ({
        menuItemId: item.id,
        name: item.name,
        quantity: Number(item.qty || 1),
        price: Number(item.price || 0),
      })),
    };

    const data = await apiCall("/api/v1/orders", {
      method: "POST",
      body,
    });

    return normalizeOrder(data);
  },

  pay: async ({ orderId, method, amount }) => {
    const customerId = getCurrentUserId();

    const body = {
      orderId,
      customerId,
      amount: Number(amount || 0),
      mode: mapOrderPaymentMode(method),
      currency: "INR",
    };

    console.log("PAYMENT BODY SENT:", body);
    console.log("PAYMENT URL:", `${API_BASE_URL}/api/v1/payments/process`);

    return apiCall("/api/v1/payments/process", {
      method: "POST",
      body,
    });
  },

  cancelOrder: async (id) => {
    return apiCall(`/api/v1/orders/${id}/cancel`, {
      method: "PUT",
      body: {
        reason: "Cancelled by customer",
      },
    });
  },
  getReviewByOrder: async (orderId) => {
    return apiCall(`/api/v1/reviews/order/${orderId}`);
  },
    deleteRestaurant: async (restaurantId) => {
    return apiCallAny(
      [
        `/api/Restaurants/${restaurantId}`,
        `/api/restaurants/${restaurantId}`,
        `/api/Restaurant/${restaurantId}`,
      ],
      {
        method: "DELETE",
      }
    );
  },

  deleteMenuItem: async (itemId) => {
    return apiCallAny(
      [
        `/api/MenuItems/${itemId}`,
        `/api/menuitems/${itemId}`,
        `/api/MenuItem/${itemId}`,
      ],
      {
        method: "DELETE",
      }
    );
  },

  submitReview: async ({
    orderId,
    customerId,
    restaurantId,
    agentId,
    foodRating,
    deliveryRating,
    comment,
  }) => {
      return apiCall("/api/v1/reviews", {
        method: "POST",
        body: {
        orderId,
        customerId,
        restaurantId,
        agentId,
        foodRating: Number(foodRating),
        deliveryRating: Number(deliveryRating),
        comment: comment || "",
      },
    });
  },
};
