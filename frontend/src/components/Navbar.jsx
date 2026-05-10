import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function Navbar() {
  const navigate = useNavigate();
  const { user, logout } = useAuth();

  const handleLogout = async () => {
    await logout();
    navigate('/');
  };

  return (
    <nav className="navbar navbar-expand-lg navbar-light bg-white py-3 shadow-sm">
      <div className="container">
        <Link to="/" className="navbar-brand fw-bold text-primary fs-3" style={{ letterSpacing: '-1px' }}>
          4H's
        </Link>

        <button className="navbar-toggler" type="button" data-bs-toggle="collapse" data-bs-target="#navbarNav">
          <span className="navbar-toggler-icon"></span>
        </button>

        <div className="collapse navbar-collapse" id="navbarNav">
          <ul className="navbar-nav mx-auto">
            <li className="nav-item">
              <button
                onClick={() => navigate('/')}
                className="nav-link btn btn-link fw-semibold text-dark border-0"
                style={{ cursor: 'pointer' }}
              >
                Home
              </button>
            </li>
            {user && (
              <>
                <li className="nav-item">
                  <button
                    onClick={() => navigate('/dashboard')}
                    className="nav-link btn btn-link fw-semibold text-dark border-0"
                    style={{ cursor: 'pointer' }}
                  >
                    Dashboard
                  </button>
                </li>
                <li className="nav-item">
                  <button
                    onClick={() => navigate('/qr-generator')}
                    className="nav-link btn btn-link fw-semibold text-dark border-0"
                    style={{ cursor: 'pointer' }}
                  >
                    QR Generator
                  </button>
                </li>
              </>
            )}
          </ul>
          <div className="d-flex align-items-center gap-3">
            {user ? (
              <>
                <span className="text-muted small">
                  <i className="bi bi-person-circle me-1"></i>
                  {user.email}
                </span>
                <button
                  onClick={handleLogout}
                  className="btn btn-outline-secondary btn-sm rounded-pill fw-bold"
                  style={{ cursor: 'pointer' }}
                >
                  Log out
                </button>
              </>
            ) : (
              <>
                <button
                  onClick={() => navigate('/login')}
                  className="btn btn-link text-decoration-none text-dark fw-bold border-0"
                  style={{ cursor: 'pointer' }}
                >
                  Log in
                </button>
                <button
                  onClick={() => navigate('/signup')}
                  className="btn btn-primary px-4 rounded-pill fw-bold shadow-sm"
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