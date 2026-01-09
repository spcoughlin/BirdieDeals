import { useState, useEffect, useMemo } from 'react';
import Layout from '../components/Layout/Layout';
import DealCard from '../components/Deals/DealCard';
import DealCardSkeleton from '../components/Deals/DealCardSkeleton';
import DealFilters from '../components/Deals/DealFilters';
import EmptyState from '../components/Deals/EmptyState';
import { apiClient } from '../api/client';
import './FeaturedDeals.css';

const INITIAL_FILTERS = {
  category: '',
  brand: '',
  minPrice: '',
  maxPrice: '',
  sort: 'discount'
};

export default function FeaturedDeals() {
  const [deals, setDeals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filters, setFilters] = useState(INITIAL_FILTERS);

  useEffect(() => {
    async function fetchDeals() {
      try {
        setLoading(true);
        setError(null);
        const response = await apiClient.getFeaturedDeals();
        setDeals(response.deals || []);
      } catch (err) {
        setError(err.message || 'Failed to load deals');
      } finally {
        setLoading(false);
      }
    }

    fetchDeals();
  }, []);

  const filteredDeals = useMemo(() => {
    let result = [...deals];

    // Category filter
    if (filters.category) {
      result = result.filter(d => d.category === filters.category);
    }

    // Brand filter (case-insensitive search)
    if (filters.brand) {
      const brandLower = filters.brand.toLowerCase();
      result = result.filter(d => 
        d.brand.toLowerCase().includes(brandLower)
      );
    }

    // Price range filter
    if (filters.minPrice) {
      result = result.filter(d => d.price >= Number(filters.minPrice));
    }
    if (filters.maxPrice) {
      result = result.filter(d => d.price <= Number(filters.maxPrice));
    }

    // Sorting
    switch (filters.sort) {
      case 'discount':
        result.sort((a, b) => {
          const discA = a.originalPrice ? (a.originalPrice - a.price) / a.originalPrice : 0;
          const discB = b.originalPrice ? (b.originalPrice - b.price) / b.originalPrice : 0;
          return discB - discA;
        });
        break;
      case 'price-low':
        result.sort((a, b) => a.price - b.price);
        break;
      case 'price-high':
        result.sort((a, b) => b.price - a.price);
        break;
      case 'newest':
        result.sort((a, b) => {
          const dateA = a.expiresAt ? new Date(a.expiresAt) : new Date(0);
          const dateB = b.expiresAt ? new Date(b.expiresAt) : new Date(0);
          return dateB - dateA;
        });
        break;
      default:
        break;
    }

    return result;
  }, [deals, filters]);

  return (
    <Layout>
      <div className="page">
        <div className="container">
          <div className="page-header">
            <h1 className="page-title">Featured Deals</h1>
            <p className="page-subtitle">
              Top golf equipment deals from trusted retailers
            </p>
          </div>

          <DealFilters filters={filters} onFilterChange={setFilters} />

          {loading ? (
            <div className="deals-grid grid grid-3">
              {Array.from({ length: 6 }, (_, i) => (
                <DealCardSkeleton key={i} />
              ))}
            </div>
          ) : error ? (
            <EmptyState 
              icon="⚠️"
              title="Couldn't load deals"
              message={error}
              actionLabel="Try Again"
              onActionClick={() => window.location.reload()}
            />
          ) : filteredDeals.length === 0 ? (
            <EmptyState 
              icon="🔍"
              title="No deals match your filters"
              message="Try adjusting your search criteria to find more deals."
              actionLabel="Clear Filters"
              onActionClick={() => setFilters(INITIAL_FILTERS)}
            />
          ) : (
            <>
              <p className="results-count">
                Showing {filteredDeals.length} deal{filteredDeals.length !== 1 ? 's' : ''}
              </p>
              <div className="deals-grid grid grid-3">
                {filteredDeals.map(deal => (
                  <DealCard key={deal.id} deal={deal} />
                ))}
              </div>
            </>
          )}
        </div>
      </div>
    </Layout>
  );
}
