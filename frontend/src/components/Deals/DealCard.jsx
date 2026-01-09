import './DealCard.css';

export default function DealCard({ deal, showFitReason = false }) {
  const {
    title,
    brand,
    category,
    price,
    originalPrice,
    retailer,
    url,
    imageUrl,
    tags = [],
    fitReason,
    expiresAt
  } = deal;

  const discountPercent = originalPrice 
    ? Math.round((1 - price / originalPrice) * 100) 
    : 0;

  const formatPrice = (p) => `$${p.toFixed(2)}`;

  const isExpiringSoon = expiresAt && 
    new Date(expiresAt) < new Date(Date.now() + 3 * 24 * 60 * 60 * 1000);

  return (
    <article className="deal-card card">
      <div className="deal-image-wrapper">
        {imageUrl ? (
          <img 
            src={imageUrl} 
            alt={title} 
            className="deal-image"
            loading="lazy"
          />
        ) : (
          <div className="deal-image-placeholder">
            <span>⛳</span>
          </div>
        )}
        {discountPercent > 0 && (
          <span className="deal-discount-badge">
            {discountPercent}% OFF
          </span>
        )}
      </div>

      <div className="deal-content">
        <div className="deal-meta">
          <span className="deal-brand">{brand}</span>
          <span className="deal-category">{category}</span>
        </div>

        <h3 className="deal-title">{title}</h3>

        <div className="deal-pricing">
          <span className="deal-price">{formatPrice(price)}</span>
          {originalPrice && originalPrice > price && (
            <span className="deal-original-price">{formatPrice(originalPrice)}</span>
          )}
        </div>

        <div className="deal-retailer">
          at <strong>{retailer}</strong>
        </div>

        {tags.length > 0 && (
          <div className="deal-tags">
            {tags.slice(0, 3).map((tag, i) => (
              <span key={i} className="tag tag-primary">{tag}</span>
            ))}
          </div>
        )}

        {showFitReason && fitReason && (
          <div className="deal-fit-reason">
            <span className="fit-icon">✓</span>
            {fitReason}
          </div>
        )}

        {isExpiringSoon && (
          <div className="deal-expiring">
            ⏰ Deal expires soon!
          </div>
        )}

        <a 
          href={url} 
          target="_blank" 
          rel="noopener noreferrer" 
          className="btn btn-primary deal-cta"
        >
          View Deal →
        </a>
      </div>
    </article>
  );
}
