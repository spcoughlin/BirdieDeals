import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import Layout from '../components/Layout/Layout';
import ProgressIndicator from '../components/Profile/ProgressIndicator';
import ClubCard from '../components/Profile/ClubCard';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import './Register.css';

const STORAGE_KEY = 'bagfit_registration_draft';

const AGE_RANGES = ['Under 18', '18-24', '25-34', '35-44', '45-54', '55-64', '65+'];
const HANDICAP_RANGES = ['Scratch or better', '1-5', '6-10', '11-15', '16-20', '21-25', '26-30', '30+', 'No handicap'];
const BUDGET_PREFERENCES = [
  { value: 'value', label: 'Value-first' },
  { value: 'balanced', label: 'Balanced' },
  { value: 'premium', label: 'Premium' }
];

const POPULAR_BRANDS = [
  'TaylorMade', 'Callaway', 'Titleist', 'Ping', 'Cobra', 
  'Mizuno', 'Srixon', 'Cleveland', 'Bridgestone', 'Wilson'
];

const INITIAL_ACCOUNT = {
  username: '',
  email: '',
  password: '',
  confirmPassword: ''
};

const INITIAL_PROFILE = {
  ageRange: '',
  height: '',
  dominantHand: 'RH',
  handicap: '',
  yearsPlaying: '',
  driverCarry: '',
  sevenIronCarry: '',
  roundsPerMonth: '',
  rangeSessions: '',
  monthsPlayedPerYear: '',
  region: '',
  budgetPreference: 'balanced',
  willingToBuyUsed: 'yes',
  preferredBrands: [],
  brandsToAvoid: []
};

const EMPTY_CLUB = {
  type: '',
  brand: '',
  model: '',
  modelYear: '',
  purchaseYear: '',
  loft: '',
  shaftFlex: '',
  shaftMaterial: '',
  gripSize: '',
  carryDistance: '',
  wedgeRole: '',
  bounce: '',
  grind: ''
};

