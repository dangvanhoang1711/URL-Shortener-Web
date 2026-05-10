import { useState } from 'react';
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
        <div className="text-center mb-5">
          <h1 className="display-4 fw-black text-dark fw-bolder mb-3">Build stronger connections</h1>
          <p className="lead text-secondary">A powerful tool to create short, professional, and trackable links.</p>
        </div>

        <div className="card border-0 shadow-lg p-4 rounded-4 mb-5">
          <div className="card-body">
            {error && (
              <div className="alert alert-danger py-2 small mb-3" role="alert">
                {error}
              </div>
            )}
            <form onSubmit={handleShorten} className="row g-3">
              <div className="col-md-9">
                <input
                  type="text"
                  required
                  className="form-control form-control-lg bg-light px-4 border-0"
                  placeholder="Paste a long URL (e.g., https://example.com/...)"
                  style={{ borderRadius: '12px' }}
                  value={url}
                  onChange={(e) => setUrl(e.target.value)}
                />
              </div>
              <div className="col-md-3">
                <button
                  type="submit"
                  disabled={loading}
                  className="btn btn-primary btn-lg w-100 fw-bold shadow-sm"
                  style={{ borderRadius: '12px', height: '100%' }}
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
          <div className="history-section">
            <h4 className="fw-bold mb-4 d-flex align-items-center">
              <span className="me-2">📋</span> Recent Links
            </h4>
            <div className="list-group border-0 shadow-sm rounded-4">
              {history.map((item) => (
                <div key={item.id} className="list-group-item list-group-item-action p-3 border-0 border-bottom">
                  <div className="d-flex justify-content-between align-items-center">
                    <div className="text-truncate me-3">
                      <p className="mb-0 fw-bold text-primary">{window.location.origin}/{item.shortCode}</p>
                      <small className="text-muted d-block text-truncate" style={{ maxWidth: '400px' }}>
                        {item.originalUrl}
                      </small>
                    </div>
                    <div className="d-flex align-items-center gap-2">
                      <span className="badge bg-light text-dark border py-2 px-3 rounded-pill">
                        {item.clickCount || 0} clicks
                      </span>
                      <button
                        className={`btn btn-sm ${copied === item.shortCode ? 'btn-success' : 'btn-outline-primary'} rounded-pill px-3`}
                        onClick={() => handleCopy(item.shortCode)}
                      >
                        {copied === item.shortCode ? 'Copied!' : 'Copy'}
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