import { useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import Layout from '../components/Layout/Layout';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import './Account.css';

export default function Account() {
  const { isAuthenticated, user, loading, logout } = useAuth();
  const navigate = useNavigate();
  const toast = useToast();

  useEffect(() => {
    if (!loading && !isAuthenticated) {
      toast.warning('Please log in to view your account');
      navigate('/login');
    }
  }, [isAuthenticated, loading, navigate, toast]);

  const handleLogout = () => {
    logout();
    toast.success('Logged out successfully');
    navigate('/');
  };

  if (loading || !isAuthenticated) {
    return (
      <Layout>
        <div className="page">
          <div className="container">
            <div className="loading-state">Loading...</div>
          </div>
        </div>
      </Layout>
    );
  }

  const profile = user?.profile || {};

  return (
    <Layout>
      <div className="page account-page">
        <div className="container">
          <div className="account-container">
            <div className="page-header">
              <h1 className="page-title">Your Account</h1>
            </div>

            <div className="account-section card">
              <div className="card-body">
                <h2>Account Details</h2>
                <div className="account-details">
                  <p><strong>Username:</strong> {user?.username || 'N/A'}</p>
                  <p><strong>Email:</strong> {user?.email || 'N/A'}</p>
                </div>
              </div>
            </div>

            <div className="account-section card">
              <div className="card-body">
                <div className="section-header">
                  <h2>Golf Profile</h2>
                  <Link to="/register" className="btn btn-ghost btn-sm">
                    Edit Profile
                  </Link>
                </div>
                <div className="profile-details">
                  <div className="profile-row">
                    <span className="profile-label">Handicap</span>
                    <span className="profile-value">{profile.handicap || 'Not set'}</span>
                  </div>
                  <div className="profile-row">
                    <span className="profile-label">Age Range</span>
                    <span className="profile-value">{profile.ageRange || 'Not set'}</span>
                  </div>
                  <div className="profile-row">
                    <span className="profile-label">Dominant Hand</span>
                    <span className="profile-value">{profile.dominantHand || 'Not set'}</span>
                  </div>
                  <div className="profile-row">
                    <span className="profile-label">Years Playing</span>
                    <span className="profile-value">{profile.yearsPlaying || 'Not set'}</span>
                  </div>
                  <div className="profile-row">
                    <span className="profile-label">Rounds/Month</span>
                    <span className="profile-value">{profile.roundsPerMonth || 'Not set'}</span>
                  </div>
                  <div className="profile-row">
                    <span className="profile-label">Budget Preference</span>
                    <span className="profile-value capitalize">{profile.budgetPreference || 'Not set'}</span>
                  </div>
                  {profile.preferredBrands?.length > 0 && (
                    <div className="profile-row">
                      <span className="profile-label">Preferred Brands</span>
                      <span className="profile-value">{profile.preferredBrands.join(', ')}</span>
                    </div>
                  )}
                </div>
              </div>
            </div>

            <div className="account-section card">
              <div className="card-body">
                <h2>Your Bag</h2>
                {profile.clubs?.length > 0 ? (
                  <ul className="clubs-list">
                    {profile.clubs.map((club, i) => (
                      <li key={i}>
                        <strong>{club.type}:</strong> {club.brand} {club.model}
                        {club.modelYear && ` (${club.modelYear})`}
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className="empty-text">No clubs added yet. <Link to="/register">Add your bag</Link></p>
                )}
              </div>
            </div>

            <div className="account-actions">
              <Link to="/suggested" className="btn btn-primary">
                View My Deals
              </Link>
              <button onClick={handleLogout} className="btn btn-secondary">
                Log Out
              </button>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
}
