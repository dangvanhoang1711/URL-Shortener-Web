import { useState } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import api from '../services/api';

export default function VerifyPin() {
  const navigate = useNavigate();
  const location = useLocation();
  const email = location.state?.email || '';

  const [pin, setPin] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!pin || pin.length !== 6) { setError('Enter the 6-digit PIN'); return; }
    setLoading(true);
    setError('');
    try {
      await api.post('/verify-pin', { email, pin });
      navigate('/reset-password', { state: { email } });
    } catch (err) {
      setError(err.response?.data?.error || 'Invalid PIN');
    } finally {
      setLoading(false);
    }
  };

  if (!email) {
    return (
      <div className="container py-5 text-center" style={{ maxWidth: '480px' }}>
        <div className="card border-0 shadow-sm rounded-4 p-5">
          <p className="text-muted">No email found. Please start again.</p>
          <Link to="/forgot-password" className="btn btn-primary rounded-pill">Go Back</Link>
        </div>
      </div>
    );
  }

  return (
    <div className="container py-5" style={{ maxWidth: '480px' }}>
      <div className="text-center mb-4" style={{ animation: 'fadeInUp 0.5s ease both' }}>
        <h2 className="fw-black text-dark mb-2">Enter PIN</h2>
        <p className="text-muted small">A 6-digit PIN was sent to <strong>{email}</strong></p>
      </div>
      <div className="card border-0 shadow-sm rounded-4 p-4 p-sm-5" style={{ animation: 'fadeInUp 0.5s 0.1s ease both' }}>
        {error && <div className="alert alert-danger py-2 small animate-shake">{error}</div>}
        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label className="form-label small fw-bold text-secondary">PIN Code</label>
            <input
              type="text"
              className="form-control form-control-lg bg-light border-0 input-animated text-center"
              placeholder="000000"
              style={{ borderRadius: '12px', fontSize: '1.8rem', letterSpacing: '12px' }}
              maxLength={6}
              value={pin}
              onChange={(e) => { setPin(e.target.value.replace(/\D/g, '')); setError(''); }}
            />
          </div>
          <button type="submit" disabled={loading} className="btn btn-primary btn-lg w-100 fw-bold rounded-pill btn-animated mb-3">
            {loading ? <><span className="spinner-border spinner-border-sm me-2"></span>Verifying...</> : 'Verify PIN'}
          </button>
        </form>
        <div className="text-center">
          <Link to="/forgot-password" className="text-decoration-none small text-secondary fw-semibold">← Resend PIN</Link>
        </div>
      </div>
    </div>
  );
}
