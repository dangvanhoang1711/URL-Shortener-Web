import { Link } from 'react-router-dom';

export default function Terms() {
  return (
    <div className="container py-5" style={{ maxWidth: '800px' }}>
      <Link to="/" className="btn btn-link text-muted p-0 mb-4 text-decoration-none">
        ← Back to Home
      </Link>
      <h1 className="fw-black text-dark mb-4">Terms of Service</h1>
      <p className="text-muted mb-4">Last updated: May 2026</p>

      <section className="mb-4">
        <h5 className="fw-bold text-dark">1. Acceptance of Terms</h5>
        <p className="text-muted">
          By using 4H's Shortener, you agree to these Terms of Service. If you do not agree,
          please do not use the service.
        </p>
      </section>

      <section className="mb-4">
        <h5 className="fw-bold text-dark">2. Service Description</h5>
        <p className="text-muted">
          We provide a URL shortening service that allows users to create shortened links,
          track click analytics, and generate QR codes.
        </p>
      </section>

      <section className="mb-4">
        <h5 className="fw-bold text-dark">3. Acceptable Use</h5>
        <p className="text-muted">
          You agree not to use the service for any illegal purpose, to distribute malware or spam,
          or to engage in any activity that disrupts the service for other users.
        </p>
      </section>

      <section className="mb-4">
        <h5 className="fw-bold text-dark">4. Account Responsibility</h5>
        <p className="text-muted">
          You are responsible for maintaining the confidentiality of your account credentials
          and for all activities that occur under your account.
        </p>
      </section>

      <section className="mb-4">
        <h5 className="fw-bold text-dark">5. Limitation of Liability</h5>
        <p className="text-muted">
          The service is provided "as is" without warranties. We are not liable for any damages
          arising from the use or inability to use the service.
        </p>
      </section>
    </div>
  );
}
