import { Link } from 'react-router-dom';
import './EmptyState.css';

export default function EmptyState({ 
  icon = '🔍',
  title = 'No deals found',
  message = 'Try adjusting your filters to find more deals.',
  actionLabel,
  actionTo,
  onActionClick
}) {
  return (
    <div className="empty-state">
      <span className="empty-icon">{icon}</span>
      <h3 className="empty-title">{title}</h3>
      <p className="empty-message">{message}</p>
      {actionLabel && (
        actionTo ? (
          <Link to={actionTo} className="btn btn-primary">
            {actionLabel}
          </Link>
        ) : (
          <button onClick={onActionClick} className="btn btn-primary">
            {actionLabel}
          </button>
        )
      )}
    </div>
  );
}
