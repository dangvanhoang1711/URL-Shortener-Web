import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getHistory, getQRCode, shortenUrl } from '../services/urlService';
import api from '../services/api';

export default function Dashboard() {
  const navigate = useNavigate();
  const [urls, setUrls] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [copied, setCopied] = useState(null);
  const [qrModal, setQrModal] = useState(null);
  const [newUrl, setNewUrl] = useState('');

  const fetchUrls = async () => {
    try {
      const data = await getHistory();
      setUrls(data.urls || []);
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to load links');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUrls();
  }, []);

  const handleShorten = async (e) => {
    e.preventDefault();
    if (!newUrl) return;

    try {
      const result = await shortenUrl(newUrl);
      setUrls(prev => [result, ...prev]);
      setNewUrl('');
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to shorten URL');
    }
  };

  const handleCopy = (shortCode) => {
    navigator.clipboard.writeText(`${window.location.origin}/${shortCode}`);
    setCopied(shortCode);
    setTimeout(() => setCopied(null), 2000);
  };

  const handleViewStats = (shortCode) => {
    navigate(`/stats/${shortCode}`);
  };

  const handleShowQR = async (shortCode) => {
    try {
      await api.post(`/urls/${shortCode}/qr-code?format=png&size=300`);
      const data = await getQRCode(shortCode, 'png');
      setQrModal({
        shortCode,
        qrData: data.data?.qrData
      });
    } catch (err) {
      setQrModal({ shortCode, qrData: null, error: 'Failed to load QR code' });
    }
  };

  const handleCloseQR = () => setQrModal(null);

  if (loading) {
    return (
      <div className="d-flex justify-content-center align-items-center min-vh-50">
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">Loading...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="container py-4">
      <div className="row mb-4">
        <div className="col">
          <h2 className="fw-bold text-dark">My Links</h2>
          <p className="text-muted">Manage and track your shortened URLs</p>
        </div>
      </div>

      <div className="card border-0 shadow-sm rounded-4 mb-4">
        <div className="card-body p-4">
          <form onSubmit={handleShorten} className="row g-3">
            <div className="col-md-9">
              <input
                type="text"
                className="form-control form-control-lg bg-light border-0"
                placeholder="Enter a URL to shorten"
                style={{ borderRadius: '12px' }}
                value={newUrl}
                onChange={(e) => setNewUrl(e.target.value)}
              />
            </div>
            <div className="col-md-3">
              <button type="submit" className="btn btn-primary btn-lg w-100 fw-bold" style={{ borderRadius: '12px' }}>
                Shorten
              </button>
            </div>
          </form>
          {error && <div className="alert alert-danger mt-3 py-2 small">{error}</div>}
        </div>
      </div>

      {urls.length === 0 ? (
        <div className="text-center py-5">
          <div className="display-4 mb-3">🔗</div>
          <h4 className="text-muted">No links yet</h4>
          <p className="text-muted">Create your first shortened link above!</p>
        </div>
      ) : (
        <div className="card border-0 shadow-sm rounded-4">
          <div className="table-responsive">
            <table className="table table-hover mb-0">
              <thead className="bg-light">
                <tr>
                  <th className="border-0 py-3 ps-4">Short Link</th>
                  <th className="border-0 py-3 d-none d-md-table-cell">Original URL</th>
                  <th className="border-0 py-3 text-center">Clicks</th>
                  <th className="border-0 py-3 text-center d-none d-sm-table-cell">Created</th>
                  <th className="border-0 py-3 text-center pe-4">Actions</th>
                </tr>
              </thead>
              <tbody>
                {urls.map((item) => (
                  <tr key={item.id}>
                    <td className="py-3 ps-4">
                      <a href={`/${item.shortCode}`} target="_blank" rel="noopener noreferrer" className="text-primary fw-bold text-decoration-none">
                        {item.shortCode}
                      </a>
                    </td>
                    <td className="py-3 d-none d-md-table-cell">
                      <span className="text-truncate d-inline-block" style={{ maxWidth: '250px' }}>
                        {item.originalUrl}
                      </span>
                    </td>
                    <td className="py-3 text-center">
                      <span className="badge bg-primary rounded-pill">{item.clickCount || 0}</span>
                    </td>
                    <td className="py-3 text-center text-muted small d-none d-sm-table-cell">
                      {new Date(item.createdAt).toLocaleDateString()}
                    </td>
                    <td className="py-3 text-center pe-4">
                      <div className="d-flex gap-1 justify-content-center">
                        <button
                          onClick={() => handleCopy(item.shortCode)}
                          className={`btn btn-sm ${copied === item.shortCode ? 'btn-success' : 'btn-outline-primary'} rounded-pill`}
                          title="Copy"
                        >
                          {copied === item.shortCode ? 'Copied!' : 'Copy'}
                        </button>
                        <button
                          onClick={() => handleShowQR(item.shortCode)}
                          className="btn btn-sm btn-outline-secondary rounded-pill"
                          title="Show QR"
                        >
                          QR
                        </button>
                        <button
                          onClick={() => handleViewStats(item.shortCode)}
                          className="btn btn-sm btn-outline-info rounded-pill"
                          title="View Stats"
                        >
                          Stats
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {qrModal && (
        <div className="modal show d-block" tabIndex="-1" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }} onClick={handleCloseQR}>
          <div className="modal-dialog modal-dialog-centered">
            <div className="modal-content rounded-4">
              <div className="modal-header border-0">
                <h5 className="modal-title fw-bold">QR Code for {qrModal.shortCode}</h5>
                <button type="button" className="btn-close" onClick={handleCloseQR}></button>
              </div>
              <div className="modal-body text-center">
                {qrModal.error ? (
                  <div className="alert alert-danger">{qrModal.error}</div>
                ) : qrModal.qrData ? (
                  <div className="d-inline-block p-3 bg-white rounded-3">
                    <img src={qrModal.qrData} alt="QR Code" style={{ width: '200px', height: '200px' }} />
                  </div>
                ) : (
                  <div className="text-center">
                    <div className="spinner-border text-primary mb-3" role="status"></div>
                    <p className="text-muted">Generating QR code...</p>
                  </div>
                )}
              </div>
              {qrModal.qrData && (
                <div className="modal-footer border-0 justify-content-center">
                  <a
                    href={qrModal.qrData}
                    download={`qr-${qrModal.shortCode}.png`}
                    className="btn btn-primary"
                  >
                    Download PNG
                  </a>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}