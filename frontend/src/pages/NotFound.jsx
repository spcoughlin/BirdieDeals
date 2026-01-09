import { Link } from 'react-router-dom';
import Layout from '../components/Layout/Layout';
import './NotFound.css';

export default function NotFound() {
  return (
    <Layout>
      <div className="page not-found-page">
        <div className="container">
          <div className="not-found-content">
            <span className="not-found-icon">⛳</span>
            <h1>Page Not Found</h1>
            <p>Looks like this ball landed in the rough. Let's get you back on the fairway.</p>
            <div className="not-found-actions">
              <Link to="/" className="btn btn-primary">
                Go Home
              </Link>
              <Link to="/deals" className="btn btn-secondary">
                Browse Deals
              </Link>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
}
