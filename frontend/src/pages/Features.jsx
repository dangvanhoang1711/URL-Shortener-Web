import { Link } from 'react-router-dom';

const features = [
  {
    icon: 'bi bi-link-45deg',
    title: 'Smart URL Shortening',
    desc: 'Transform long, clumsy URLs into clean, memorable short links with lightning-fast redirects using Base62 encoding.',
    color: '#0d6efd',
  },
  {
    icon: 'bi bi-bar-chart-line',
    title: 'Real-time Analytics',
    desc: 'Track every click with detailed stats — daily trends, referrers, and geographic data powered by Chart.js.',
    color: '#198754',
  },
  {
    icon: 'bi bi-qr-code',
    title: 'QR Code Generator',
    desc: 'Generate and download QR codes for any shortened link instantly in PNG or SVG format.',
    color: '#6f42c1',
  },
  {
    icon: 'bi bi-shield-check',
    title: 'Auth & Security',
    desc: 'JWT-based authentication with bcrypt password hashing. Rate limiting and Helmet.js protect against abuse.',
    color: '#fd7e14',
  },
  {
    icon: 'bi bi-layers',
    title: 'Redis Caching',
    desc: 'High-performance Redis cache stores popular URLs for sub-millisecond lookups during redirects.',
    color: '#dc3545',
  },
  {
    icon: 'bi bi-clock-history',
    title: 'Link Management',
    desc: 'Manage all your links from one dashboard — create, copy, view stats, or delete with zero hassle.',
    color: '#0dcaf0',
  },
  {
    icon: 'bi bi-database-gear',
    title: 'Prisma ORM + MySQL',
    desc: 'Robust relational database with Prisma ORM — type-safe queries, automated migrations, and full-text search.',
    color: '#20c997',
  },
  {
    icon: 'bi bi-box',
    title: 'Dockerized Deployment',
    desc: 'One-command deploy with Docker Compose — app, MySQL 8.0, and Redis all orchestrated together.',
    color: '#0d6efd',
  },
];

export default function Features() {
  return (
    <div className="container py-5">
      <div
        className="text-center mb-5"
        style={{ animation: 'fadeInUp 0.6s cubic-bezier(0.22, 1, 0.36, 1) both' }}
      >
        <span className="badge bg-primary bg-opacity-10 text-primary rounded-pill px-3 py-2 mb-3 fw-semibold">
          ✦ Features
        </span>
        <h1 className="display-4 fw-black text-dark mb-3">
          Everything you need to <span className="text-primary">own your links</span>
        </h1>
        <p className="lead text-secondary mx-auto" style={{ maxWidth: '600px' }}>
          From shortening to analytics, 4H's Shortener gives you full control over every link you share.
        </p>
      </div>

      <div className="row g-4">
        {features.map((f, i) => (
          <div
            key={i}
            className="col-md-6 col-lg-3"
            style={{
              animation: `fadeInUp 0.5s ${0.1 + i * 0.07}s cubic-bezier(0.22, 1, 0.36, 1) both`,
            }}
          >
            <div
              className="card border-0 shadow-sm rounded-4 h-100"
              style={{
                transition: 'transform 0.3s cubic-bezier(0.22, 1, 0.36, 1), box-shadow 0.3s ease',
                cursor: 'default',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = 'translateY(-6px)';
                e.currentTarget.style.boxShadow = '0 12px 40px rgba(0,0,0,0.1)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = '';
                e.currentTarget.style.boxShadow = '';
              }}
            >
              <div className="card-body p-4">
                <div
                  className="d-inline-flex align-items-center justify-content-center rounded-3 mb-3"
                  style={{
                    width: '48px',
                    height: '48px',
                    backgroundColor: `${f.color}15`,
                    color: f.color,
                    fontSize: '1.3rem',
                  }}
                >
                  <i className={f.icon}></i>
                </div>
                <h5 className="fw-bold text-dark mb-2">{f.title}</h5>
                <p className="text-muted small mb-0" style={{ lineHeight: '1.6' }}>
                  {f.desc}
                </p>
              </div>
            </div>
          </div>
        ))}
      </div>

      <div
        className="text-center mt-5 pt-4"
        style={{ animation: 'fadeInUp 0.6s 0.7s cubic-bezier(0.22, 1, 0.36, 1) both' }}
      >
        <div className="row g-3 justify-content-center mb-5">
          <div className="col-6 col-md-3">
            <div className="p-3">
              <div className="display-5 fw-black text-primary">10K+</div>
              <div className="text-muted small">Active Users</div>
            </div>
          </div>
          <div className="col-6 col-md-3">
            <div className="p-3">
              <div className="display-5 fw-black text-success">1M+</div>
              <div className="text-muted small">Links Created</div>
            </div>
          </div>
          <div className="col-6 col-md-3">
            <div className="p-3">
              <div className="display-5 fw-black text-warning">99.9%</div>
              <div className="text-muted small">Uptime</div>
            </div>
          </div>
          <div className="col-6 col-md-3">
            <div className="p-3">
              <div className="display-5 fw-black text-info">&lt;10ms</div>
              <div className="text-muted small">Redirect Speed</div>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-4 shadow-sm p-5" style={{ maxWidth: '600px', margin: '0 auto' }}>
          <h3 className="fw-bold text-dark mb-3">Ready to get started?</h3>
          <p className="text-muted mb-4">Create your first shortened link in seconds. No credit card required.</p>
          <Link to="/signup" className="btn btn-primary btn-lg px-5 rounded-pill fw-bold btn-animated">
            Get Started for Free
          </Link>
        </div>
      </div>
    </div>
  );
}
