import { Link } from 'react-router-dom';
import './ProfileSummaryCard.css';

export default function ProfileSummaryCard({ profile, reasoning, gappingAnalysis, riskScores }) {
  if (!profile) return null;

  const { 
    handicap, 
    roundsPerMonth, 
    budgetPreference,
    budgetSensitivity,
    driverCarry,
    clubCount,
    topGaps = [] 
  } = profile;

  // Use budgetSensitivity (backend) or budgetPreference (frontend) 
  const displayBudget = budgetPreference || budgetSensitivity || 'N/A';

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
            <span className="stat-value capitalize">{displayBudget}</span>
            <span className="stat-label">Budget Style</span>
          </div>
          {driverCarry && (
            <div className="stat">
              <span className="stat-value">{driverCarry}y</span>
              <span className="stat-label">Driver Carry</span>
            </div>
          )}
          {clubCount > 0 && (
            <div className="stat">
              <span className="stat-value">{clubCount}</span>
              <span className="stat-label">Clubs</span>
            </div>
          )}
        </div>

        {/* Show risk scores if available */}
        {riskScores?.wedgeWearRisk && (
          <div className="summary-risks">
            <span className="risks-label">Risk Analysis:</span>
            <div className="risks-list">
              <span className={`tag tag-${riskScores.wedgeWearRisk === 'high' ? 'warning' : 'info'}`}>
                Wedge Wear: {riskScores.wedgeWearRisk}
              </span>
            </div>
          </div>
        )}

        {/* Show gapping analysis if available */}
        {gappingAnalysis?.hasGap && (
          <div className="summary-gaps">
            <span className="gaps-label">Gap Detected:</span>
            <div className="gaps-list">
              <span className="tag tag-accent">{gappingAnalysis.gapType?.replace('-', ' ')}</span>
            </div>
            {gappingAnalysis.gapDetails && (
              <p className="gap-details">{gappingAnalysis.gapDetails}</p>
            )}
          </div>
        )}

        {/* Show equipment gaps from topGaps array */}
        {topGaps.length > 0 && !gappingAnalysis?.hasGap && (
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
