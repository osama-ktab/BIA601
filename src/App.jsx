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

function formatPrice(price) {
  return `$${price.toFixed(0)}`;
}

function formatRating(rating) {
  return rating.toFixed(1);
}

function App() {
  const { recommendations } = recommendationData;

  return (
    <div className="page-shell">
      <header className="hero-header">
        <span className="eyebrow">Product Collection</span>
        <h1>Featured Products</h1>
        {/* <p>
          Browse the products available in this collection through a clean and
          simple card layout.
        </p> */}
      </header>

      <section className="products-section">
        <div className="section-heading">
          <div>
            <span className="eyebrow">Product Grid</span>
            <h2>Available products</h2>
          </div>
        </div>

        <div className="cards-grid">
          {recommendations.map((product) => (
            <article className="product-card" key={product.product_id}>
              <div className="card-top">
                <span className="category-badge">
                  {categoryIcons[product.category] ?? "--"} {product.category}
                </span>
                <span className="product-id">#{product.product_id}</span>
              </div>

              <div className="product-mark">
                {categoryIcons[product.category] ?? "--"}
              </div>

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
                      {formatRating(product.avg_rating)} ({product.rating_count}
                      )
                    </strong>
                  </div>
                  <div>
                    <span>Season</span>
                    <strong>{product.seasonality}</strong>
                  </div>
                </div>
              </div>
            </article>
          ))}
        </div>
      </section>
    </div>
  );
}

export default App;
