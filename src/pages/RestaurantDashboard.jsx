import { useEffect, useMemo, useState } from "react";
import { API } from "../api/client";
import { useAuthStore } from "../store/auth";
import { useToast } from "../store/toast";

function getRestaurantImage(cuisine) {
  const text = String(cuisine || "").toLowerCase();

  if (text.includes("pizza") || text.includes("italian"))
    return "https://images.unsplash.com/photo-1601924582975-7b673e01c1b0?auto=format&fit=crop&w=600&q=80";

  if (text.includes("indian") || text.includes("north"))
    return "https://images.unsplash.com/photo-1585937421612-70a008356fbe?auto=format&fit=crop&w=600&q=80";

  if (text.includes("burger") || text.includes("fast"))
    return "https://images.unsplash.com/photo-1568901346375-23c9450c58cd?auto=format&fit=crop&w=600&q=80";

  return "https://images.unsplash.com/photo-1504674900247-0877df9cc836?auto=format&fit=crop&w=600&q=80";
}

const css = `
@import url('https://fonts.googleapis.com/css2?family=Syne:wght@400;500;700;800&family=DM+Sans:wght@300;400;500;700&display=swap');

*, *::before, *::after {
  box-sizing: border-box;
  margin: 0;
  padding: 0;
}

body {
  font-family: 'DM Sans', sans-serif;
  background: #f7f3ee;
}

.rdb-page {
  min-height: 100vh;
  background: #f7f3ee;
  padding-bottom: 60px;
}

.rdb-hero {
  background: #0f0e0d;
  padding: 42px 32px 38px;
  position: relative;
  overflow: hidden;
}

.rdb-hero::before {
  content: '';
  position: absolute;
  right: -50px;
  top: -50px;
  width: 260px;
  height: 260px;
  border-radius: 50%;
  border: 45px solid rgba(255, 90, 47, 0.14);
}

.rdb-hero-inner {
  max-width: 1150px;
  margin: 0 auto;
  position: relative;
  z-index: 1;
}

.rdb-hero h1 {
  font-family: 'Syne', sans-serif;
  font-size: clamp(30px, 5vw, 48px);
  font-weight: 800;
  color: #fff;
}

.rdb-hero h1 span {
  color: #ff5a2f;
}

.rdb-hero p {
  color: #aaa;
  margin-top: 8px;
}

.rdb-stats {
  display: flex;
  gap: 14px;
  margin-top: 26px;
  flex-wrap: wrap;
}

.rdb-stat {
  background: rgba(255,255,255,0.08);
  border: 1px solid rgba(255,255,255,0.1);
  border-radius: 14px;
  padding: 14px 22px;
  min-width: 150px;
}

.rdb-stat-val {
  display: block;
  color: #fff;
  font-size: 26px;
  font-weight: 800;
  font-family: 'Syne', sans-serif;
}

.rdb-stat-lbl {
  display: block;
  color: #888;
  font-size: 12px;
  text-transform: uppercase;
  margin-top: 4px;
}

.rdb-body {
  max-width: 1150px;
  margin: -28px auto 0;
  padding: 0 24px;
  position: relative;
  z-index: 2;
}

.rdb-panel {
  background: #fff;
  border-radius: 24px;
  padding: 28px;
  box-shadow: 0 22px 70px rgba(16, 14, 13, 0.1);
  border: 1px solid rgba(14, 12, 10, 0.06);
}

.rdb-form-header,
.rdb-section-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  gap: 18px;
  flex-wrap: wrap;
  margin-bottom: 22px;
}

.rdb-section-header {
  margin: 36px 0 18px;
}

.rdb-section-title {
  font-family: 'Syne', sans-serif;
  font-size: 24px;
  color: #0f0e0d;
  font-weight: 800;
}

.rdb-subtitle {
  color: #666;
  margin-top: 5px;
}

.rdb-badge {
  background: #ffedd8;
  color: #993f15;
  padding: 9px 16px;
  border-radius: 999px;
  font-size: 12px;
  font-weight: 800;
}

.rdb-form-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 18px;
}

.rdb-field {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.rdb-field label {
  font-weight: 700;
  color: #201c18;
}

.rdb-input,
.rdb-select,
.rdb-textarea,
.rdb-search {
  width: 100%;
  border: 1.5px solid #e6ddd4;
  border-radius: 14px;
  padding: 13px 15px;
  font-size: 15px;
  font-family: 'DM Sans', sans-serif;
  background: #fff;
  color: #0f0e0d;
}

.rdb-input:focus,
.rdb-select:focus,
.rdb-textarea:focus,
.rdb-search:focus {
  outline: none;
  border-color: #ff5a2f;
  box-shadow: 0 0 0 4px rgba(255, 90, 47, 0.13);
}

.rdb-textarea {
  min-height: 120px;
  resize: vertical;
}

.rdb-button {
  background: linear-gradient(135deg, #ff5a2f, #ff7b53);
  color: #fff;
  border: none;
  border-radius: 16px;
  padding: 15px 18px;
  font-weight: 800;
  cursor: pointer;
  transition: 0.2s ease;
}

.rdb-button:hover:not(:disabled) {
  transform: translateY(-2px);
  box-shadow: 0 14px 28px rgba(255, 90, 47, 0.25);
}

.rdb-button:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.rdb-filter-row {
  display: flex;
  gap: 8px;
  flex-wrap: wrap;
}

.rdb-pill {
  border: 1.5px solid #ddd;
  background: #fff;
  color: #444;
  border-radius: 999px;
  padding: 7px 15px;
  cursor: pointer;
  font-weight: 700;
}

.rdb-pill.active,
.rdb-pill:hover {
  background: #ff5a2f;
  border-color: #ff5a2f;
  color: #fff;
}

.rdb-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 18px;
}

.rdb-card {
  background: #fff;
  border-radius: 18px;
  overflow: hidden;
  cursor: pointer;
  box-shadow: 0 4px 16px rgba(0,0,0,0.08);
  border: 2px solid transparent;
  transition: 0.2s ease;
}

.rdb-card:hover {
  transform: translateY(-5px);
  box-shadow: 0 14px 32px rgba(0,0,0,0.14);
}

.rdb-card.selected {
  border-color: #ff5a2f;
}

.rdb-card-img {
  width: 100%;
  height: 135px;
  object-fit: cover;
}

.rdb-card-body {
  padding: 16px;
}

.rdb-card-name {
  font-family: 'Syne', sans-serif;
  font-size: 18px;
  font-weight: 800;
}

.rdb-card-cuisine {
  color: #ff5a2f;
  font-weight: 700;
  margin-top: 4px;
}

.rdb-card-city,
.rdb-card-address,
.rdb-card-phone {
  color: #777;
  font-size: 13px;
  margin-top: 3px;
}

.rdb-card-footer {
  display: flex;
  justify-content: space-between;
  margin-top: 14px;
  padding-top: 12px;
  border-top: 1px solid #f0ece7;
  font-size: 13px;
  font-weight: 800;
}
.rdb-min-order {
  color: #5b4b3d;
  font-weight: 800;
  font-size: 13px;
}

.rdb-card-eta {
  background: #f7f3ee;
  border-radius: 8px;
  padding: 3px 8px;
}

.rdb-loading,
.rdb-error,
.rdb-empty {
  background: #fff;
  border-radius: 18px;
  padding: 24px;
  text-align: center;
  color: #666;
}

.rdb-error {
  color: #c7352b;
}

.rdb-menu-section {
  margin-top: 36px;
}

.rdb-menu-header {
  background: #0f0e0d;
  border-radius: 18px;
  padding: 22px;
  display: flex;
  justify-content: space-between;
  gap: 16px;
  flex-wrap: wrap;
  margin-bottom: 20px;
}

.rdb-menu-title {
  color: #fff;
  font-family: 'Syne', sans-serif;
  font-size: 20px;
  font-weight: 800;
}

.rdb-menu-close {
  background: rgba(255,255,255,0.12);
  color: #fff;
  border: none;
  border-radius: 12px;
  padding: 10px 16px;
  cursor: pointer;
}

.rdb-search-row {
  margin-bottom: 18px;
}

.rdb-pill-group {
  display: flex;
  gap: 10px;
  flex-wrap: wrap;
  margin-bottom: 18px;
}

.rdb-menu-list {
  display: grid;
  gap: 14px;
}

.rdb-item-card {
  background: #fff;
  border: 1.5px solid #f0ece7;
  border-radius: 18px;
  padding: 18px;
}

.rdb-item-card:hover {
  border-color: #ff5a2f;
  box-shadow: 0 10px 24px rgba(255, 90, 47, 0.09);
}

.rdb-flex-row {
  display: flex;
  justify-content: space-between;
  gap: 16px;
}

.rdb-actions {
  display: flex;
  gap: 10px;
  flex-wrap: wrap;
  margin-top: 14px;
}

.rdb-small-badge {
  background: #f7f3ee;
  color: #5b4b3d;
  padding: 6px 10px;
  border-radius: 999px;
  font-size: 12px;
  font-weight: 700;
}

.rdb-small-badge.off {
  background: #f7d7d7;
  color: #9c3a3a;
}

@media (max-width: 980px) {
  .rdb-grid {
    grid-template-columns: repeat(2, 1fr);
  }

  .rdb-form-grid {
    grid-template-columns: 1fr;
  }

  .rdb-body {
    padding: 0 16px;
  }
}

@media (max-width: 620px) {
  .rdb-grid {
    grid-template-columns: 1fr;
  }

  .rdb-panel {
    padding: 20px;
  }
}
`;

