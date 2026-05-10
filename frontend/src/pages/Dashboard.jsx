import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getHistory, getQRCode, shortenUrl, deleteLink as apiDeleteLink } from '../services/urlService';
import api from '../services/api';

export default function Dashboard() {
  const navigate = useNavigate();
  const [urls, setUrls] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [copied, setCopied] = useState(null);
  const [qrModal, setQrModal] = useState(null);
  const [deleteModal, setDeleteModal] = useState(null);
  const [deleting, setDeleting] = useState(false);
  const [newUrl, setNewUrl] = useState('');
  const [inputFocused, setInputFocused] = useState(false);
  const [shortenLoading, setShortenLoading] = useState(false);

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
    if (!newUrl.trim()) return;

    setShortenLoading(true);
    setError('');
    try {
      await shortenUrl(newUrl.trim());
      setNewUrl('');
      await fetchUrls();
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to shorten URL. Please try again.');
    } finally {
      setShortenLoading(false);
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
      setQrModal({ shortCode, qrData: null, error: null });
      await api.post(`/urls/${shortCode}/qr-code?format=png&size=300`);
      const data = await getQRCode(shortCode, 'png');
      setQrModal(prev => ({ ...prev, qrData: data.qrData }));
    } catch (err) {
      setQrModal(prev => ({ ...prev, error: 'Failed to load QR code' }));
    }
  };

  const handleCloseQR = () => setQrModal(null);

  const handleOpenDelete = (item) => {
    setDeleteModal(item);
  };

  const handleCloseDelete = () => setDeleteModal(null);

  const handleConfirmDelete = async () => {
    if (!deleteModal) return;
    setDeleting(true);
    try {
      await apiDeleteLink(deleteModal.id);
      setUrls(prev => prev.filter(u => u.id !== deleteModal.id));
      setDeleteModal(null);
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to delete link');
      setDeleteModal(null);
    } finally {
      setDeleting(false);
    }
  };

  if (loading) {
    return (
      <div className="d-flex justify-content-center align-items-center" style={{ minHeight: '50vh' }}>
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">Loading...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="container py-4">
      <div className="row mb-4" style={{ animation: 'fadeInUp 0.5s cubic-bezier(0.22, 1, 0.36, 1) both' }}>
        <div className="col">
          <h2 className="fw-bold text-dark mb-1">My Links</h2>
          <p className="text-muted mb-0">Create, manage, and track your shortened URLs</p>
        </div>
        <div className="col-auto d-flex align-items-center">
          <span className="badge bg-light text-dark border py-2 px-3 rounded-pill">
            <i className="bi bi-link-45deg me-1"></i>{urls.length} link{urls.length !== 1 ? 's' : ''}
          </span>
        </div>
      </div>

      <div
        className={`card border-0 shadow-sm rounded-4 mb-4 ${inputFocused ? 'animate-border-glow' : ''}`}
        style={{
          transition: 'box-shadow 0.3s ease, border-color 0.3s ease',
          border: '2px solid transparent',
          animation: 'fadeInUp 0.5s 0.1s cubic-bezier(0.22, 1, 0.36, 1) both',
        }}
      >
        <div className="card-body p-4">
          <form onSubmit={handleShorten} className="row g-3">
            <div className="col-md-8">
              <div className="position-relative">
                <input
                  type="text"
                  className="form-control form-control-lg bg-light border-0 input-animated"
                  placeholder="Paste a long URL here..."
                  style={{ borderRadius: '14px', paddingLeft: '2.8rem' }}
                  value={newUrl}
                  onChange={(e) => setNewUrl(e.target.value)}
                  onFocus={() => setInputFocused(true)}
                  onBlur={() => setInputFocused(false)}
                />
                <i className="bi bi-link-45deg position-absolute text-muted" style={{ left: '14px', top: '50%', transform: 'translateY(-50%)', fontSize: '1.2rem', color: inputFocused ? '#0d6efd' : '#9ca3af', transition: 'color 0.3s ease' }}></i>
              </div>
            </div>
            <div className="col-md-4">
              <button type="submit" disabled={shortenLoading} className="btn btn-primary btn-lg w-100 fw-bold shadow-sm btn-animated animate-gradient-bg" style={{ borderRadius: '14px', letterSpacing: '0.5px' }}>
                {shortenLoading ? (<><span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>Creating...</>) : (<><i className="bi bi-plus-lg me-2"></i>Shorten URL</>)}
              </button>
            </div>
          </form>
          {error && (
            <div className="alert alert-danger mt-3 py-2 small mb-0 animate-shake" role="alert" style={{ borderRadius: '10px' }}>
              <i className="bi bi-exclamation-circle me-2"></i>{error}
            </div>
          )}
        </div>
      </div>

      {urls.length === 0 ? (
        <div className="text-center py-5" style={{ animation: 'fadeInUp 0.5s 0.2s cubic-bezier(0.22, 1, 0.36, 1) both' }}>
          <div className="d-inline-flex align-items-center justify-content-center rounded-circle mb-3" style={{ width: '80px', height: '80px', backgroundColor: '#e7f1ff' }}>
            <i className="bi bi-link-45deg display-5 text-primary"></i>
          </div>
          <h4 className="text-dark mb-2">No links yet</h4>
          <p className="text-muted mb-0">Paste a URL above to create your first shortened link!</p>
        </div>
      ) : (
        <div
          className="card border-0 shadow-sm rounded-4 overflow-hidden"
          style={{ animation: 'fadeInUp 0.5s 0.3s cubic-bezier(0.22, 1, 0.36, 1) both' }}
        >
          <div className="table-responsive">
            <table className="table table-hover mb-0 align-middle" style={{ borderCollapse: 'separate', borderSpacing: 0 }}>
              <thead>
                <tr>
                  <th className="border-0 py-3 ps-4" style={{ fontSize: '0.75rem', letterSpacing: '0.5px', textTransform: 'uppercase', fontWeight: 600, color: '#495057', whiteSpace: 'nowrap', backgroundColor: '#ffffff', borderBottom: '2px solid #e9ecef' }}>Short Link</th>
                  <th className="border-0 py-3 d-none d-lg-table-cell" style={{ fontSize: '0.75rem', letterSpacing: '0.5px', textTransform: 'uppercase', fontWeight: 600, color: '#495057', width: '35%', backgroundColor: '#ffffff', borderBottom: '2px solid #e9ecef' }}>Original URL</th>
                  <th className="border-0 py-3 text-center" style={{ fontSize: '0.75rem', letterSpacing: '0.5px', textTransform: 'uppercase', fontWeight: 600, color: '#495057', width: '80px', backgroundColor: '#ffffff', borderBottom: '2px solid #e9ecef' }}>Clicks</th>
                  <th className="border-0 py-3 text-center d-none d-md-table-cell" style={{ fontSize: '0.75rem', letterSpacing: '0.5px', textTransform: 'uppercase', fontWeight: 600, color: '#495057', width: '120px', backgroundColor: '#ffffff', borderBottom: '2px solid #e9ecef' }}>Created</th>
                  <th className="border-0 py-3 text-center pe-4" style={{ fontSize: '0.75rem', letterSpacing: '0.5px', textTransform: 'uppercase', fontWeight: 600, color: '#495057', width: '200px', backgroundColor: '#ffffff', borderBottom: '2px solid #e9ecef' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {urls.map((item, index) => (
                  <tr
                    key={item.id}
                    style={{
                      animation: 'slideUpList 0.4s cubic-bezier(0.22, 1, 0.36, 1) both',
                      animationDelay: `${index * 0.05}s`,
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.backgroundColor = '#f1f3ff';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.backgroundColor = '';
                    }}
                  >
                    <td className="py-3 ps-4" style={{ backgroundColor: '#ffffff', borderBottom: '1px solid #f0f2f5' }}>
                      <a
                        href={`/${item.shortCode}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="fw-semibold text-primary text-decoration-none"
                        style={{ fontSize: '0.9rem', wordBreak: 'break-all' }}
                      >
                        {item.shortCode}
                      </a>
                    </td>
                    <td className="py-3 d-none d-lg-table-cell" style={{ backgroundColor: '#ffffff', borderBottom: '1px solid #f0f2f5' }}>
                      <span className="text-dark" style={{ fontSize: '0.82rem', display: 'block', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', maxWidth: '350px' }} title={item.originalUrl}>
                        {item.originalUrl}
                      </span>
                    </td>
                    <td className="py-3 text-center" style={{ backgroundColor: '#ffffff', borderBottom: '1px solid #f0f2f5' }}>
                      <span className="badge bg-primary rounded-pill">{item.clickCount || 0}</span>
                    </td>
                    <td className="py-3 text-center d-none d-md-table-cell" style={{ backgroundColor: '#ffffff', fontSize: '0.8rem', color: '#495057', borderBottom: '1px solid #f0f2f5' }}>
                      {item.createdAt ? new Date(item.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : '-'}
                    </td>
                    <td className="py-3 text-center pe-4" style={{ backgroundColor: '#ffffff', borderBottom: '1px solid #f0f2f5' }}>
                      <div className="d-flex gap-2 justify-content-center">
                        <button
                          onClick={() => handleCopy(item.shortCode)}
                          className={`btn btn-sm ${copied === item.shortCode ? 'btn-success' : 'btn-outline-primary'} rounded-pill`}
                          style={{ fontSize: '0.78rem', minWidth: '80px', transition: 'all 0.3s ease' }}
                        >
                          {copied === item.shortCode ? (<><i className="bi bi-check-lg me-1"></i>Copied!</>) : (<><i className="bi bi-copy me-1"></i>Copy</>)}
                        </button>
<button
                          onClick={() => handleShowQR(item.shortCode)}
                          className="btn btn-sm btn-outline-info rounded-pill"
                          style={{ fontSize: '0.78rem', minWidth: '60px', transition: 'all 0.3s ease' }}
                          title="View QR Code"
                        >
                          <i className="bi bi-qr-code"></i>
                        </button>
                        <button
                          onClick={() => handleViewStats(item.shortCode)}
                          className="btn btn-sm btn-outline-primary rounded-pill"
                          style={{ fontSize: '0.78rem', minWidth: '60px', transition: 'all 0.3s ease' }}
                          title="View Stats"
                        >
                          <i className="bi bi-bar-chart"></i>
                        </button>
                        <button
                          onClick={() => handleOpenDelete(item)}
                          className="btn btn-sm btn-outline-danger rounded-pill"
                          style={{ fontSize: '0.78rem', minWidth: '60px', transition: 'all 0.3s ease' }}
                          title="Delete Link"
                        >
                          <i className="bi bi-trash"></i>
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
        <div className="modal show d-block" tabIndex="-1" style={{ backgroundColor: 'rgba(0,0,0,0.5)', backdropFilter: 'blur(4px)', animation: 'fadeInScale 0.3s cubic-bezier(0.22, 1, 0.36, 1) both' }} onClick={(e) => e.target === e.currentTarget && handleCloseQR()}>
          <div className="modal-dialog modal-dialog-centered">
            <div className="modal-content rounded-4 border-0 shadow" style={{ overflow: 'hidden' }}>
              <div className="modal-header border-0 pb-0" style={{ background: 'linear-gradient(135deg, #0d6efd 0%, #0d3cdb 100%)', color: 'white' }}>
                <div>
                  <h5 className="modal-title fw-bold mb-0"><i className="bi bi-qr-code me-2"></i>QR Code</h5>
                  <small className="opacity-75">{qrModal.shortCode}</small>
                </div>
                <button type="button" className="btn-close btn-close-white ms-auto" onClick={handleCloseQR}></button>
              </div>
              <div className="modal-body text-center py-4">
                {qrModal.error ? (
                  <div className="alert alert-danger mb-0"><i className="bi bi-exclamation-circle me-2"></i>{qrModal.error}</div>
                ) : qrModal.qrData ? (
                  <div className="d-inline-block p-3 bg-white rounded-3 shadow-sm">
                    <img src={qrModal.qrData} alt="QR Code" style={{ width: '220px', height: '220px', borderRadius: '12px' }} />
                  </div>
                ) : (
                  <div className="py-4"><div className="spinner-border text-primary mb-3" role="status"></div><p className="text-muted mb-0">Generating QR code...</p></div>
                )}
              </div>
              {qrModal.qrData && (
                <div className="modal-footer border-0 justify-content-center pt-0">
                  <a href={qrModal.qrData} download={`qr-${qrModal.shortCode}.png`} className="btn btn-primary btn-animated rounded-pill px-4">
                    <i className="bi bi-download me-2"></i>Download PNG
                  </a>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {deleteModal && (
        <div className="modal show d-block" tabIndex="-1" style={{ backgroundColor: 'rgba(0,0,0,0.5)', backdropFilter: 'blur(4px)', animation: 'fadeInScale 0.3s cubic-bezier(0.22, 1, 0.36, 1) both' }} onClick={(e) => e.target === e.currentTarget && handleCloseDelete()}>
          <div className="modal-dialog modal-dialog-centered modal-sm">
            <div className="modal-content rounded-4 border-0 shadow">
              <div className="modal-body text-center py-4 px-4">
                <div className="d-inline-flex align-items-center justify-content-center rounded-circle mb-3" style={{ width: '60px', height: '60px', backgroundColor: '#fee2e2' }}>
                  <i className="bi bi-trash text-danger fs-3"></i>
                </div>
                <h5 className="fw-bold mb-2">Delete Link</h5>
                <p className="text-muted small mb-0">
                  Are you sure you want to delete this link?<br />
                  <strong className="text-dark">{window.location.origin}/{deleteModal.shortCode}</strong>
                </p>
                <p className="text-muted small mt-2 mb-0" style={{ fontSize: '0.75rem' }}>
                  <i className="bi bi-info-circle me-1"></i>This action cannot be undone.
                </p>
              </div>
              <div className="modal-footer border-0 justify-content-center pt-0 pb-4 px-4">
                <button className="btn btn-outline-secondary rounded-pill px-4" style={{ minWidth: '100px' }} onClick={handleCloseDelete} disabled={deleting}>Cancel</button>
                <button className="btn btn-danger rounded-pill px-4" style={{ minWidth: '100px' }} onClick={handleConfirmDelete} disabled={deleting}>
                  {deleting ? (<><span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>Deleting...</>) : (<><i className="bi bi-trash me-2"></i>Delete</>)}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
