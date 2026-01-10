import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useState } from 'react';
import './Header.css';

export default function Header() {
  const { isAuthenticated, user, logout } = useAuth();
  const navigate = useNavigate();
  const [menuOpen, setMenuOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/');
    setMenuOpen(false);
  };

  return (
    <header className="header">
      <div className="container header-content">
        <Link to="/" className="header-logo">
          <span className="logo-icon">⛳</span>
          <span className="logo-text">BirdieDeals</span>
        </Link>

        <button 
          className="mobile-menu-btn"
          onClick={() => setMenuOpen(!menuOpen)}
          aria-label="Toggle menu"
        >
          <span className={`hamburger ${menuOpen ? 'open' : ''}`}></span>
        </button>

        <nav className={`header-nav ${menuOpen ? 'open' : ''}`}>
          <Link to="/" className="nav-link" onClick={() => setMenuOpen(false)}>
            Home
          </Link>
          <Link to="/deals" className="nav-link" onClick={() => setMenuOpen(false)}>
            Featured Deals
          </Link>
          <Link to="/suggested" className="nav-link" onClick={() => setMenuOpen(false)}>
            My Deals
          </Link>
        </nav>

        <div className={`header-actions ${menuOpen ? 'open' : ''}`}>
          {isAuthenticated ? (
            <>
              <span className="user-greeting">Hi, {user?.username || 'Golfer'}</span>
              <Link to="/account" className="btn btn-ghost btn-sm" onClick={() => setMenuOpen(false)}>
                Account
              </Link>
              <button onClick={handleLogout} className="btn btn-secondary btn-sm">
                Log Out
              </button>
            </>
          ) : (
            <>
              <Link to="/login" className="btn btn-ghost btn-sm" onClick={() => setMenuOpen(false)}>
                Log In
              </Link>
              <Link to="/register" className="btn btn-primary btn-sm" onClick={() => setMenuOpen(false)}>
                Create Account
              </Link>
            </>
          )}
        </div>
      </div>
    </header>
  );
}
