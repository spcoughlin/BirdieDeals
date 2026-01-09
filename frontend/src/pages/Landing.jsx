import { Link } from 'react-router-dom';
import Layout from '../components/Layout/Layout';
import './Landing.css';

export default function Landing() {
  return (
    <Layout>
      <div className="landing-page">
        {/* Hero Section */}
        <section className="hero">
          <div className="container hero-content">
            <div className="hero-badge">
              <span className="badge-icon">⛳</span>
              Smart Golf Shopping
            </div>
            <h1 className="hero-title">
              Track Your Bag.<br />
              <span className="highlight">Get Smarter Deals.</span>
            </h1>
            <p className="hero-subtitle">
              Tell us about your game and equipment. We'll find deals that actually make sense for your bag.
            </p>
            <div className="hero-ctas">
              <Link to="/deals" className="btn btn-primary btn-lg">
                Browse Featured Deals
              </Link>
              <Link to="/register" className="btn btn-secondary btn-lg">
                Create Free Account
              </Link>
            </div>
            <p className="hero-login">
              Already have an account? <Link to="/login">Log in</Link>
            </p>
          </div>
        </section>

        {/* How It Works */}
        <section className="how-it-works">
          <div className="container">
            <h2 className="section-title">How It Works</h2>
            <p className="section-subtitle">Three simple steps to smarter golf deals</p>
            
            <div className="steps-grid">
              <div className="step-card">
                <div className="step-number">1</div>
                <div className="step-icon">🎒</div>
                <h3 className="step-title">Build Your Bag Profile</h3>
                <p className="step-description">
                  Tell us about your clubs, your game, and your preferences. 
                  Takes just a few minutes.
                </p>
              </div>

              <div className="step-card">
                <div className="step-number">2</div>
                <div className="step-icon">🎯</div>
                <h3 className="step-title">Get Personalized Deals</h3>
                <p className="step-description">
                  We analyze your profile to find deals that match your needs, 
                  budget, and playing style.
                </p>
              </div>

              <div className="step-card">
                <div className="step-number">3</div>
                <div className="step-icon">💰</div>
                <h3 className="step-title">Save on What Matters</h3>
                <p className="step-description">
                  Shop with confidence knowing every deal is relevant to your game. 
                  No more wasted time.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Value Props */}
        <section className="value-props">
          <div className="container">
            <div className="value-grid">
              <div className="value-item">
                <span className="value-icon">🔒</span>
                <div>
                  <h4>Your Data, Your Control</h4>
                  <p>We only use your bag info to personalize recommendations. Never shared or sold.</p>
                </div>
              </div>

              <div className="value-item">
                <span className="value-icon">🏌️</span>
                <div>
                  <h4>Built by Golfers</h4>
                  <p>We understand the difference between a 52° and 56°, and why it matters for your game.</p>
                </div>
              </div>

              <div className="value-item">
                <span className="value-icon">💸</span>
                <div>
                  <h4>Real Savings</h4>
                  <p>We aggregate deals from top retailers so you always get the best price.</p>
                </div>
              </div>

              <div className="value-item">
                <span className="value-icon">⚡</span>
                <div>
                  <h4>Always Fresh</h4>
                  <p>Deals updated daily. Get notified when something perfect for you drops.</p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="cta-section">
          <div className="container cta-content">
            <h2 className="cta-title">Ready to find your next upgrade?</h2>
            <p className="cta-subtitle">
              Join thousands of golfers who save time and money with BagFit Deals.
            </p>
            <div className="cta-buttons">
              <Link to="/register" className="btn btn-accent btn-lg">
                Get Started Free →
              </Link>
              <Link to="/deals" className="btn btn-ghost btn-lg">
                Browse Deals First
              </Link>
            </div>
          </div>
        </section>
      </div>
    </Layout>
  );
}
