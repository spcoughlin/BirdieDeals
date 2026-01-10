const API_BASE = 'http://localhost:8000/api';

// Dummy data for when backend is unavailable
const DUMMY_DEALS = [
  {
    id: '1',
    title: 'TaylorMade Stealth 2 Driver',
    brand: 'TaylorMade',
    category: 'driver',
    price: 449.99,
    originalPrice: 599.99,
    retailer: 'Golf Galaxy',
    url: 'https://example.com/stealth2',
    imageUrl: 'https://images.unsplash.com/photo-1535131749006-b7f58c99034b?w=400&h=300&fit=crop',
    tags: ['Hot Deal', 'Free Shipping'],
    expiresAt: '2025-02-15T00:00:00Z'
  },
  {
    id: '2',
    title: 'Callaway Paradym Ai Smoke Irons (4-PW)',
    brand: 'Callaway',
    category: 'irons',
    price: 899.99,
    originalPrice: 1299.99,
    retailer: 'PGA Superstore',
    url: 'https://example.com/paradym-irons',
    imageUrl: 'https://images.unsplash.com/photo-1593111774240-d529f12cf4bb?w=400&h=300&fit=crop',
    tags: ['Best Seller', '31% Off'],
    expiresAt: '2025-02-10T00:00:00Z'
  },
  {
    id: '3',
    title: 'Titleist Pro V1 Golf Balls (Dozen)',
    brand: 'Titleist',
    category: 'balls',
    price: 44.99,
    originalPrice: 54.99,
    retailer: 'Amazon',
    url: 'https://example.com/prov1',
    imageUrl: 'https://images.unsplash.com/photo-1587174486073-ae5e5cff23aa?w=400&h=300&fit=crop',
    tags: ['Tour Quality'],
    expiresAt: '2025-01-30T00:00:00Z'
  },
  {
    id: '4',
    title: 'FootJoy Pro/SL Golf Shoes',
    brand: 'FootJoy',
    category: 'shoes',
    price: 139.99,
    originalPrice: 179.99,
    retailer: 'Dick\'s Sporting Goods',
    url: 'https://example.com/prosl',
    imageUrl: 'https://images.unsplash.com/photo-1551107696-a4b0c5a0d9a2?w=400&h=300&fit=crop',
    tags: ['Waterproof', 'All Day Comfort'],
    expiresAt: '2025-02-20T00:00:00Z'
  },
  {
    id: '5',
    title: 'Cleveland RTX 6 Zipcore Wedge',
    brand: 'Cleveland',
    category: 'wedges',
    price: 129.99,
    originalPrice: 169.99,
    retailer: 'Golf Galaxy',
    url: 'https://example.com/rtx6',
    imageUrl: 'https://images.unsplash.com/photo-1622398925373-3f91b1e275f5?w=400&h=300&fit=crop',
    tags: ['Tour Spin', 'Multiple Grinds'],
    expiresAt: '2025-02-05T00:00:00Z'
  },
  {
    id: '6',
    title: 'Ping G430 Max Fairway Wood',
    brand: 'Ping',
    category: 'fairway',
    price: 279.99,
    originalPrice: 349.99,
    retailer: 'Worldwide Golf Shops',
    url: 'https://example.com/g430fw',
    imageUrl: 'https://images.unsplash.com/photo-1535131749006-b7f58c99034b?w=400&h=300&fit=crop',
    tags: ['Forgiving', 'High Launch'],
    expiresAt: '2025-02-18T00:00:00Z'
  },
  {
    id: '7',
    title: 'Under Armour Performance Polo',
    brand: 'Under Armour',
    category: 'apparel',
    price: 49.99,
    originalPrice: 75.00,
    retailer: 'Under Armour',
    url: 'https://example.com/ua-polo',
    imageUrl: 'https://images.unsplash.com/photo-1562157873-818bc0726f68?w=400&h=300&fit=crop',
    tags: ['Moisture Wicking', 'UPF 40'],
    expiresAt: '2025-01-25T00:00:00Z'
  },
  {
    id: '8',
    title: 'Scotty Cameron Special Select Newport 2',
    brand: 'Titleist',
    category: 'putter',
    price: 379.99,
    originalPrice: 449.99,
    retailer: 'PGA Superstore',
    url: 'https://example.com/newport2',
    imageUrl: 'https://images.unsplash.com/photo-1593111774240-d529f12cf4bb?w=400&h=300&fit=crop',
    tags: ['Tour Preferred', 'Premium'],
    expiresAt: '2025-02-12T00:00:00Z'
  }
];

