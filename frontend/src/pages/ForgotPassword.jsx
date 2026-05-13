import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import api from '../services/api';

export default function ForgotPassword() {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [sent, setSent] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email) { setError('Enter your email'); return; }
    setLoading(true);
    setError('');
    try {
      await api.post('/forgot-password', { email });
      setSent(true);
    } catch (err) {
      setError(err.response?.data?.error || 'Something went wrong');
    } finally {
      setLoading(false);
    }
  };

  if (sent) {
    return (
      <div className="container py-5" style={{ maxWidth: '480px' }}>
        <div className="card border-0 shadow-sm rounded-4 p-5 text-center" style={{ animation: 'fadeInUp 0.5s ease both' }}>
          <div className="d-inline-flex align-items-center justify-content-center rounded-circle mb-3 mx-auto" style={{ width: '64px', height: '64px', backgroundColor: '#e7f1ff' }}>
            <i className="bi bi-envelope-check text-primary fs-3"></i>
          </div>
          <h4 className="fw-bold mb-2">Check Your Email</h4>
          <p className="text-muted small mb-4">A 6-digit PIN has been sent to <strong>{email}</strong>. It expires in 10 minutes.</p>
          <button onClick={() => navigate('/verify-pin', { state: { email } })} className="btn btn-primary rounded-pill px-4 fw-bold">
            Enter PIN
          </button>
          <Link to="/login" className="btn btn-link text-muted text-decoration-none mt-2 small">Back to Login</Link>
        </div>
      </div>
    );
  }

  return (
    <div className="container py-5" style={{ maxWidth: '480px' }}>
      <div className="text-center mb-4" style={{ animation: 'fadeInUp 0.5s ease both' }}>
        <h2 className="fw-black text-dark mb-2">Forgot Password?</h2>
        <p className="text-muted small">Enter your email and we'll send you a PIN to reset your password.</p>
      </div>
      <div className="card border-0 shadow-sm rounded-4 p-4 p-sm-5" style={{ animation: 'fadeInUp 0.5s 0.1s ease both' }}>
        {error && <div className="alert alert-danger py-2 small animate-shake">{error}</div>}
        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label className="form-label small fw-bold text-secondary">Email Address</label>
            <input type="email" className="form-control form-control-lg bg-light border-0 input-animated" placeholder="you@example.com" style={{ borderRadius: '12px' }} value={email} onChange={(e) => { setEmail(e.target.value); setError(''); }} />
          </div>
          <button type="submit" disabled={loading} className="btn btn-primary btn-lg w-100 fw-bold rounded-pill btn-animated mb-3">
            {loading ? <><span className="spinner-border spinner-border-sm me-2"></span>Sending...</> : 'Send PIN'}
          </button>
        </form>
        <div className="text-center">
          <Link to="/login" className="text-decoration-none small text-secondary fw-semibold">← Back to Login</Link>
        </div>
      </div>
    </div>
  );
}