const initialRestaurantForm = {
  name: "",
  cuisine: "",
  city: "",
  address: "",
  phone: "",
  description: "",
  minimumOrderAmount: 150,
  estimatedDeliveryTimeInMinutes: 30,
};

const initialMenuForm = {
  name: "",
  description: "",
  price: "",
  category: "",
  isAvailable: true,
  veg: true,
};

export default function RestaurantDashboard() {
  const user = useAuthStore((state) => state.user);
  const toast = useToast((state) => state.push);

  const [restaurants, setRestaurants] = useState([]);
  const [menuItems, setMenuItems] = useState([]);
  const [menuCategories, setMenuCategories] = useState([]);
  const [selectedRestaurant, setSelectedRestaurant] = useState(null);

  const [loading, setLoading] = useState(true);
  const [menuLoading, setMenuLoading] = useState(false);

  const [error, setError] = useState("");
  const [menuError, setMenuError] = useState("");

  const [filter, setFilter] = useState("All");
  const [menuSearch, setMenuSearch] = useState("");

  const [restaurantForm, setRestaurantForm] = useState(initialRestaurantForm);
  const [menuForm, setMenuForm] = useState(initialMenuForm);

  const [creatingRestaurant, setCreatingRestaurant] = useState(false);
  const [creatingMenuItem, setCreatingMenuItem] = useState(false);

  useEffect(() => {
    loadDashboard();
  }, []);

  async function loadDashboard() {
    setLoading(true);
    setError("");

    try {
      const data = await API.listOwnerRestaurants(user);
      setRestaurants(data);
    } catch {
      setError("Unable to load your restaurants. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  async function loadMenu(restaurant) {
    setMenuLoading(true);
    setMenuError("");

    const itemsPromise = API.getMenuItemsByRestaurant(restaurant.id, false);
    const categoriesPromise = API.getMenuCategoriesByRestaurant(restaurant.id);

    const [itemsResult, categoriesResult] = await Promise.allSettled([
      itemsPromise,
      categoriesPromise,
    ]);

    if (itemsResult.status === "fulfilled") {
      setMenuItems(itemsResult.value);
    } else {
      console.error("Failed to load menu items:", itemsResult.reason);
      setMenuError("Unable to load menu items.");
    }

    if (categoriesResult.status === "fulfilled") {
      setMenuCategories(categoriesResult.value);
    } else {
      setMenuCategories([]);
    }

    setMenuLoading(false);
  }

  async function handleRestaurantClick(restaurant) {
    setSelectedRestaurant(restaurant);
    setMenuItems([]);
    setMenuSearch("");
    await loadMenu(restaurant);
  }

  function handleClose() {
    setSelectedRestaurant(null);
    setMenuItems([]);
    setMenuSearch("");
    setMenuError("");
  }

  async function handleCreateRestaurant(e) {
    e.preventDefault();

    if (
      !restaurantForm.name ||
      !restaurantForm.cuisine ||
      !restaurantForm.city ||
      !restaurantForm.address ||
      !restaurantForm.phone
    ) {
      toast("Fill in name, cuisine, city, address, and phone.", "error");
      return;
    }

    setCreatingRestaurant(true);

    try {
      const created = await API.createRestaurant({
        name: restaurantForm.name,
        description:
          restaurantForm.description || "Fresh food from your kitchen.",
        cuisine: restaurantForm.cuisine,
        address: restaurantForm.address,
        city: restaurantForm.city,
        phone: restaurantForm.phone,
        minimumOrderAmount: Number(restaurantForm.minimumOrderAmount),
        estimatedDeliveryTimeInMinutes: Number(
          restaurantForm.estimatedDeliveryTimeInMinutes
        ),
      });

      setRestaurants((prev) => [created, ...prev]);
      setSelectedRestaurant(created);
      await loadMenu(created);
      setRestaurantForm(initialRestaurantForm);
      toast("Restaurant created successfully.", "success");
    } catch (error) {
      toast(error.message || "Could not create restaurant.", "error");
    } finally {
      setCreatingRestaurant(false);
    }
  }

  async function handleDeleteRestaurant(restaurantId) {
    const confirmDelete = window.confirm(
      "Are you sure you want to delete this restaurant?"
    );

    if (!confirmDelete) return;

    try {
      await API.deleteRestaurant(restaurantId);

      setRestaurants((prev) =>
        prev.filter((restaurant) => restaurant.id !== restaurantId)
      );

      if (selectedRestaurant?.id === restaurantId) {
        setSelectedRestaurant(null);
        setMenuItems([]);
      }

      toast("Restaurant deleted successfully.", "success");
    } catch (error) {
      toast(error.message || "Failed to delete restaurant.", "error");
    }
  }

  async function handleDeleteMenuItem(itemId) {
    const confirmDelete = window.confirm(
      "Are you sure you want to delete this menu item?"
    );

    if (!confirmDelete) return;

    try {
      await API.deleteMenuItem(itemId);

      setMenuItems((prev) =>
        prev.filter((item) => item.id !== itemId)
      );

      toast("Menu item deleted successfully.", "success");
    } catch (error) {
      toast(error.message || "Failed to delete menu item.", "error");
    }
  }

  async function handleCreateMenuItem(e) {
    e.preventDefault();

    if (!selectedRestaurant) {
      toast("Select a restaurant before adding a menu item.", "error");
      return;
    }

    if (!menuForm.name || !menuForm.price || !menuForm.category) {
      toast("Enter item name, price, and category.", "error");
      return;
    }

    setMenuError("");
    setCreatingMenuItem(true);

    try {
      const categoryText = menuForm.category?.trim();
      let menuCategoryId = null;

      if (categoryText) {
        const existingCategory = menuCategories.find(
          (category) =>
            String(category.name || category.category || "")
              .trim()
              .toLowerCase() === categoryText.toLowerCase()
        );

        if (existingCategory) {
          menuCategoryId = existingCategory.id;
        } else {
          const createdCategory = await API.createMenuCategory(
            selectedRestaurant.id,
            categoryText
          );
          menuCategoryId = createdCategory.id;
          setMenuCategories((prev) => [...prev, createdCategory]);
        }
      }

      const payload = {
        ...menuForm,
        price: Number(menuForm.price),
        ...(menuCategoryId ? { menuCategoryId } : {}),
      };

      const createdItem = await API.createMenuItem(selectedRestaurant.id, payload);
      setMenuItems((prev) => [...prev, createdItem]);
      setMenuForm(initialMenuForm);
      setMenuSearch("");
      toast("Menu item added.", "success");

      // Reload menu to get updated list including the new item
      await loadMenu(selectedRestaurant);
    } catch (error) {
      toast(error.message || "Could not add menu item.", "error");
    } finally {
      setCreatingMenuItem(false);
    }
  }

  const cuisines = useMemo(
    () => [
      "All",
      ...Array.from(
        new Set(restaurants.map((r) => r.cuisine).filter(Boolean))
      ),
    ],
    [restaurants]
  );

  const categories = useMemo(() => {
    const names = new Set(
      menuCategories
        .map((category) => category.name || category.category || "General")
        .filter(Boolean)
    );

    menuItems.forEach((item) => names.add(item.category || "General"));

    return [...names];
  }, [menuCategories, menuItems]);

  const filteredRestaurants = useMemo(() => {
    if (filter === "All") return restaurants;
    return restaurants.filter((r) => r.cuisine === filter);
  }, [filter, restaurants]);

  const filteredMenu = useMemo(
    () =>
      menuItems.filter(
        (item) =>
          item.name.toLowerCase().includes(menuSearch.toLowerCase()) ||
          (item.description || "")
            .toLowerCase()
            .includes(menuSearch.toLowerCase())
      ),
    [menuItems, menuSearch]
  );

  const availableCount = useMemo(
    () => menuItems.filter((item) => item.isAvailable).length,
    [menuItems]
  );

  return (
    <>
      <style>{css}</style>

      <div className="rdb-page">
        <div className="rdb-hero">
          <div className="rdb-hero-inner">
            <h1>
              Restaurant <span>Dashboard</span>
            </h1>
            <p>Select a restaurant to browse its menu.</p>

            <div className="rdb-stats">
              <div className="rdb-stat">
                <span className="rdb-stat-val">{restaurants.length}</span>
                <span className="rdb-stat-lbl">Restaurants</span>
              </div>

              <div className="rdb-stat">
                <span className="rdb-stat-val">{cuisines.length - 1}</span>
                <span className="rdb-stat-lbl">Cuisines</span>
              </div>

              {selectedRestaurant && (
                <div className="rdb-stat">
                  <span className="rdb-stat-val">
                    {availableCount}/{menuItems.length}
                  </span>
                  <span className="rdb-stat-lbl">Items available</span>
                </div>
              )}

              <div className="rdb-stat">
                <button className="rdb-button" onClick={loadDashboard} disabled={loading} style={{ padding: '8px 16px', fontSize: '12px' }}>
                  {loading ? 'Loading...' : 'Refresh'}
                </button>
              </div>
            </div>
          </div>
        </div>

        <div className="rdb-body">
          <section className="rdb-panel">
            <div className="rdb-form-header">
              <div>
                <h2 className="rdb-section-title">Create a restaurant</h2>
                <p className="rdb-subtitle">
                  Publish your kitchen so customers can discover it immediately.
                </p>
              </div>
            </div>

            <form onSubmit={handleCreateRestaurant} className="rdb-form-grid">
              <div className="rdb-field">
                <label>Name</label>
                <input
                  className="rdb-input"
                  value={restaurantForm.name}
                  onChange={(e) =>
                    setRestaurantForm({
                      ...restaurantForm,
                      name: e.target.value,
                    })
                  }
                  placeholder="Restaurant name"
                />
              </div>

              <div className="rdb-field">
                <label>Cuisine</label>
                <input
                  className="rdb-input"
                  value={restaurantForm.cuisine}
                  onChange={(e) =>
                    setRestaurantForm({
                      ...restaurantForm,
                      cuisine: e.target.value,
                    })
                  }
                  placeholder="Indian, Italian, Chinese..."
                />
              </div>

              <div className="rdb-field">
                <label>City</label>
                <input
                  className="rdb-input"
                  value={restaurantForm.city}
                  onChange={(e) =>
                    setRestaurantForm({
                      ...restaurantForm,
                      city: e.target.value,
                    })
                  }
                  placeholder="City name"
                />
              </div>

              <div className="rdb-field">
                <label>Address</label>
                <input
                  className="rdb-input"
                  value={restaurantForm.address}
                  onChange={(e) =>
                    setRestaurantForm({
                      ...restaurantForm,
                      address: e.target.value,
                    })
                  }
                  placeholder="Full restaurant address"
                />
              </div>

              <div className="rdb-field">
                <label>Phone</label>
                <input
                  className="rdb-input"
                  value={restaurantForm.phone}
                  onChange={(e) =>
                    setRestaurantForm({
                      ...restaurantForm,
                      phone: e.target.value,
                    })
                  }
                  placeholder="Phone number"
                />
              </div>

              <div className="rdb-field">
                <label>Minimum order</label>
                <input
                  className="rdb-input"
                  type="number"
                  value={restaurantForm.minimumOrderAmount}
                  onChange={(e) =>
                    setRestaurantForm({
                      ...restaurantForm,
                      minimumOrderAmount: e.target.value,
                    })
                  }
                  placeholder="150"
                />
              </div>

              <div className="rdb-field">
                <label>Estimated delivery time</label>
                <input
                  className="rdb-input"
                  type="number"
                  value={restaurantForm.estimatedDeliveryTimeInMinutes}
                  onChange={(e) =>
                    setRestaurantForm({
                      ...restaurantForm,
                      estimatedDeliveryTimeInMinutes: e.target.value,
                    })
                  }
                  placeholder="30"
                />
              </div>

              <div className="rdb-field" style={{ gridColumn: "1 / -1" }}>
                <label>Description</label>
                <textarea
                  className="rdb-textarea"
                  value={restaurantForm.description}
                  onChange={(e) =>
                    setRestaurantForm({
                      ...restaurantForm,
                      description: e.target.value,
                    })
                  }
                  placeholder="Describe your restaurant."
                />
              </div>

              <button
                type="submit"
                className="rdb-button"
                disabled={creatingRestaurant}
                style={{ gridColumn: "1 / -1" }}
              >
                {creatingRestaurant ? "Creating..." : "Create restaurant"}
              </button>
            </form>
          </section>

          <div className="rdb-section-header">
            <h2 className="rdb-section-title">My restaurants</h2>

            {cuisines.length > 1 && (
              <div className="rdb-filter-row">
                {cuisines.map((c) => (
                  <button
                    key={c}
                    className={`rdb-pill${filter === c ? " active" : ""}`}
                    onClick={() => setFilter(c)}
                  >
                    {c}
                  </button>
                ))}
              </div>
            )}
          </div>

          {loading ? (
            <div className="rdb-loading">Loading restaurants...</div>
          ) : error ? (
            <div className="rdb-error">{error}</div>
          ) : (
            <div className="rdb-grid">
              {filteredRestaurants.length === 0 ? (
                <div className="rdb-empty">
                  No restaurants found yet. Create one above.
                </div>
              ) : (
                filteredRestaurants.map((restaurant) => (
                  <div
                    key={restaurant.id}
                    className={`rdb-card${
                      selectedRestaurant?.id === restaurant.id
                        ? " selected"
                        : ""
                    }`}
                    onClick={() => handleRestaurantClick(restaurant)}
                  >
                    <img
                      src={getRestaurantImage(restaurant.cuisine)}
                      alt={restaurant.name}
                      className="rdb-card-img"
                    />

                    <div className="rdb-card-body">
                      <div className="rdb-card-name">{restaurant.name}</div>
                      <div className="rdb-card-cuisine">
                        {restaurant.cuisine}
                      </div>
                      <div className="rdb-card-city">📍 {restaurant.city}</div>
                      <div className="rdb-card-address">
                        {restaurant.address}
                      </div>
                      <div className="rdb-card-phone">
                        📞 {restaurant.phone}
                      </div>

                      <div className="rdb-card-footer">
                        <span className="rdb-min-order">
                          Min order ₹{restaurant.minimumOrderAmount || 0}
                        </span>

                        <span className="rdb-card-eta">
                          {restaurant.estimatedDeliveryTimeInMinutes || 30} min
                        </span>
                      </div>
                    </div>

                    <div className="rdb-actions">
                      <button
                        className="rdb-menu-close"
                        style={{
                          background: "#ffebe9",
                          color: "#c7352b",
                        }}
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDeleteRestaurant(restaurant.id);
                        }}
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          )}

          {selectedRestaurant && (
            <section className="rdb-panel rdb-menu-section">
              <div className="rdb-menu-header">
                <div>
                  <div className="rdb-menu-title">
                    Manage menu for {selectedRestaurant.name}
                  </div>
                  <p className="rdb-subtitle">
                    Add menu items and manage availability.
                  </p>
                </div>

                <div style={{ display: 'flex', gap: '10px' }}>
                  <button className="rdb-menu-close" onClick={() => loadMenu(selectedRestaurant)} disabled={menuLoading}>
                    {menuLoading ? 'Loading...' : '🔄 Refresh'}
                  </button>
                  <button className="rdb-menu-close" onClick={handleClose}>
                    Close ✕
                  </button>
                </div>
              </div>

              <div className="rdb-search-row">
                <input
                  className="rdb-search"
                  placeholder="Search menu items..."
                  value={menuSearch}
                  onChange={(e) => setMenuSearch(e.target.value)}
                />
              </div>

              {menuLoading ? (
                <div className="rdb-loading">Loading menu...</div>
              ) : (
                <>
                  {menuError && (
                    <div className="rdb-error" style={{ marginBottom: 20 }}>
                      {menuError}
                    </div>
                  )}

                  <div className="rdb-pill-group">
                    {categories.map((category) => (
                      <span key={category} className="rdb-badge">
                        {category}
                      </span>
                    ))}
                  </div>

                  {filteredMenu.length === 0 ? (
                    <div className="rdb-empty">
                      No menu items yet. Add your first item below.
                    </div>
                  ) : (
                    <div className="rdb-menu-list">
                      {filteredMenu.map((item) => (
                        <div key={item.id} className="rdb-item-card">
                          <div className="rdb-flex-row">
                            <div>
                              <h3>{item.name}</h3>
                              <p>{item.description || "No description added."}</p>
                            </div>

                            <div className="rdb-small-badge">₹{item.price}</div>
                          </div>

                          <div className="rdb-actions">
  <span
    className={`rdb-small-badge${item.isAvailable ? "" : " off"}`}
  >
    {item.isAvailable ? "Available" : "Sold out"}
  </span>

  <span className="rdb-small-badge">
    {item.category || "General"}
  </span>

  <span className="rdb-small-badge">
    {item.veg ? "Veg" : "Non-veg"}
  </span>

  <button
    className="rdb-menu-close"
    style={{
      background: "#ffebe9",
      color: "#c7352b",
      marginLeft: "auto",
    }}
    onClick={() => handleDeleteMenuItem(item.id)}
  >
    Delete
  </button>
</div>
                        </div>
                      ))}
                    </div>
                  )}

                  <div className="rdb-panel" style={{ marginTop: 24 }}>
                    <div className="rdb-form-header">
                      <div>
                        <h3 className="rdb-section-title">Add menu item</h3>
                        <p className="rdb-subtitle">Fill item details and publish it.</p>
                      </div>
                    </div>

                    <form onSubmit={handleCreateMenuItem} className="rdb-form-grid">
                      <div className="rdb-field">
                        <label>Item name</label>
                        <input
                          className="rdb-input"
                          value={menuForm.name}
                          onChange={(e) =>
                            setMenuForm({ ...menuForm, name: e.target.value })
                          }
                          placeholder="Paneer tikka"
                        />
                      </div>

                      <div className="rdb-field">
                        <label>Category</label>
                        <input
                          className="rdb-input"
                          value={menuForm.category}
                          onChange={(e) =>
                            setMenuForm({ ...menuForm, category: e.target.value })
                          }
                          placeholder="Starters"
                        />
                      </div>

                      <div className="rdb-field">
                        <label>Price</label>
                        <input
                          className="rdb-input"
                          type="number"
                          value={menuForm.price}
                          onChange={(e) =>
                            setMenuForm({ ...menuForm, price: e.target.value })
                          }
                          placeholder="299"
                        />
                      </div>

                      <div className="rdb-field">
                        <label>Dietary type</label>
                        <select
                          className="rdb-select"
                          value={menuForm.veg ? "veg" : "nonveg"}
                          onChange={(e) =>
                            setMenuForm({
                              ...menuForm,
                              veg: e.target.value === "veg",
                            })
                          }
                        >
                          <option value="veg">Vegetarian</option>
                          <option value="nonveg">Non-vegetarian</option>
                        </select>
                      </div>

                      <div className="rdb-field">
                        <label>Availability</label>
                        <select
                          className="rdb-select"
                          value={menuForm.isAvailable ? "available" : "unavailable"}
                          onChange={(e) =>
                            setMenuForm({
                              ...menuForm,
                              isAvailable: e.target.value === "available",
                            })
                          }
                        >
                          <option value="available">Available</option>
                          <option value="unavailable">Sold out</option>
                        </select>
                      </div>

                      <div className="rdb-field" style={{ gridColumn: "1 / -1" }}>
                        <label>Description</label>
                        <textarea
                          className="rdb-textarea"
                          value={menuForm.description}
                          onChange={(e) =>
                            setMenuForm({ ...menuForm, description: e.target.value })
                          }
                          placeholder="Short item description"
                        />
                      </div>

                      <button
                        type="submit"
                        className="rdb-button"
                        disabled={creatingMenuItem}
                        style={{ gridColumn: "1 / -1" }}
                      >
                        {creatingMenuItem ? "Adding item..." : "Add menu item"}
                      </button>
                    </form>
                  </div>
                </>
              )}
            </section>
          )}
        </div>
      </div>
    </>
  );
}