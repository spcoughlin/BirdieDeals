import { useState } from 'react';
import './DealFilters.css';

const CATEGORIES = [
  { value: '', label: 'All Categories' },
  { value: 'driver', label: 'Drivers' },
  { value: 'fairway', label: 'Fairway Woods' },
  { value: 'hybrid', label: 'Hybrids' },
  { value: 'irons', label: 'Irons' },
  { value: 'wedges', label: 'Wedges' },
  { value: 'putter', label: 'Putters' },
  { value: 'balls', label: 'Golf Balls' },
  { value: 'shoes', label: 'Shoes' },
  { value: 'apparel', label: 'Apparel' },
  { value: 'accessories', label: 'Accessories' },
];

const SORT_OPTIONS = [
  { value: 'discount', label: 'Best Discount' },
  { value: 'price-low', label: 'Price: Low to High' },
  { value: 'price-high', label: 'Price: High to Low' },
  { value: 'newest', label: 'Newest' },
];

export default function DealFilters({ filters, onFilterChange }) {
  const [showFilters, setShowFilters] = useState(false);

  const handleChange = (key, value) => {
    onFilterChange({ ...filters, [key]: value });
  };

  return (
    <div className="deal-filters">
      <button 
        className="filters-toggle btn btn-ghost"
        onClick={() => setShowFilters(!showFilters)}
      >
        <span>Filters</span>
        <span className={`toggle-icon ${showFilters ? 'open' : ''}`}>▼</span>
      </button>

      <div className={`filters-panel ${showFilters ? 'open' : ''}`}>
        <div className="filter-group">
          <label className="filter-label">Category</label>
          <select 
            className="form-select"
            value={filters.category}
            onChange={(e) => handleChange('category', e.target.value)}
          >
            {CATEGORIES.map(cat => (
              <option key={cat.value} value={cat.value}>{cat.label}</option>
            ))}
          </select>
        </div>

        <div className="filter-group">
          <label className="filter-label">Brand</label>
          <input 
            type="text"
            className="form-input"
            placeholder="Search brands..."
            value={filters.brand}
            onChange={(e) => handleChange('brand', e.target.value)}
          />
        </div>

        <div className="filter-group filter-group-inline">
          <div>
            <label className="filter-label">Min Price</label>
            <input 
              type="number"
              className="form-input"
              placeholder="$0"
              value={filters.minPrice}
              onChange={(e) => handleChange('minPrice', e.target.value)}
              min="0"
            />
          </div>
          <div>
            <label className="filter-label">Max Price</label>
            <input 
              type="number"
              className="form-input"
              placeholder="$1000+"
              value={filters.maxPrice}
              onChange={(e) => handleChange('maxPrice', e.target.value)}
              min="0"
            />
          </div>
        </div>

        <div className="filter-group">
          <label className="filter-label">Sort By</label>
          <select 
            className="form-select"
            value={filters.sort}
            onChange={(e) => handleChange('sort', e.target.value)}
          >
            {SORT_OPTIONS.map(opt => (
              <option key={opt.value} value={opt.value}>{opt.label}</option>
            ))}
          </select>
        </div>

        <button 
          className="btn btn-ghost btn-sm clear-filters"
          onClick={() => onFilterChange({
            category: '',
            brand: '',
            minPrice: '',
            maxPrice: '',
            sort: 'discount'
          })}
        >
          Clear Filters
        </button>
      </div>
    </div>
  );
}
