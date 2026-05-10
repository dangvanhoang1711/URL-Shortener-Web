import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function SignupForm() {
  const navigate = useNavigate();
  const { register } = useAuth();
  const [formData, setFormData] = useState({ email: '', password: '', confirmPassword: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!formData.email || !formData.password || !formData.confirmPassword) {
      setError('Please fill in all fields');
      return;
    }

    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    if (formData.password.length < 6) {
      setError('Password must be at least 6 characters');
      return;
    }

    setLoading(true);
    try {
      await register(formData.email, formData.password, formData.confirmPassword);
      navigate('/login');
    } catch (err) {
      setError(err.response?.data?.message || err.response?.data?.error || 'Registration failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="row justify-content-center w-100 m-0">
      <div className="col-md-5 col-lg-4">
        <div className="card border-0 shadow-lg rounded-4 p-4 p-sm-5">
          <div className="card-body">
            <div className="text-center mb-4">
              <h2 className="fw-black text-dark">Create Account</h2>
              <p className="text-muted small">Sign up to start shortening URLs</p>
            </div>

            {error && (
              <div className="alert alert-danger py-2 small" role="alert">
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit}>
              <div className="mb-3">
                <label className="form-label small fw-bold text-secondary">Email address</label>
                <input
                  type="email"
                  name="email"
                  className="form-control form-control-lg border-2 bg-light shadow-none"
                  placeholder="alex@example.com"
                  style={{ borderRadius: '10px', fontSize: '1rem' }}
                  value={formData.email}
                  onChange={handleChange}
                  required
                />
              </div>

              <div className="mb-3">
                <label className="form-label small fw-bold text-secondary">Password</label>
                <input
                  type="password"
                  name="password"
                  className="form-control form-control-lg border-2 bg-light shadow-none"
                  placeholder="Min 6 characters"
                  style={{ borderRadius: '10px', fontSize: '1rem' }}
                  value={formData.password}
                  onChange={handleChange}
                  required
                />
              </div>

              <div className="mb-4">
                <label className="form-label small fw-bold text-secondary">Confirm Password</label>
                <input
                  type="password"
                  name="confirmPassword"
                  className="form-control form-control-lg border-2 bg-light shadow-none"
                  placeholder="Re-enter password"
                  style={{ borderRadius: '10px', fontSize: '1rem' }}
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  required
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="btn btn-primary btn-lg w-100 fw-bold shadow-sm mb-3"
                style={{ borderRadius: '10px' }}
              >
                {loading ? (
                  <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                ) : null}
                {loading ? 'Creating account...' : 'Create Account'}
              </button>
            </form>

            <div className="text-center">
              <p className="small text-muted">
                Already have an account? <Link to="/login" className="text-primary fw-bold text-decoration-none">Log in</Link>
              </p>
              <Link to="/" className="text-decoration-none small text-secondary fw-semibold">
                ← Back to Homepage
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}