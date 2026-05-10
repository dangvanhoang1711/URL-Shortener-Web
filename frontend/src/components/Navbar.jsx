import { Link, useNavigate } from 'react-router-dom';

export default function Navbar() {
    const navigate = useNavigate();

    return (
        <nav className="navbar navbar-expand-lg navbar-light bg-white py-3 shadow-sm">
            <div className="container">
                <Link to="/" className="navbar-brand fw-bold text-primary fs-3" style={{ letterSpacing: '-1px' }}>
                    4H's
                </Link>

                <div className="collapse navbar-collapse">
                    <ul className="navbar-nav mx-auto">
                        <li className="nav-item">
                            <button
                                onClick={() => navigate('/shorten')}
                                className="nav-link btn btn-link fw-semibold text-dark border-0"
                                style={{ cursor: 'pointer' }}
                            >
                                URL Shortener
                            </button>
                        </li>
                        <li className="nav-item">
                            <button
                                onClick={() => navigate('/qr-generator')}
                                className="nav-link btn btn-link fw-semibold text-dark border-0"
                                style={{ cursor: 'pointer' }}
                            >
                                QR Codes
                            </button>
                        </li>
                        <li className="nav-item"><a className="nav-link fw-semibold" href="#">Analytics</a></li>
                    </ul>
                    <div className="d-flex align-items-center gap-3">
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
                    </div>
                </div>
            </div>
        </nav>
    );
}