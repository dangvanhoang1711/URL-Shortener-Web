import { Link } from 'react-router-dom';

export default function Privacy() {
  return (
    <div className="container py-5" style={{ maxWidth: '800px' }}>
      <Link to="/" className="btn btn-link text-muted p-0 mb-4 text-decoration-none">
        ← Back to Home
      </Link>
      <h1 className="fw-black text-dark mb-4">Privacy Policy</h1>
      <p className="text-muted mb-4">Last updated: May 2026</p>

      <section className="mb-4">
        <h5 className="fw-bold text-dark">1. Information We Collect</h5>
        <p className="text-muted">
          We collect only the data necessary to provide our URL shortening service: your email address
          (if you register), the URLs you shorten, and basic click analytics (timestamp, IP address,
          user agent). We do not sell or share your personal data with third parties.
        </p>
      </section>

      <section className="mb-4">
        <h5 className="fw-bold text-dark">2. How We Use Your Data</h5>
        <p className="text-muted">
          Your data is used solely to operate and improve the service — creating shortened URLs,
          providing click analytics, and maintaining account security.
        </p>
      </section>

      <section className="mb-4">
        <h5 className="fw-bold text-dark">3. Data Retention</h5>
        <p className="text-muted">
          Shortened URLs and their analytics are retained until you delete them. Account data is
          retained until you request deletion. You can delete any link from your dashboard at any time.
        </p>
      </section>

      <section className="mb-4">
        <h5 className="fw-bold text-dark">4. Cookies</h5>
        <p className="text-muted">
          We use only essential cookies for authentication (JWT tokens stored in localStorage).
          No tracking cookies or third-party analytics scripts are used.
        </p>
      </section>

      <section className="mb-4">
        <h5 className="fw-bold text-dark">5. Contact</h5>
        <p className="text-muted">
          If you have questions about this policy, please contact us via the Contact link in the footer.
        </p>
      </section>
    </div>
  );
}
