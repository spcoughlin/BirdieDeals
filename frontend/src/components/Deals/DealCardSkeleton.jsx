import './DealCardSkeleton.css';

export default function DealCardSkeleton() {
  return (
    <div className="deal-card-skeleton card">
      <div className="skeleton-image skeleton"></div>
      <div className="skeleton-content">
        <div className="skeleton-meta skeleton"></div>
        <div className="skeleton-title skeleton"></div>
        <div className="skeleton-title-2 skeleton"></div>
        <div className="skeleton-price skeleton"></div>
        <div className="skeleton-retailer skeleton"></div>
        <div className="skeleton-tags">
          <div className="skeleton-tag skeleton"></div>
          <div className="skeleton-tag skeleton"></div>
        </div>
        <div className="skeleton-button skeleton"></div>
      </div>
    </div>
  );
}
