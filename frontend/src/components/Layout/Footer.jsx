import { Link } from 'react-router-dom';
import './Footer.css';

export default function Footer() {
  return (
    <footer className="footer">
      <div className="container footer-content">
        <div className="footer-brand">
          <span className="footer-logo">⛳ BirdieDeals</span>
          <p className="footer-tagline">Smarter deals for smarter golfers.</p>
        </div>
        
        <div className="footer-links">
          <Link to="/deals">Featured Deals</Link>
          <Link to="/suggested">Personalized Deals</Link>
          <Link to="/register">Create Account</Link>
        </div>

        <div className="footer-bottom">
          <p className="footer-copy">
            © {new Date().getFullYear()} BirdieDeals. All rights reserved.
          </p>
          <p className="footer-disclosure">
            BirdieDeals earns commission from qualifying purchases. Prices and availability subject to change.
          </p>
        </div>
      </div>
    </footer>
  );
}
