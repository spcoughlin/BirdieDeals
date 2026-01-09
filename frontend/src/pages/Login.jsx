import { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import Layout from '../components/Layout/Layout';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import './Auth.css';

export default function Login() {
  const navigate = useNavigate();
  const location = useLocation();
  const { login } = useAuth();
  const toast = useToast();

  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);

  const from = location.state?.from || '/suggested';

  const validateForm = () => {
    const newErrors = {};

    if (!formData.email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'Please enter a valid email';
    }

    if (!formData.password) {
      newErrors.password = 'Password is required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) return;

    try {
      setLoading(true);
      await login(formData.email, formData.password);
      toast.success('Welcome back!');
      navigate(from, { replace: true });
    } catch (err) {
      toast.error(err.message || 'Login failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Layout>
      <div className="page auth-page">
        <div className="container">
          <div className="auth-container">
            <div className="auth-card card">
              <div className="card-body">
                <div className="auth-header">
                  <h1 className="auth-title">Welcome Back</h1>
                  <p className="auth-subtitle">Log in to see your personalized deals</p>
                </div>

                <form onSubmit={handleSubmit} className="auth-form">
                  <div className="form-group">
                    <label htmlFor="email" className="form-label">Email</label>
                    <input
                      type="email"
                      id="email"
                      name="email"
                      className={`form-input ${errors.email ? 'error' : ''}`}
                      value={formData.email}
                      onChange={handleChange}
                      placeholder="you@example.com"
                      autoComplete="email"
                    />
                    {errors.email && <p className="form-error">{errors.email}</p>}
                  </div>

                  <div className="form-group">
                    <label htmlFor="password" className="form-label">Password</label>
                    <input
                      type="password"
                      id="password"
                      name="password"
                      className={`form-input ${errors.password ? 'error' : ''}`}
                      value={formData.password}
                      onChange={handleChange}
                      placeholder="••••••••"
                      autoComplete="current-password"
                    />
                    {errors.password && <p className="form-error">{errors.password}</p>}
                  </div>

                  <button 
                    type="submit" 
                    className="btn btn-primary btn-lg auth-submit"
                    disabled={loading}
                  >
                    {loading ? 'Logging in...' : 'Log In'}
                  </button>
                </form>

                <div className="auth-footer">
                  <p>
                    Don't have an account?{' '}
                    <Link to="/register">Create one free</Link>
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
}
