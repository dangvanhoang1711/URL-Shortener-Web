import { useState } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import api from '../services/api';

export default function ResetPassword() {
  const navigate = useNavigate();
  const location = useLocation();
  const email = location.state?.email || '';

  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [done, setDone] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (password.length < 8) { setError('Password must be at least 8 characters'); return; }
    if (password !== confirm) { setError('Passwords do not match'); return; }
    setLoading(true);
    setError('');
    try {
      await api.post('/reset-password', { email, newPassword: password });
      setDone(true);
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to reset password');
    } finally {
      setLoading(false);
    }
  };

  if (!email) {
    return (
      <div className="container py-5 text-center" style={{ maxWidth: '480px' }}>
        <div className="card border-0 shadow-sm rounded-4 p-5">
          <p className="text-muted">Invalid session. Please start again.</p>
          <Link to="/forgot-password" className="btn btn-primary rounded-pill">Go Back</Link>
        </div>
      </div>
    );
  }

  if (done) {
    return (
      <div className="container py-5" style={{ maxWidth: '480px' }}>
        <div className="card border-0 shadow-sm rounded-4 p-5 text-center" style={{ animation: 'fadeInUp 0.5s ease both' }}>
          <div className="d-inline-flex align-items-center justify-content-center rounded-circle mb-3 mx-auto" style={{ width: '64px', height: '64px', backgroundColor: '#d1fae5' }}>
            <i className="bi bi-check-lg text-success fs-3"></i>
          </div>
          <h4 className="fw-bold mb-2">Password Reset!</h4>
          <p className="text-muted small mb-4">Your password has been updated successfully.</p>
          <button onClick={() => navigate('/login')} className="btn btn-primary rounded-pill px-4 fw-bold">
            Sign In
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="container py-5" style={{ maxWidth: '480px' }}>
      <div className="text-center mb-4" style={{ animation: 'fadeInUp 0.5s ease both' }}>
        <h2 className="fw-black text-dark mb-2">Create New Password</h2>
        <p className="text-muted small">Enter your new password below.</p>
      </div>
      <div className="card border-0 shadow-sm rounded-4 p-4 p-sm-5" style={{ animation: 'fadeInUp 0.5s 0.1s ease both' }}>
        {error && <div className="alert alert-danger py-2 small animate-shake">{error}</div>}
        <form onSubmit={handleSubmit}>
          <div className="mb-3">
            <label className="form-label small fw-bold text-secondary">New Password</label>
            <input type="password" className="form-control form-control-lg bg-light border-0 input-animated" placeholder="Min 8 characters" style={{ borderRadius: '12px' }} value={password} onChange={(e) => { setPassword(e.target.value); setError(''); }} />
          </div>
          <div className="mb-4">
            <label className="form-label small fw-bold text-secondary">Confirm Password</label>
            <input type="password" className="form-control form-control-lg bg-light border-0 input-animated" placeholder="Re-enter password" style={{ borderRadius: '12px' }} value={confirm} onChange={(e) => { setConfirm(e.target.value); setError(''); }} />
          </div>
          <button type="submit" disabled={loading} className="btn btn-primary btn-lg w-100 fw-bold rounded-pill btn-animated mb-3">
            {loading ? <><span className="spinner-border spinner-border-sm me-2"></span>Resetting...</> : 'Reset Password'}
          </button>
        </form>
      </div>
    </div>
  );
}
