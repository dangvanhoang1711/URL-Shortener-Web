import { Link } from 'react-router-dom';

export default function SignupForm() {
  return (
    <div className="row justify-content-center w-100 m-0">
      <div className="col-md-5 col-lg-4">
        <div className="card border-0 shadow-lg rounded-4 p-4 p-sm-5">
          <div className="card-body">
            <div className="text-center mb-4">
              <h2 className="fw-black text-dark">Create Account</h2>
              <p className="text-muted small">Sign up to start shortening URLs</p>
            </div>

            <form>
              <div className="mb-3">
                <label className="form-label small fw-bold text-secondary">Full Name</label>
                <input
                  type="text"
                  className="form-control form-control-lg border-2 bg-light shadow-none"
                  placeholder="John Doe"
                  style={{ borderRadius: '10px', fontSize: '1rem' }}
                />
              </div>

              <div className="mb-3">
                <label className="form-label small fw-bold text-secondary">Email address</label>
                <input
                  type="email"
                  className="form-control form-control-lg border-2 bg-light shadow-none"
                  placeholder="alex@example.com"
                  style={{ borderRadius: '10px', fontSize: '1rem' }}
                />
              </div>

              <div className="mb-3">
                <label className="form-label small fw-bold text-secondary">Password</label>
                <input
                  type="password"
                  className="form-control form-control-lg border-2 bg-light shadow-none"
                  placeholder="••••••••"
                  style={{ borderRadius: '10px', fontSize: '1rem' }}
                />
              </div>

              <div className="mb-4">
                <label className="form-label small fw-bold text-secondary">Confirm Password</label>
                <input
                  type="password"
                  className="form-control form-control-lg border-2 bg-light shadow-none"
                  placeholder="••••••••"
                  style={{ borderRadius: '10px', fontSize: '1rem' }}
                />
              </div>

              <button
                type="submit"
                className="btn btn-primary btn-lg w-100 fw-bold shadow-sm mb-3"
                style={{ borderRadius: '10px' }}
              >
                Create Account
              </button>
            </form>

            <div className="text-center">
              <p className="small text-muted">
                Already have an account? <Link to="/login" className="text-primary fw-bold text-decoration-none">Log in</Link>
              </p>
              <Link to="/" className="text-decoration-none small text-secondary fw-semibold">
                ← Back to Homepage
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