export default function Register() {
  const navigate = useNavigate();
  const { register } = useAuth();
  const toast = useToast();

  const [step, setStep] = useState(0);
  const [account, setAccount] = useState(INITIAL_ACCOUNT);
  const [profile, setProfile] = useState(INITIAL_PROFILE);
  const [clubs, setClubs] = useState([{ ...EMPTY_CLUB }]);
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [showPreview, setShowPreview] = useState(false);

  // Load draft from localStorage
  useEffect(() => {
    const draft = localStorage.getItem(STORAGE_KEY);
    if (draft) {
      try {
        const parsed = JSON.parse(draft);
        if (parsed.account) setAccount(parsed.account);
        if (parsed.profile) setProfile(parsed.profile);
        if (parsed.clubs?.length) setClubs(parsed.clubs);
        if (typeof parsed.step === 'number') setStep(parsed.step);
      } catch (e) {
        console.error('Failed to parse draft', e);
      }
    }
  }, []);

  // Save draft to localStorage
  useEffect(() => {
    const draft = { account: { ...account, password: '', confirmPassword: '' }, profile, clubs, step };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(draft));
  }, [account, profile, clubs, step]);

  const clearDraft = () => {
    localStorage.removeItem(STORAGE_KEY);
  };

  const validateStep0 = () => {
    const newErrors = {};

    if (!account.username.trim()) {
      newErrors.username = 'Username is required';
    } else if (account.username.length < 3) {
      newErrors.username = 'Username must be at least 3 characters';
    }

    if (!account.email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(account.email)) {
      newErrors.email = 'Please enter a valid email';
    }

    if (!account.password) {
      newErrors.password = 'Password is required';
    } else if (account.password.length < 8) {
      newErrors.password = 'Password must be at least 8 characters';
    }

    if (account.password !== account.confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const validateStep1 = () => {
    const newErrors = {};

    if (!profile.ageRange) {
      newErrors.ageRange = 'Please select your age range';
    }

    if (!profile.handicap) {
      newErrors.handicap = 'Please select your handicap range';
    }

    // Check if at least one club has required fields
    const validClubs = clubs.filter(c => c.type && c.brand && c.model);
    if (validClubs.length === 0) {
      newErrors.clubs = 'Please add at least one club to your bag';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleAccountChange = (e) => {
    const { name, value } = e.target;
    setAccount(prev => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const handleProfileChange = (field, value) => {
    setProfile(prev => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  const handleBrandToggle = (field, brand) => {
    setProfile(prev => {
      const current = prev[field];
      if (current.includes(brand)) {
        return { ...prev, [field]: current.filter(b => b !== brand) };
      } else {
        return { ...prev, [field]: [...current, brand] };
      }
    });
  };

  const handleClubChange = (index, club) => {
    setClubs(prev => {
      const newClubs = [...prev];
      newClubs[index] = club;
      return newClubs;
    });
    if (errors.clubs) {
      setErrors(prev => ({ ...prev, clubs: '' }));
    }
  };

  const addClub = () => {
    setClubs(prev => [...prev, { ...EMPTY_CLUB }]);
  };

  const removeClub = (index) => {
    if (clubs.length > 1) {
      setClubs(prev => prev.filter((_, i) => i !== index));
    }
  };

  const handleNext = () => {
    if (step === 0 && validateStep0()) {
      setStep(1);
    } else if (step === 1 && validateStep1()) {
      setShowPreview(true);
    }
  };

  const handleBack = () => {
    if (showPreview) {
      setShowPreview(false);
    } else if (step > 0) {
      setStep(step - 1);
    }
  };

  const handleSubmit = async () => {
    console.log('[FORM] handleSubmit called');
    try {
      setLoading(true);
      
      const validClubs = clubs.filter(c => c.type && c.brand && c.model);
      console.log('[FORM] Valid clubs:', validClubs.length, validClubs);
      
      // Transform frontend club structure to backend format
      const transformedClubs = validClubs.map(club => ({
        name: club.type, // Backend uses 'name' instead of 'type'
        brand: club.brand,
        model: club.model,
        loft: club.loft ? parseFloat(club.loft) : null,
        carryYards: club.carryDistance ? parseInt(club.carryDistance, 10) : null, // Backend uses 'carryYards'
        usage: 'primary',
      }));
      console.log('[FORM] Transformed clubs:', transformedClubs);
      
      // Transform profile to use backend field names
      const backendProfile = {
        handicap: profile.handicap ? parseFloat(profile.handicap) : null,
        driverCarry: profile.driverCarry ? parseInt(profile.driverCarry, 10) : null,
        sevenIronCarry: profile.sevenIronCarry ? parseInt(profile.sevenIronCarry, 10) : null,
        roundsPerMonth: profile.roundsPerMonth ? parseInt(profile.roundsPerMonth, 10) : null,
        monthsPlayedPerYear: profile.monthsPlayedPerYear ? parseInt(profile.monthsPlayedPerYear, 10) : null,
        region: profile.region || null,
        // Map frontend budgetPreference to backend budgetSensitivity
        budgetSensitivity: profile.budgetPreference === 'value' ? 'Value-First' 
          : profile.budgetPreference === 'premium' ? 'Performance-First' 
          : 'Balanced',
        willingToBuyUsed: profile.willingToBuyUsed === 'yes',
        preferredBrands: profile.preferredBrands,
        clubs: transformedClubs,
        // Keep original fields for reference
        ageRange: profile.ageRange,
        dominantHand: profile.dominantHand,
        yearsPlaying: profile.yearsPlaying,
      };
      console.log('[FORM] Backend profile:', backendProfile);
      
      const registrationData = {
        username: account.username,
        email: account.email,
        password: account.password,
        profile: backendProfile,
      };
      console.log('[FORM] Calling register with:', registrationData);
      
      await register(registrationData);
      console.log('[FORM] Register succeeded');
      
      clearDraft();
      toast.success('Account created! Welcome to BirdieDeals.');
      navigate('/suggested');
    } catch (err) {
      console.error('[FORM] Registration error:', err);
      toast.error(err.message || 'Registration failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const validClubsCount = clubs.filter(c => c.type && c.brand && c.model).length;

  return (
    <Layout>
      <div className="page register-page">
        <div className="container">
          <div className="register-container">
            <ProgressIndicator 
              currentStep={showPreview ? 2 : step} 
              totalSteps={3}
              stepLabels={['Account', 'Golf Profile', 'Review']}
            />

            {showPreview ? (
              <div className="preview-section">
                <h2 className="section-title">Review Your Profile</h2>
                
                <div className="preview-card card">
                  <div className="card-body">
                    <h3>Account</h3>
                    <p><strong>Username:</strong> {account.username}</p>
                    <p><strong>Email:</strong> {account.email}</p>
                  </div>
                </div>

                <div className="preview-card card">
                  <div className="card-body">
                    <h3>Golfer Profile</h3>
                    <div className="preview-grid">
                      <p><strong>Age:</strong> {profile.ageRange}</p>
                      <p><strong>Handicap:</strong> {profile.handicap}</p>
                      <p><strong>Hand:</strong> {profile.dominantHand}</p>
                      <p><strong>Years Playing:</strong> {profile.yearsPlaying || 'Not specified'}</p>
                      <p><strong>Rounds/Month:</strong> {profile.roundsPerMonth || 'Not specified'}</p>
                      <p><strong>Budget:</strong> {profile.budgetPreference}</p>
                    </div>
                    {profile.preferredBrands.length > 0 && (
                      <p className="mt-md"><strong>Preferred Brands:</strong> {profile.preferredBrands.join(', ')}</p>
                    )}
                  </div>
                </div>

                <div className="preview-card card">
                  <div className="card-body">
                    <h3>Your Bag ({validClubsCount} clubs)</h3>
                    <ul className="clubs-preview-list">
                      {clubs.filter(c => c.type && c.brand && c.model).map((club, i) => (
                        <li key={i}>
                          <strong>{club.type}:</strong> {club.brand} {club.model}
                          {club.modelYear && ` (${club.modelYear})`}
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>

                <div className="form-actions">
                  <button 
                    type="button" 
                    className="btn btn-secondary"
                    onClick={handleBack}
                  >
                    ← Edit Profile
                  </button>
                  <button 
                    type="button" 
                    className="btn btn-primary"
                    onClick={handleSubmit}
                    disabled={loading}
                  >
                    {loading ? 'Creating Account...' : 'Create Account'}
                  </button>
                </div>
              </div>
            ) : step === 0 ? (
              <div className="step-section">
                <h2 className="section-title">Create Your Account</h2>

                <div className="card">
                  <div className="card-body">
                    <div className="form-group">
                      <label htmlFor="username" className="form-label">Username *</label>
                      <input
                        type="text"
                        id="username"
                        name="username"
                        className={`form-input ${errors.username ? 'error' : ''}`}
                        value={account.username}
                        onChange={handleAccountChange}
                        placeholder="golfer123"
                        autoComplete="username"
                      />
                      {errors.username && <p className="form-error">{errors.username}</p>}
                    </div>

                    <div className="form-group">
                      <label htmlFor="email" className="form-label">Email *</label>
                      <input
                        type="email"
                        id="email"
                        name="email"
                        className={`form-input ${errors.email ? 'error' : ''}`}
                        value={account.email}
                        onChange={handleAccountChange}
                        placeholder="you@example.com"
                        autoComplete="email"
                      />
                      {errors.email && <p className="form-error">{errors.email}</p>}
                    </div>

                    <div className="form-row">
                      <div className="form-group">
                        <label htmlFor="password" className="form-label">Password *</label>
                        <input
                          type="password"
                          id="password"
                          name="password"
                          className={`form-input ${errors.password ? 'error' : ''}`}
                          value={account.password}
                          onChange={handleAccountChange}
                          placeholder="Min. 8 characters"
                          autoComplete="new-password"
                        />
                        {errors.password && <p className="form-error">{errors.password}</p>}
                      </div>

                      <div className="form-group">
                        <label htmlFor="confirmPassword" className="form-label">Confirm Password *</label>
                        <input
                          type="password"
                          id="confirmPassword"
                          name="confirmPassword"
                          className={`form-input ${errors.confirmPassword ? 'error' : ''}`}
                          value={account.confirmPassword}
                          onChange={handleAccountChange}
                          placeholder="••••••••"
                          autoComplete="new-password"
                        />
                        {errors.confirmPassword && <p className="form-error">{errors.confirmPassword}</p>}
                      </div>
                    </div>
                  </div>
                </div>

                <div className="form-actions">
                  <Link to="/login" className="btn btn-ghost">
                    Already have an account?
                  </Link>
                  <button 
                    type="button" 
                    className="btn btn-primary"
                    onClick={handleNext}
                  >
                    Continue →
                  </button>
                </div>
              </div>
            ) : (
              <div className="step-section">
                <h2 className="section-title">Tell Us About Your Game</h2>

                {/* Golfer Profile */}
                <details className="profile-section" open>
                  <summary className="section-summary">Golfer Profile</summary>
                  <div className="card">
                    <div className="card-body">
                      <div className="form-row">
                        <div className="form-group">
                          <label className="form-label">Age Range *</label>
                          <select
                            className={`form-select ${errors.ageRange ? 'error' : ''}`}
                            value={profile.ageRange}
                            onChange={(e) => handleProfileChange('ageRange', e.target.value)}
                          >
                            <option value="">Select</option>
                            {AGE_RANGES.map(a => (
                              <option key={a} value={a}>{a}</option>
                            ))}
                          </select>
                          {errors.ageRange && <p className="form-error">{errors.ageRange}</p>}
                        </div>

                        <div className="form-group">
                          <label className="form-label">Dominant Hand *</label>
                          <div className="radio-group">
                            <label className="radio-label">
                              <input 
                                type="radio" 
                                name="dominantHand"
                                value="RH"
                                checked={profile.dominantHand === 'RH'}
                                onChange={(e) => handleProfileChange('dominantHand', e.target.value)}
                              />
                              Right-Handed
                            </label>
                            <label className="radio-label">
                              <input 
                                type="radio" 
                                name="dominantHand"
                                value="LH"
                                checked={profile.dominantHand === 'LH'}
                                onChange={(e) => handleProfileChange('dominantHand', e.target.value)}
                              />
                              Left-Handed
                            </label>
                          </div>
                        </div>
                      </div>

                      <div className="form-row">
                        <div className="form-group">
                          <label className="form-label">Handicap *</label>
                          <select
                            className={`form-select ${errors.handicap ? 'error' : ''}`}
                            value={profile.handicap}
                            onChange={(e) => handleProfileChange('handicap', e.target.value)}
                          >
                            <option value="">Select</option>
                            {HANDICAP_RANGES.map(h => (
                              <option key={h} value={h}>{h}</option>
                            ))}
                          </select>
                          {errors.handicap && <p className="form-error">{errors.handicap}</p>}
                        </div>

                        <div className="form-group">
                          <label className="form-label">Years Playing</label>
                          <input
                            type="number"
                            className="form-input"
                            value={profile.yearsPlaying}
                            onChange={(e) => handleProfileChange('yearsPlaying', e.target.value)}
                            placeholder="e.g., 5"
                            min="0"
                            max="80"
                          />
                        </div>
                      </div>

                      <div className="form-row">
                        <div className="form-group">
                          <label className="form-label">Typical Driver Carry (yards)</label>
                          <input
                            type="number"
                            className="form-input"
                            value={profile.driverCarry}
                            onChange={(e) => handleProfileChange('driverCarry', e.target.value)}
                            placeholder="e.g., 240"
                            min="100"
                            max="400"
                          />
                        </div>

                        <div className="form-group">
                          <label className="form-label">Typical 7-Iron Carry (yards)</label>
                          <input
                            type="number"
                            className="form-input"
                            value={profile.sevenIronCarry}
                            onChange={(e) => handleProfileChange('sevenIronCarry', e.target.value)}
                            placeholder="e.g., 150"
                            min="80"
                            max="250"
                          />
                        </div>
                      </div>

                      <div className="form-row">
                        <div className="form-group">
                          <label className="form-label">Rounds Per Month</label>
                          <input
                            type="number"
                            className="form-input"
                            value={profile.roundsPerMonth}
                            onChange={(e) => handleProfileChange('roundsPerMonth', e.target.value)}
                            placeholder="e.g., 4"
                            min="0"
                            max="31"
                          />
                        </div>

                        <div className="form-group">
                          <label className="form-label">Range Sessions Per Week</label>
                          <input
                            type="number"
                            className="form-input"
                            value={profile.rangeSessions}
                            onChange={(e) => handleProfileChange('rangeSessions', e.target.value)}
                            placeholder="e.g., 2"
                            min="0"
                            max="14"
                          />
                        </div>
                      </div>

                      <div className="form-group">
                        <label className="form-label">Region/Zip (optional)</label>
                        <input
                          type="text"
                          className="form-input"
                          value={profile.region}
                          onChange={(e) => handleProfileChange('region', e.target.value)}
                          placeholder="e.g., 90210 or California"
                        />
                        <p className="form-hint">Helps us find local deals</p>
                      </div>
                    </div>
                  </div>
                </details>

                {/* Preferences */}
                <details className="profile-section">
                  <summary className="section-summary">Preferences</summary>
                  <div className="card">
                    <div className="card-body">
                      <div className="form-group">
                        <label className="form-label">Budget Preference</label>
                        <div className="budget-options">
                          {BUDGET_PREFERENCES.map(bp => (
                            <label 
                              key={bp.value}
                              className={`budget-option ${profile.budgetPreference === bp.value ? 'selected' : ''}`}
                            >
                              <input
                                type="radio"
                                name="budgetPreference"
                                value={bp.value}
                                checked={profile.budgetPreference === bp.value}
                                onChange={(e) => handleProfileChange('budgetPreference', e.target.value)}
                              />
                              {bp.label}
                            </label>
                          ))}
                        </div>
                      </div>

                      <div className="form-group">
                        <label className="form-label">Willing to Buy Used?</label>
                        <div className="radio-group">
                          <label className="radio-label">
                            <input 
                              type="radio" 
                              name="willingToBuyUsed"
                              value="yes"
                              checked={profile.willingToBuyUsed === 'yes'}
                              onChange={(e) => handleProfileChange('willingToBuyUsed', e.target.value)}
                            />
                            Yes
                          </label>
                          <label className="radio-label">
                            <input 
                              type="radio" 
                              name="willingToBuyUsed"
                              value="no"
                              checked={profile.willingToBuyUsed === 'no'}
                              onChange={(e) => handleProfileChange('willingToBuyUsed', e.target.value)}
                            />
                            No
                          </label>
                        </div>
                      </div>

                      <div className="form-group">
                        <label className="form-label">Preferred Brands (select any)</label>
                        <div className="brand-chips">
                          {POPULAR_BRANDS.map(brand => (
                            <button
                              key={brand}
                              type="button"
                              className={`brand-chip ${profile.preferredBrands.includes(brand) ? 'selected' : ''}`}
                              onClick={() => handleBrandToggle('preferredBrands', brand)}
                            >
                              {brand}
                            </button>
                          ))}
                        </div>
                      </div>

                      <div className="form-group">
                        <label className="form-label">Brands to Avoid (select any)</label>
                        <div className="brand-chips">
                          {POPULAR_BRANDS.map(brand => (
                            <button
                              key={brand}
                              type="button"
                              className={`brand-chip avoid ${profile.brandsToAvoid.includes(brand) ? 'selected' : ''}`}
                              onClick={() => handleBrandToggle('brandsToAvoid', brand)}
                            >
                              {brand}
                            </button>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                </details>

                {/* Bag Inventory */}
                <details className="profile-section" open>
                  <summary className="section-summary">
                    Your Bag 
                    <span className="club-count">({validClubsCount} club{validClubsCount !== 1 ? 's' : ''})</span>
                  </summary>
                  <div className="clubs-section">
                    {errors.clubs && (
                      <p className="form-error clubs-error">{errors.clubs}</p>
                    )}
                    
                    {clubs.map((club, index) => (
                      <ClubCard
                        key={index}
                        club={club}
                        index={index}
                        onChange={handleClubChange}
                        onRemove={removeClub}
                      />
                    ))}

                    <button 
                      type="button"
                      className="btn btn-secondary add-club-btn"
                      onClick={addClub}
                    >
                      + Add Another Club
                    </button>
                  </div>
                </details>

                <div className="form-actions">
                  <button 
                    type="button" 
                    className="btn btn-ghost"
                    onClick={handleBack}
                  >
                    ← Back
                  </button>
                  <button 
                    type="button" 
                    className="btn btn-primary"
                    onClick={handleNext}
                  >
                    Review Profile →
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </Layout>
  );
}
