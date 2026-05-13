import { useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../services/api';

export default function Contact() {
  const [form, setForm] = useState({ name: '', email: '', message: '' });
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState('');
  const [error, setError] = useState('');

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
    setError('');
    setSuccess('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.name || !form.email || !form.message) {
      setError('All fields are required');
      return;
    }
    setLoading(true);
    try {
      const res = await api.post('/contact', form);
      setSuccess(res.data.message);
      setForm({ name: '', email: '', message: '' });
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to send message');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container py-5" style={{ maxWidth: '600px' }}>
      <Link to="/" className="btn btn-link text-muted p-0 mb-4 text-decoration-none">
        ← Back to Home
      </Link>

      <div
        className="text-center mb-4"
        style={{ animation: 'fadeInUp 0.5s cubic-bezier(0.22, 1, 0.36, 1) both' }}
      >
        <h1 className="fw-black text-dark mb-2">Contact Us</h1>
        <p className="text-muted">Have a question or feedback? We'd love to hear from you.</p>
      </div>

      <div
        className="card border-0 shadow-sm rounded-4 p-4 p-sm-5"
        style={{ animation: 'fadeInUp 0.5s 0.1s cubic-bezier(0.22, 1, 0.36, 1) both' }}
      >
        {success && (
          <div className="alert alert-success py-2 small animate-success-pop" role="alert">
            <i className="bi bi-check-circle me-2"></i>{success}
          </div>
        )}
        {error && (
          <div className="alert alert-danger py-2 small animate-shake" role="alert">
            <i className="bi bi-exclamation-circle me-2"></i>{error}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div className="mb-3">
            <label className="form-label small fw-bold text-secondary">Your Name</label>
            <input
              type="text"
              name="name"
              className="form-control form-control-lg bg-light border-0 input-animated"
              placeholder="John Doe"
              style={{ borderRadius: '12px' }}
              value={form.name}
              onChange={handleChange}
            />
          </div>

          <div className="mb-3">
            <label className="form-label small fw-bold text-secondary">Email Address</label>
            <input
              type="email"
              name="email"
              className="form-control form-control-lg bg-light border-0 input-animated"
              placeholder="john@example.com"
              style={{ borderRadius: '12px' }}
              value={form.email}
              onChange={handleChange}
            />
          </div>

          <div className="mb-4">
            <label className="form-label small fw-bold text-secondary">Message</label>
            <textarea
              name="message"
              rows="5"
              className="form-control form-control-lg bg-light border-0 input-animated"
              placeholder="Write your message here..."
              style={{ borderRadius: '12px', resize: 'vertical' }}
              value={form.message}
              onChange={handleChange}
            ></textarea>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="btn btn-primary btn-lg w-100 fw-bold rounded-pill btn-animated"
          >
            {loading ? (
              <><span className="spinner-border spinner-border-sm me-2" role="status"></span>Sending...</>
            ) : (
              <><i className="bi bi-send me-2"></i>Send Message</>
            )}
          </button>
        </form>
      </div>
    </div>
  );
}
