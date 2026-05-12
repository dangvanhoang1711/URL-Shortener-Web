import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function LoginForm() {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [formData, setFormData] = useState({ email: '', password: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [visible, setVisible] = useState(false);
  const [fieldFocused, setFieldFocused] = useState({});

  useEffect(() => {
    setVisible(true);
  }, []);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    setError('');
  };

  const handleFocus = (field) => setFieldFocused(prev => ({ ...prev, [field]: true }));
  const handleBlur = (field) => setFieldFocused(prev => ({ ...prev, [field]: false }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!formData.email || !formData.password) {
      setError('Please fill in all fields');
      return;
    }

    setLoading(true);
    try {
      await login(formData.email, formData.password);
      navigate('/dashboard');
    } catch (err) {
      setError(err.response?.data?.message || err.response?.data?.error || 'Login failed. Please check your credentials.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="row justify-content-center w-100 m-0">
      <div className="col-md-5 col-lg-4">
        <div
          className="card border-0 shadow-lg rounded-4 p-4 p-sm-5 form-card card-3d"
          style={{
            transform: visible ? 'translateY(0) scale(1)' : 'translateY(40px) scale(0.95)',
            opacity: visible ? 1 : 0,
            transition: 'transform 0.6s cubic-bezier(0.22, 1, 0.36, 1), opacity 0.6s ease',
          }}
        >
          <div className="card-body">
            <div className="text-center mb-4" style={{ animation: 'fadeInUp 0.6s 0.1s cubic-bezier(0.22, 1, 0.36, 1) both' }}>
              <h2 className="fw-black text-dark" style={{ animation: 'fadeInUp 0.5s 0.2s cubic-bezier(0.22, 1, 0.36, 1) both' }}>Welcome Back</h2>
              <p className="text-muted small">Enter your details to access your account</p>
            </div>

            {error && (
              <div className="alert alert-danger py-2 small animate-shake" role="alert">
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit}>
              <div className="mb-3" style={{ animation: 'fadeInUp 0.5s 0.25s cubic-bezier(0.22, 1, 0.36, 1) both' }}>
                <label className="form-label small fw-bold text-secondary">Email address</label>
                <div className="position-relative">
                  <input
                    type="email"
                    name="email"
                    className="form-control form-control-lg border-2 bg-light shadow-none input-animated"
                    placeholder="alex@example.com"
                    style={{ borderRadius: '12px', fontSize: '1rem', paddingLeft: '2.8rem' }}
                    value={formData.email}
                    onChange={handleChange}
                    onFocus={() => handleFocus('email')}
                    onBlur={() => handleBlur('email')}
                    required
                  />
                  <i
                    className="bi bi-envelope position-absolute text-muted"
                    style={{
                      left: '14px',
                      top: '50%',
                      transform: fieldFocused.email ? 'translateY(-50%) scale(1.2)' : 'translateY(-50%)',
                      transition: 'transform 0.3s cubic-bezier(0.22, 1, 0.36, 1), color 0.3s ease',
                      fontSize: '1.1rem',
                      color: fieldFocused.email ? '#0d6efd' : '#9ca3af',
                    }}
                  ></i>
                </div>
              </div>

              <div className="mb-2" style={{ animation: 'fadeInUp 0.5s 0.3s cubic-bezier(0.22, 1, 0.36, 1) both' }}>
                <label className="form-label small fw-bold text-secondary">Password</label>
                <div className="position-relative">
                  <input
                    type="password"
                    name="password"
                    className="form-control form-control-lg border-2 bg-light shadow-none input-animated"
                    placeholder="Enter your password"
                    style={{ borderRadius: '12px', fontSize: '1rem', paddingLeft: '2.8rem' }}
                    value={formData.password}
                    onChange={handleChange}
                    onFocus={() => handleFocus('password')}
                    onBlur={() => handleBlur('password')}
                    required
                  />
                  <i
                    className="bi bi-lock position-absolute text-muted"
                    style={{
                      left: '14px',
                      top: '50%',
                      transform: fieldFocused.password ? 'translateY(-50%) scale(1.2)' : 'translateY(-50%)',
                      transition: 'transform 0.3s cubic-bezier(0.22, 1, 0.36, 1), color 0.3s ease',
                      fontSize: '1.1rem',
                      color: fieldFocused.password ? '#0d6efd' : '#9ca3af',
                    }}
                  ></i>
                </div>
              </div>

              <div className="text-end mb-4" style={{ animation: 'fadeInUp 0.5s 0.35s cubic-bezier(0.22, 1, 0.36, 1) both' }}>
                <Link to="/forgot-password" className="text-primary small text-decoration-none fw-semibold">Forgot password?</Link>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="btn btn-primary btn-lg w-100 fw-bold shadow-sm mb-3 btn-animated animate-gradient-bg"
                style={{ borderRadius: '12px', letterSpacing: '0.5px' }}
              >
                {loading ? (
                  <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                ) : null}
                {loading ? 'Signing in...' : 'Sign in'}
              </button>
            </form>

            <div className="text-center" style={{ animation: 'fadeInUp 0.5s 0.4s cubic-bezier(0.22, 1, 0.36, 1) both' }}>
              <p className="small text-muted">
                Don't have an account? <Link to="/signup" className="text-primary fw-bold text-decoration-none">Sign up</Link>
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