const DUMMY_USER = {
  id: 'user-1',
  username: 'golfer123',
  email: 'golfer@example.com',
  profile: {
    handicap: 12,
    driverCarry: 245,
    sevenIronCarry: 155,
    roundsPerMonth: 4,
    monthsPlayedPerYear: 8,
    budgetSensitivity: 'Balanced',
    willingToBuyUsed: true,
    preferredBrands: ['TaylorMade', 'Callaway', 'Titleist'],
    clubs: []
  }
};

class ApiClient {
  constructor() {
    this.baseUrl = API_BASE;
    this.useDummyData = true; // Will fallback to dummy data on errors
  }

  getToken() {
    return localStorage.getItem('bagfit_token');
  }

  setToken(token) {
    if (token) {
      localStorage.setItem('bagfit_token', token);
    } else {
      localStorage.removeItem('bagfit_token');
    }
  }

  async request(endpoint, options = {}) {
    const url = `${this.baseUrl}${endpoint}`;
    const token = this.getToken();

    const headers = {
      'Content-Type': 'application/json',
      ...options.headers,
    };

    if (token && options.auth !== false) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    console.log(`[API] ${options.method || 'GET'} ${url}`, { hasToken: !!token });
    if (options.body) {
      console.log(`[API] Request body:`, JSON.parse(options.body));
    }

    try {
      const response = await fetch(url, {
        ...options,
        headers,
      });

      console.log(`[API] Response status: ${response.status}`);

      if (response.status === 401) {
        this.setToken(null);
        throw new Error('Unauthorized');
      }

      const data = await response.json();
      console.log(`[API] Response data:`, data);

      if (!response.ok) {
        throw new Error(data.message || `Request failed with status ${response.status}`);
      }

      return data;
    } catch (error) {
      console.error(`[API] Request failed:`, error.message);
      // If network error or backend unavailable, we'll handle with dummy data
      if (this.useDummyData) {
        console.warn('[API] Using dummy data fallback');
      }
      throw error;
    }
  }

  // Auth endpoints
  async register(data) {
    console.log('[REGISTER] Starting registration with:', { username: data.username, email: data.email });
    try {
      const result = await this.request('/auth/register', {
        method: 'POST',
        body: JSON.stringify(data),
        auth: false,
      });
      console.log('[REGISTER] Success:', result);
      return result;
    } catch (error) {
      console.error('[REGISTER] Failed:', error.message);
      // Return dummy success for demo
      if (this.useDummyData) {
        console.warn('[REGISTER] Using dummy user fallback');
        const token = 'demo-token-' + Date.now();
        return {
          token,
          user: {
            ...DUMMY_USER,
            username: data.username,
            email: data.email,
            profile: data.profile || {}
          }
        };
      }
      throw error;
    }
  }

  async login(email, password) {
    console.log('[LOGIN] Attempting login for:', email);
    try {
      const result = await this.request('/auth/login', {
        method: 'POST',
        body: JSON.stringify({ email, password }),
        auth: false,
      });
      console.log('[LOGIN] Success:', result);
      return result;
    } catch (error) {
      console.error('[LOGIN] Failed:', error.message);
      // Return dummy success for demo
      if (this.useDummyData) {
        console.warn('[LOGIN] Using dummy user fallback');
        const token = 'demo-token-' + Date.now();
        return {
          token,
          user: { ...DUMMY_USER, email }
        };
      }
      throw error;
    }
  }

