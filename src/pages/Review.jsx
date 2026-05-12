import { useEffect, useState } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { API } from "../api/client";
import { useToast } from "../store/toast";

function StarRow({ value, onChange, readOnly = false }) {
  const [hover, setHover] = useState(0);
  const display = readOnly ? value : hover || value;

  return (
    <div style={{ display: "flex", gap: 4, marginBottom: 8 }}>
      {[1, 2, 3, 4, 5].map((n) => (
        <button
          type="button"
          key={n}
          disabled={readOnly}
          onClick={() => !readOnly && onChange(n)}
          onMouseEnter={() => !readOnly && setHover(n)}
          onMouseLeave={() => !readOnly && setHover(0)}
          style={{
            fontSize: "1.8rem",
            color: n <= display ? "var(--mustard)" : "var(--line)",
            transition: "color 0.15s",
            padding: 0,
            lineHeight: 1,
            cursor: readOnly ? "default" : "pointer",
          }}
          aria-label={`${n} star${n > 1 ? "s" : ""}`}
        >
          ★
        </button>
      ))}
    </div>
  );
}

function getCurrentUserId() {
  try {
    const user = JSON.parse(localStorage.getItem("quickbite_user") || "{}");
    return user.id || user.userId || user.userID || "";
  } catch {
    return "";
  }
}

export default function Review() {
  const { id } = useParams();

  const [order, setOrder] = useState(null);
  const [existingReview, setExistingReview] = useState(null);

  const [food, setFood] = useState(5);
  const [delivery, setDelivery] = useState(5);
  const [comment, setComment] = useState("");

  const [loading, setLoading] = useState(false);
  const [pageLoading, setPageLoading] = useState(true);

  const toast = useToast((s) => s.push);
  const nav = useNavigate();

  useEffect(() => {
    const loadPage = async () => {
      try {
        const orderData = await API.getOrder(id);
        setOrder(orderData);

        try {
          const reviewData = await API.getReviewByOrder(id);
          setExistingReview(reviewData);
        } catch (reviewError) {
          if (reviewError.status !== 404) {
            toast(reviewError.message || "Could not load existing review", "error");
          }
        }
      } catch (error) {
        toast(error.message || "Could not load order details", "error");
      } finally {
        setPageLoading(false);
      }
    };

    loadPage();
  }, [id]);

  const submit = async () => {
    if (!order) {
      toast("Order details not loaded yet", "error");
      return;
    }

    const customerId = getCurrentUserId();

    if (!customerId) {
      toast("Customer ID not found. Please login again.", "error");
      return;
    }

    if (!order.restaurantId) {
      toast("Restaurant ID not found for this order", "error");
      return;
    }

    if (!order.deliveryAgentId && !order.agentId) {
      toast("Delivery agent ID not found for this order", "error");
      return;
    }

    setLoading(true);

    try {
      const savedReview = await API.submitReview({
        orderId: id,
        customerId,
        restaurantId: order.restaurantId,
        agentId: order.deliveryAgentId || order.agentId,
        foodRating: food,
        deliveryRating: delivery,
        comment,
      });

      setExistingReview(savedReview);
      toast("Thanks for the review!", "success");
    } catch (error) {
      toast(error.message || "Could not submit review", "error");
    } finally {
      setLoading(false);
    }
  };

  if (pageLoading) {
    return (
      <div className="page">
        <div className="empty-state">
          <h3>Loading review page...</h3>
        </div>
      </div>
    );
  }

  if (existingReview) {
    return (
      <div className="page">
        <div className="page-header" style={{ textAlign: "center" }}>
          <span className="eyebrow">Order #{id}</span>
          <h1>Your review</h1>
          <p>You have already submitted feedback for this order.</p>
        </div>

        <div className="review-card">
          <h3>Food quality</h3>
          <StarRow value={existingReview.foodRating || existingReview.FoodRating || 0} readOnly />

          <h3>Delivery experience</h3>
          <StarRow value={existingReview.deliveryRating || existingReview.DeliveryRating || 0} readOnly />

          <div className="field">
            <label>Your comment</label>
            <p className="muted" style={{ marginTop: 8 }}>
              {existingReview.comment ||
                existingReview.Comment ||
                "No comment added."}
            </p>
          </div>

          <Link to="/orders" className="btn btn-primary btn-block">
            Back to My Orders
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="page">
      <div className="page-header" style={{ textAlign: "center" }}>
        <span className="eyebrow">Order #{id}</span>
        <h1>Share your experience</h1>
        <p>
          Your feedback helps the restaurant and the delivery agent improve every order.
        </p>
      </div>

      <div className="review-card">
        <h3>Food quality</h3>
        <StarRow value={food} onChange={setFood} />
        <p className="muted" style={{ fontSize: "0.85rem", marginBottom: 24 }}>
          {["", "Not great", "Could be better", "Decent", "Really good", "Loved it"][food]}
        </p>

        <h3>Delivery experience</h3>
        <StarRow value={delivery} onChange={setDelivery} />
        <p className="muted" style={{ fontSize: "0.85rem", marginBottom: 24 }}>
          {["", "Not great", "Could be better", "On time", "Quick", "Faster than expected"][delivery]}
        </p>

        <div className="field">
          <label>Tell us more (optional)</label>
          <textarea
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            rows={5}
            placeholder="I really liked the food and the delivery agent was on time."
          />
        </div>

        <button className="btn btn-primary btn-block" onClick={submit} disabled={loading}>
          {loading ? "Submitting…" : "Submit review"}
        </button>
      </div>
    </div>
  );
}