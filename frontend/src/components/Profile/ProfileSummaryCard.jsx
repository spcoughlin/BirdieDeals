import { Link } from 'react-router-dom';
import './ProfileSummaryCard.css';

export default function ProfileSummaryCard({ profile, reasoning }) {
  if (!profile) return null;

  const { handicap, roundsPerMonth, budgetPreference, topGaps = [] } = profile;

  return (
    <div className="profile-summary-card card">
      <div className="card-body">
        <div className="summary-header">
          <h3 className="summary-title">Your Profile Summary</h3>
          <Link to="/account" className="btn btn-ghost btn-sm">
            Edit Profile
          </Link>
        </div>

        <div className="summary-stats">
          <div className="stat">
            <span className="stat-value">{handicap ?? 'N/A'}</span>
            <span className="stat-label">Handicap</span>
          </div>
          <div className="stat">
            <span className="stat-value">{roundsPerMonth ?? 'N/A'}</span>
            <span className="stat-label">Rounds/Month</span>
          </div>
          <div className="stat">
            <span className="stat-value capitalize">{budgetPreference ?? 'N/A'}</span>
            <span className="stat-label">Budget Style</span>
          </div>
        </div>

        {topGaps.length > 0 && (
          <div className="summary-gaps">
            <span className="gaps-label">Your top equipment gaps:</span>
            <div className="gaps-list">
              {topGaps.map((gap, i) => (
                <span key={i} className="tag tag-accent">{gap}</span>
              ))}
            </div>
          </div>
        )}

        {reasoning && (
          <div className="summary-reasoning">
            <span className="reasoning-icon">💡</span>
            <p>{reasoning}</p>
          </div>
        )}
      </div>
    </div>
  );
}
