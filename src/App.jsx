import { useEffect, useState } from "react";
import recommendationData from "./recommendations.json";
import "./App.css";

const categoryIcons = {
  Perfumes: "PF",
  Electronics: "EL",
  Toys: "TY",
  Books: "BK",
  "Home Appliances": "HA",
  Clothes: "CL",
  Sports: "SP",
};

const navItems = [
  { id: "home", label: "Home" },
  { id: "about", label: "About" },
  { id: "cart", label: "Shopping Cart" },
];

function formatPrice(price) {
  return `$${price.toFixed(0)}`;
}

function formatRating(rating) {
  return rating.toFixed(1);
}

function App() {
  const { recommendations } = recommendationData;
  const [activePage, setActivePage] = useState("home");
  const [feedbackMessage, setFeedbackMessage] = useState("");
  const [isCartHighlighted, setIsCartHighlighted] = useState(false);
  const [spotlightProductId, setSpotlightProductId] = useState(null);
  const [cartItems, setCartItems] = useState(() => {
    const savedCart = localStorage.getItem("cart-items");
    return savedCart ? JSON.parse(savedCart) : [];
  });

  useEffect(() => {
    localStorage.setItem("cart-items", JSON.stringify(cartItems));
  }, [cartItems]);

  useEffect(() => {
    if (!feedbackMessage) {
      return undefined;
    }

    const timer = window.setTimeout(() => {
      setFeedbackMessage("");
    }, 2200);

    return () => window.clearTimeout(timer);
  }, [feedbackMessage]);

  useEffect(() => {
    if (!isCartHighlighted) {
      return undefined;
    }

    const timer = window.setTimeout(() => {
      setIsCartHighlighted(false);
    }, 500);

    return () => window.clearTimeout(timer);
  }, [isCartHighlighted]);

  useEffect(() => {
    if (activePage !== "home") {
      setSpotlightProductId(null);
    }
  }, [activePage]);

  function showSpotlight(productId) {
    setSpotlightProductId(productId);
  }

  function closeSpotlight() {
    setSpotlightProductId(null);
  }

  function addToCart(product) {
    setCartItems((currentItems) => {
      const existingItem = currentItems.find((item) => item.id === product.product_id);

      if (existingItem) {
        return currentItems.map((item) =>
          item.id === product.product_id
            ? { ...item, quantity: item.quantity + 1 }
            : item,
        );
      }

      return [
        ...currentItems,
        {
          id: product.product_id,
          name: product.product_name,
          price: product.price,
          category: product.category,
          quantity: 1,
        },
      ];
    });

    setFeedbackMessage(`${product.product_name} added to cart`);
    setIsCartHighlighted(true);
  }

  function clearCart() {
    setCartItems([]);
  }

  const totalItems = cartItems.reduce((sum, item) => sum + item.quantity, 0);
  const totalPrice = cartItems.reduce(
    (sum, item) => sum + item.price * item.quantity,
    0,
  );
  const spotlightProduct = recommendations.find(
    (product) => product.product_id === spotlightProductId,
  );

  function renderProductCard(product, extraClassName = "", withViewButton = false) {
    return (
      <article
        className={`product-card ${extraClassName}`.trim()}
        key={product.product_id}
      >
        {withViewButton && (
          <button
            className="view-product-button"
            onClick={() => showSpotlight(product.product_id)}
            type="button"
          >
            View
          </button>
        )}

        <div className="card-top">
          <span className="category-badge">
            {categoryIcons[product.category] ?? "--"} {product.category}
          </span>
          <span className="product-id">#{product.product_id}</span>
        </div>

        <div className="product-mark">{categoryIcons[product.category] ?? "--"}</div>

        <div className="card-content">
          <h3>{product.product_name}</h3>
          <p className="subcategory">{product.subcategory}</p>

          <div className="price-row">
            <strong>{formatPrice(product.price)}</strong>
            <span>{product.price_tier}</span>
          </div>

          <div className="card-meta">
            <div>
              <span>Score</span>
              <strong>{product.recommendation_score.toFixed(2)}</strong>
            </div>
            <div>
              <span>Rating</span>
              <strong>
                {formatRating(product.avg_rating)} ({product.rating_count})
              </strong>
            </div>
            <div>
              <span>Season</span>
              <strong>{product.seasonality}</strong>
            </div>
          </div>

          <button
            className="primary-button"
            onClick={() => addToCart(product)}
            type="button"
          >
            Add to Cart
          </button>
        </div>
      </article>
    );
  }

  return (
    <div className="page-shell">
      <header className="topbar">
        <div className="brand-block">
          <span className="brand-mark">Northstar Store</span>
          <p>Simple product browsing experience</p>
        </div>

        <nav className="nav-links" aria-label="Main navigation">
          {navItems.map((item) => (
            <button
              key={item.id}
              className={`nav-link ${activePage === item.id ? "active" : ""}`}
              onClick={() => setActivePage(item.id)}
              type="button"
            >
              {item.label}
            </button>
          ))}
        </nav>

        <button
          className={`cart-pill ${isCartHighlighted ? "cart-pill-highlight" : ""}`}
          onClick={() => setActivePage("cart")}
          type="button"
        >
          Cart ({totalItems})
        </button>
      </header>

      <section className="hero-banner">
        <span className="eyebrow">Product Collection</span>
        <h1>Featured Products</h1>
        <p>
          Browse the collection, explore product details, and keep your selected
          items in one convenient shopping cart.
        </p>
      </section>

      {activePage === "home" && (
        <section className="page-section">
          <div className="section-heading">
            <div>
              <span className="eyebrow">Home</span>
              <h2>Available products</h2>
            </div>
            <p>
              Explore the products in a clean catalog layout with category, price,
              rating, and season details.
            </p>
          </div>

          <div className="cards-grid">
            {recommendations.map((product) => (
              <div key={product.product_id}>
                {renderProductCard(product, "", true)}
              </div>
            ))}
          </div>

          {spotlightProduct && (
            <>
              <button
                className="spotlight-backdrop"
                aria-label="Close product view"
                onClick={closeSpotlight}
                type="button"
              />
              <div className="spotlight-layer">
                <button
                  className="spotlight-close-button"
                  aria-label="Close product view"
                  onClick={closeSpotlight}
                  type="button"
                >
                  Close
                </button>
                {renderProductCard(spotlightProduct, "spotlight-card")}
              </div>
            </>
          )}
        </section>
      )}

      {activePage === "about" && (
        <section className="page-section">
          <div className="section-heading">
            <div>
              <span className="eyebrow">About</span>
              <h2>About this store</h2>
            </div>
            <p>
              A simple storefront interface for browsing products and organizing
              selected items before checkout.
            </p>
          </div>

          <div className="info-grid">
            <article className="info-card">
              <h3>What visitors can do</h3>
              <p>
                Visitors can browse products, review prices and ratings, and add
                preferred items to the shopping cart.
              </p>
            </article>

            <article className="info-card">
              <h3>Main sections</h3>
              <ul className="info-list">
                <li>
                  <strong>Home</strong> shows the full product collection.
                </li>
                <li>
                  <strong>Shopping Cart</strong> keeps track of selected items.
                </li>
                <li>
                  <strong>About</strong> explains the storefront in a clear way.
                </li>
              </ul>
            </article>
          </div>
        </section>
      )}

      {activePage === "cart" && (
        <section className="page-section">
          <div className="section-heading">
            <div>
              <span className="eyebrow">Shopping Cart</span>
              <h2>Your selected items</h2>
            </div>
            <p>
              Review products you added, check the total quantity, and clear the
              cart whenever you want.
            </p>
          </div>

          <div className="cart-layout">
            <article className="cart-panel">
              <h3>Cart items</h3>

              {cartItems.length === 0 ? (
                <p className="empty-state">Your cart is currently empty.</p>
              ) : (
                <div className="cart-items">
                  {cartItems.map((item) => (
                    <div className="cart-item" key={item.id}>
                      <div>
                        <strong>{item.name}</strong>
                        <p>
                          {item.category} · Quantity: {item.quantity}
                        </p>
                      </div>
                      <span>{formatPrice(item.price * item.quantity)}</span>
                    </div>
                  ))}
                </div>
              )}
            </article>

            <aside className="cart-panel summary-panel">
              <h3>Summary</h3>
              <div className="summary-row">
                <span>Total items</span>
                <strong>{totalItems}</strong>
              </div>
              <div className="summary-row">
                <span>Estimated total</span>
                <strong>{formatPrice(totalPrice)}</strong>
              </div>
              <button className="secondary-button" onClick={clearCart} type="button">
                Clear Cart
              </button>
            </aside>
          </div>
        </section>
      )}

      <div className={`feedback-toast ${feedbackMessage ? "show" : ""}`}>
        {feedbackMessage}
      </div>
    </div>
  );
}

export default App;
