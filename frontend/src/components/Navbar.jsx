import { Link } from 'react-router-dom';

export default function Navbar() {
    return (
        <nav className="navbar navbar-expand-lg navbar-light bg-white py-3 shadow-sm">
            <div className="container">
                <a className="navbar-brand fw-bold text-primary fs-3" href="#" style={{ letterSpacing: '-1px' }}>
                    4H's
                </a>

                <div className="collapse navbar-collapse">
                    <ul className="navbar-nav mx-auto">
                        <li className="nav-item">
                            <button className="nav-link btn btn-link fw-semibold text-dark">
                                URL Shortener
                            </button>
                        </li>
                        <li className="nav-item"><a className="nav-link fw-semibold" href="#">QR Codes</a></li>
                        <li className="nav-item"><a className="nav-link fw-semibold" href="#">Analytics</a></li>
                    </ul>
                    <div className="d-flex align-items-center gap-3">
                        <button className="btn btn-link text-decoration-none text-dark fw-bold">Log in</button>
                        <button className="btn btn-primary px-4 rounded-pill fw-bold shadow-sm">Sign up free</button>
                    </div>
                </div>
            </div>
        </nav>
    );
}