  async getMe() {
    try {
      return await this.request('/me');
    } catch (error) {
      if (this.useDummyData && this.getToken()) {
        return { user: DUMMY_USER };
      }
      throw error;
    }
  }

  async updateProfile(profile) {
    try {
      return await this.request('/profile', {
        method: 'POST',
        body: JSON.stringify({ profile }),
      });
    } catch (error) {
      if (this.useDummyData) {
        return { user: { ...DUMMY_USER, profile: { ...DUMMY_USER.profile, ...profile } } };
      }
      throw error;
    }
  }

  // Deals endpoints
  async getFeaturedDeals() {
    try {
      return await this.request('/deals/featured', { auth: false });
    } catch (error) {
      if (this.useDummyData) {
        return { deals: DUMMY_DEALS };
      }
      throw error;
    }
  }

  async getSuggestedDeals() {
    try {
      const response = await this.request('/deals/suggested');
      // Normalize backend response to frontend format
      const deals = (response.deals || []).map(deal => ({
        ...deal,
        // Map matchReason to fitReason for DealCard component
        fitReason: deal.matchReason || deal.fitReason,
      }));
      
      // Build profileSummary in expected format
      const profileSummary = response.profileSummary || {};
      const gappingAnalysis = response.gappingAnalysis;
      
      // Convert gappingAnalysis to topGaps array for ProfileSummaryCard
      const topGaps = [];
      if (gappingAnalysis?.hasGap && gappingAnalysis?.gapType) {
        topGaps.push(gappingAnalysis.gapType.replace('-', ' '));
      }
      // Add category recommendations based on risk scores
      if (response.riskScores?.wedgeWearRisk === 'high') {
        topGaps.push('wedges');
      }
      
      return {
        deals,
        reasoning: response.reasoning || '',
        profileSummary: {
          handicap: profileSummary.handicap,
          roundsPerMonth: profileSummary.roundsPerMonth,
          // Map budgetSensitivity to budgetPreference for display
          budgetPreference: profileSummary.budgetSensitivity || profileSummary.budgetPreference,
          topGaps,
          driverCarry: profileSummary.driverCarry,
          clubCount: profileSummary.clubCount,
        },
        gappingAnalysis,
        riskScores: response.riskScores,
      };
    } catch (error) {
      if (this.useDummyData && this.getToken()) {
        // Return personalized dummy data with reasoning
        const personalizedDeals = DUMMY_DEALS.slice(0, 5).map(deal => ({
          ...deal,
          fitReason: getRandomFitReason(deal)
        }));
        return {
          deals: personalizedDeals,
          reasoning: 'Based on your mid-handicap profile and preference for balanced value, we focused on game-improvement equipment from your preferred brands.',
          profileSummary: {
            handicap: 12,
            roundsPerMonth: 4,
            budgetPreference: 'balanced',
            topGaps: ['wedges', 'driver']
          }
        };
      }
      throw error;
    }
  }

  // Deal tracking endpoints
  async trackDealView(dealId) {
    try {
      return await this.request('/deals/view', {
        method: 'POST',
        body: JSON.stringify({ dealId }),
      });
    } catch (error) {
      // Non-critical, just log
      console.warn('Failed to track deal view:', error.message);
      return { ok: true };
    }
  }

  async trackDealClick(dealId) {
    try {
      return await this.request('/deals/click', {
        method: 'POST',
        body: JSON.stringify({ dealId }),
      });
    } catch (error) {
      // Non-critical, just log
      console.warn('Failed to track deal click:', error.message);
      return { ok: true };
    }
  }
}

function getRandomFitReason(deal) {
  const reasons = [
    `Great match for your ${deal.category} upgrade needs`,
    `${deal.brand} is one of your preferred brands`,
    `Excellent value at ${Math.round((1 - deal.price / deal.originalPrice) * 100)}% off`,
    `Popular choice for mid-handicap golfers`,
    `Recommended based on your playing style`
  ];
  return reasons[Math.floor(Math.random() * reasons.length)];
}

export const apiClient = new ApiClient();
export default apiClient;
