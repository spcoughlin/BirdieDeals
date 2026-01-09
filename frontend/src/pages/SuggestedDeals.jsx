import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Layout from '../components/Layout/Layout';
import DealCard from '../components/Deals/DealCard';
import DealCardSkeleton from '../components/Deals/DealCardSkeleton';
import EmptyState from '../components/Deals/EmptyState';
import ProfileSummaryCard from '../components/Profile/ProfileSummaryCard';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { apiClient } from '../api/client';
import './SuggestedDeals.css';

export default function SuggestedDeals() {
  const { isAuthenticated, loading: authLoading, logout } = useAuth();
  const navigate = useNavigate();
  const toast = useToast();

  const [deals, setDeals] = useState([]);
  const [reasoning, setReasoning] = useState('');
  const [profileSummary, setProfileSummary] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      toast.warning('Please log in to see personalized deals');
      navigate('/login', { state: { from: '/suggested' } });
    }
  }, [isAuthenticated, authLoading, navigate, toast]);

  useEffect(() => {
    async function fetchSuggestedDeals() {
      if (!isAuthenticated) return;

      try {
        setLoading(true);
        setError(null);
        const response = await apiClient.getSuggestedDeals();
        setDeals(response.deals || []);
        setReasoning(response.reasoning || '');
        setProfileSummary(response.profileSummary || null);
      } catch (err) {
        if (err.message === 'Unauthorized') {
          logout();
          toast.error('Session expired. Please log in again.');
          navigate('/login');
          return;
        }
        setError(err.message || 'Failed to load personalized deals');
      } finally {
        setLoading(false);
      }
    }

    if (isAuthenticated) {
      fetchSuggestedDeals();
    }
  }, [isAuthenticated, logout, navigate, toast]);

  if (authLoading) {
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

  if (!isAuthenticated) {
    return null;
  }

  return (
    <Layout>
      <div className="page">
        <div className="container">
          <div className="page-header">
            <h1 className="page-title">Deals For You</h1>
            <p className="page-subtitle">
              Personalized recommendations based on your bag profile
            </p>
          </div>

          {loading ? (
            <>
              <div className="profile-skeleton skeleton" style={{ height: '180px', marginBottom: 'var(--space-xl)' }} />
              <div className="deals-grid grid grid-3">
                {Array.from({ length: 4 }, (_, i) => (
                  <DealCardSkeleton key={i} />
                ))}
              </div>
            </>
          ) : error ? (
            <EmptyState 
              icon="⚠️"
              title="Couldn't load your deals"
              message={error}
              actionLabel="Try Again"
              onActionClick={() => window.location.reload()}
            />
          ) : (
            <>
              <ProfileSummaryCard 
                profile={profileSummary} 
                reasoning={reasoning} 
              />

              {deals.length === 0 ? (
                <EmptyState 
                  icon="🎯"
                  title="No personalized deals yet"
                  message="Complete your profile to get better recommendations."
                  actionLabel="Update Profile"
                  actionTo="/account"
                />
              ) : (
                <>
                  <p className="results-count">
                    Found {deals.length} deal{deals.length !== 1 ? 's' : ''} matched to your profile
                  </p>
                  <div className="deals-grid grid grid-3">
                    {deals.map(deal => (
                      <DealCard 
                        key={deal.id} 
                        deal={deal} 
                        showFitReason={true}
                      />
                    ))}
                  </div>
                </>
              )}
            </>
          )}
        </div>
      </div>
    </Layout>
  );
}
