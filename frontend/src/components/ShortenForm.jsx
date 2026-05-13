import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { shortenUrl, getHistory } from '../services/urlService';
import { useAuth } from '../context/AuthContext';

export default function ShortenForm() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [url, setUrl] = useState('');
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [copied, setCopied] = useState(null);
  const [inputFocused, setInputFocused] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const inputRef = useRef(null);

  useEffect(() => {
    if (url) {
      setError('');
    }
  }, [url]);

  const handleShorten = async (e) => {
    e.preventDefault();
    if (!url) return;

    if (!user) {
      navigate('/login');
      return;
    }

    setLoading(true);
    setError('');
    try {
      const result = await shortenUrl(url);
      setHistory(prev => [result, ...prev]);
      setUrl('');
      setShowSuccess(true);
      setTimeout(() => setShowSuccess(false), 1500);
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to shorten URL. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleCopy = (shortCode) => {
    navigator.clipboard.writeText(`${window.location.origin}/${shortCode}`);
    setCopied(shortCode);
    setTimeout(() => setCopied(null), 2000);
  };

  return (
    <div className="row justify-content-center w-100 m-0">
      <div className="col-md-10 col-lg-8">
        <div
          className="text-center mb-5"
          style={{
            animation: 'fadeInUp 0.6s cubic-bezier(0.22, 1, 0.36, 1) both',
          }}
        >
          <h1
            className="display-4 fw-black text-dark fw-bolder mb-3"
            style={{
              animation: 'fadeInUp 0.6s 0.1s cubic-bezier(0.22, 1, 0.36, 1) both',
            }}
          >
            Build stronger connections
          </h1>
          <p
            className="lead text-secondary"
            style={{
              animation: 'fadeInUp 0.6s 0.2s cubic-bezier(0.22, 1, 0.36, 1) both',
            }}
          >
            A powerful tool to create short, professional, and trackable links.
          </p>
        </div>

        <div
          className={`card border-0 shadow-lg p-4 rounded-4 mb-5 ${inputFocused ? 'animate-border-glow' : ''}`}
          style={{
            transition: 'box-shadow 0.3s ease, border-color 0.3s ease',
            border: '2px solid transparent',
            animation: 'fadeInUp 0.6s 0.25s cubic-bezier(0.22, 1, 0.36, 1) both',
          }}
        >
          <div className="card-body">
            {error && (
              <div className="alert alert-danger py-2 small animate-shake mb-3" role="alert">
                {error}
              </div>
            )}
            {showSuccess && (
              <div
                className="alert alert-success py-2 small mb-3 animate-success-pop"
                role="alert"
                style={{ backgroundColor: '#d1e7dd', border: 'none' }}
              >
                Link shortened successfully!
              </div>
            )}
            <form onSubmit={handleShorten} className="row g-3">
              <div className="col-md-9">
                <div className="position-relative">
                  <input
                    ref={inputRef}
                    type="text"
                    required
                    className="form-control form-control-lg bg-light px-4 border-0 input-animated"
                    placeholder="Paste a long URL (e.g., https://example.com/...)"
                    style={{
                      borderRadius: '16px',
                      paddingLeft: '3rem',
                      transition: 'all 0.3s cubic-bezier(0.22, 1, 0.36, 1)',
                    }}
                    value={url}
                    onChange={(e) => setUrl(e.target.value)}
                    onFocus={() => setInputFocused(true)}
                    onBlur={() => setInputFocused(false)}
                  />
                  <i
                    className="bi bi-link-45deg position-absolute text-muted"
                    style={{
                      left: '16px',
                      top: '50%',
                      transform: inputFocused ? 'translateY(-50%) scale(1.2)' : 'translateY(-50%)',
                      transition: 'transform 0.3s cubic-bezier(0.22, 1, 0.36, 1), color 0.3s ease',
                      fontSize: '1.3rem',
                      color: inputFocused ? '#0d6efd' : '#9ca3af',
                    }}
                  ></i>
                </div>
              </div>
              <div className="col-md-3">
                <button
                  type="submit"
                  disabled={loading}
                  className="btn btn-primary btn-lg w-100 fw-bold shadow-sm btn-animated animate-gradient-bg"
                  style={{
                    borderRadius: '16px',
                    height: '100%',
                    letterSpacing: '1px',
                    fontSize: '1rem',
                  }}
                >
                  {loading ? (
                    <>
                      <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                      Creating...
                    </>
                  ) : 'GET'}
                </button>
              </div>
            </form>
            <div className="mt-3 small text-muted text-center text-md-start">
              {user ? 'Create trackable links with your account.' : (
                <span>
                  <button onClick={() => navigate('/login')} className="btn btn-link p-0 text-primary fw-bold border-0">Log in</button>
                  {' '}or{' '}
                  <button onClick={() => navigate('/signup')} className="btn btn-link p-0 text-primary fw-bold border-0">Sign up</button>
                  {' '}to track your links.
                </span>
              )}
            </div>
          </div>
        </div>

        {history.length > 0 && (
          <div className="history-section" style={{ animation: 'fadeInUp 0.5s cubic-bezier(0.22, 1, 0.36, 1) both' }}>
            <h4 className="fw-bold mb-4 d-flex align-items-center">
              <span className="me-2">📋</span> Recent Links
            </h4>
            <div className="list-group border-0 shadow-sm rounded-4">
              {history.map((item, index) => (
                <div
                  key={item.shortCode}
                  className="list-group-item list-group-item-action p-3 border-0 border-bottom list-item-animated"
                  style={{ animationDelay: `${index * 0.05}s` }}
                >
                  <div className="d-flex justify-content-between align-items-center">
                    <div className="text-truncate me-3">
                      <p className="mb-0 fw-bold text-primary">{item.shortUrl || `${window.location.origin}/${item.shortCode}`}</p>
                      <small className="text-muted d-block text-truncate" style={{ maxWidth: '400px' }}>
                        {item.title || 'No title'}
                      </small>
                    </div>
                    <div className="d-flex align-items-center gap-2">
                      <span className="badge bg-light text-dark border py-2 px-3 rounded-pill">
                        {item.clickCount || 0} clicks
                      </span>
                      <button
                        className={`btn btn-sm ${copied === item.shortCode ? 'btn-success' : 'btn-outline-primary'} rounded-pill px-3`}
                        style={{
                          transition: 'all 0.3s cubic-bezier(0.22, 1, 0.36, 1)',
                          transform: copied === item.shortCode ? 'scale(1.05)' : 'scale(1)',
                        }}
                        onClick={() => handleCopy(item.shortCode)}
                      >
                        {copied === item.shortCode ? (
                          <>
                            <i className="bi bi-check-lg me-1"></i>Copied!
                          </>
                        ) : 'Copy'}
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
