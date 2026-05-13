import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function Navbar() {
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleLogout = async () => {
    await logout();
    navigate('/');
  };

  return (
    <nav
      className={`navbar navbar-expand-lg navbar-light bg-white py-3 shadow-sm`}
      style={{
        position: 'sticky',
        top: 0,
        zIndex: 1000,
        transition: 'all 0.3s cubic-bezier(0.22, 1, 0.36, 1)',
        borderBottom: scrolled ? '1px solid rgba(0,123,255,0.1)' : '1px solid transparent',
        backdropFilter: scrolled ? 'blur(10px)' : 'none',
        backgroundColor: scrolled ? 'rgba(255,255,255,0.95)' : 'white',
        animation: 'navbarSlideDown 0.5s cubic-bezier(0.22, 1, 0.36, 1) forwards',
      }}
    >
      <div className="container">
        <Link
          to="/"
          className="navbar-brand fw-bold text-primary fs-3"
          style={{
            letterSpacing: '-1px',
            transition: 'transform 0.3s cubic-bezier(0.22, 1, 0.36, 1)',
          }}
          onMouseEnter={(e) => (e.currentTarget.style.transform = 'scale(1.05)')}
          onMouseLeave={(e) => (e.currentTarget.style.transform = 'scale(1)')}
        >
          4H's
        </Link>

        <button
          className="navbar-toggler border-0"
          type="button"
          data-bs-toggle="collapse"
          data-bs-target="#navbarNav"
          onClick={() => setMenuOpen(!menuOpen)}
          style={{
            transition: 'transform 0.3s ease',
            transform: menuOpen ? 'rotate(90deg)' : 'rotate(0deg)',
          }}
        >
          <span className="navbar-toggler-icon"></span>
        </button>

        <div className="collapse navbar-collapse" id="navbarNav">
          <ul className="navbar-nav mx-auto">
            <li className="nav-item">
              <button
                onClick={() => navigate('/')}
                className="nav-link btn btn-link fw-semibold text-dark border-0"
                style={{ cursor: 'pointer', transition: 'color 0.3s ease' }}
                onMouseEnter={(e) => (e.currentTarget.style.color = '#0d6efd')}
                onMouseLeave={(e) => (e.currentTarget.style.color = '')}
              >
                Home
              </button>
            </li>
            <li className="nav-item">
              <button
                onClick={() => navigate('/features')}
                className="nav-link btn btn-link fw-semibold text-dark border-0"
                style={{ cursor: 'pointer', transition: 'color 0.3s ease' }}
                onMouseEnter={(e) => (e.currentTarget.style.color = '#0d6efd')}
                onMouseLeave={(e) => (e.currentTarget.style.color = '')}
              >
                Features
              </button>
            </li>
            <li className="nav-item">
              <button
                onClick={() => navigate('/contact')}
                className="nav-link btn btn-link fw-semibold text-dark border-0"
                style={{ cursor: 'pointer', transition: 'color 0.3s ease' }}
                onMouseEnter={(e) => (e.currentTarget.style.color = '#0d6efd')}
                onMouseLeave={(e) => (e.currentTarget.style.color = '')}
              >
                Contact us
              </button>
            </li>
            {user && (
              <>
                <li className="nav-item" style={{ animation: 'fadeInUp 0.3s cubic-bezier(0.22, 1, 0.36, 1) both' }}>
                  <button
                    onClick={() => navigate('/dashboard')}
                    className="nav-link btn btn-link fw-semibold text-dark border-0"
                    style={{ cursor: 'pointer', transition: 'color 0.3s ease' }}
                    onMouseEnter={(e) => (e.currentTarget.style.color = '#0d6efd')}
                    onMouseLeave={(e) => (e.currentTarget.style.color = '')}
                  >
                    Dashboard
                  </button>
                </li>
              </>
            )}
          </ul>
          <div className="d-flex align-items-center gap-3">
            {user ? (
              <>
                <span
                  className="text-muted small d-flex align-items-center gap-2"
                  style={{
                    animation: 'fadeInUp 0.3s cubic-bezier(0.22, 1, 0.36, 1) both',
                    transition: 'color 0.3s ease',
                  }}
                >
                  <i className="bi bi-person-circle me-1"></i>
                  {user.email}
                </span>
                <button
                  onClick={handleLogout}
                  className="btn btn-outline-secondary btn-sm rounded-pill fw-bold btn-animated"
                  style={{
                    cursor: 'pointer',
                    transition: 'all 0.3s cubic-bezier(0.22, 1, 0.36, 1)',
                  }}
                >
                  Log out
                </button>
              </>
            ) : (
              <>
                <button
                  onClick={() => navigate('/login')}
                  className="btn btn-link text-decoration-none text-dark fw-bold border-0"
                  style={{
                    cursor: 'pointer',
                    transition: 'color 0.3s ease',
                  }}
                  onMouseEnter={(e) => (e.currentTarget.style.color = '#0d6efd')}
                  onMouseLeave={(e) => (e.currentTarget.style.color = '')}
                >
                  Log in
                </button>
                <button
                  onClick={() => navigate('/signup')}
                  className="btn btn-primary px-4 rounded-pill fw-bold shadow-sm btn-animated"
                  style={{ cursor: 'pointer' }}
                >
                  Sign up free
                </button>
              </>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}
