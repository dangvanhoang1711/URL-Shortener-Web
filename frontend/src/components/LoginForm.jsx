import { Link } from 'react-router-dom';

export default function LoginForm() {
  return (
    <div className="row justify-content-center w-100 m-0">
      <div className="col-md-5 col-lg-4">
        {/* Card đăng nhập */}
        <div className="card border-0 shadow-lg rounded-4 p-4 p-sm-5">
          <div className="card-body">
            {/* Tiêu đề */}
            <div className="text-center mb-4">
              <h2 className="fw-black text-dark">Welcome Back</h2>
              <p className="text-muted small">Enter your details to access your account</p>
            </div>
            
            <form>
              {/* Email */}
              <div className="mb-3">
                <label className="form-label small fw-bold text-secondary">Email address</label>
                <input 
                  type="email" 
                  className="form-control form-control-lg border-2 bg-light shadow-none" 
                  placeholder="alex@example.com"
                  style={{ borderRadius: '10px', fontSize: '1rem' }}
                />
              </div>
              
              {/* Password */}
              <div className="mb-2">
                <label className="form-label small fw-bold text-secondary">Password</label>
                <input 
                  type="password" 
                  className="form-control form-control-lg border-2 bg-light shadow-none" 
                  placeholder="••••••••"
                  style={{ borderRadius: '10px', fontSize: '1rem' }}
                />
              </div>

              {/* Forgot Password */}
              <div className="text-end mb-4">
                <a href="#" className="text-primary small text-decoration-none fw-semibold">Forgot password?</a>
              </div>

              {/* Login Button */}
              <button 
                type="submit" 
                className="btn btn-primary btn-lg w-100 fw-bold shadow-sm mb-3"
                style={{ borderRadius: '10px' }}
              >
                Sign in
              </button>

              {/* Divider */}
              <div className="position-relative my-4">
                <hr className="text-muted" />
                <span className="position-absolute top-50 start-50 translate-middle bg-white px-3 text-muted small">
                  or
                </span>
              </div>

              {/* Google Login (Optional - cho đẹp giao diện) */}
              <button 
                type="button" 
                className="btn btn-outline-dark w-100 fw-semibold d-flex align-items-center justify-content-center gap-2 mb-4"
                style={{ borderRadius: '10px' }}
              >
                <img src="https://docs.idfy.com/img/google-logo.png" alt="Google" width="18" />
                Sign in with Google
              </button>
            </form>

            {/* Link quay lại trang chủ */}
            <div className="text-center">
              <p className="small text-muted">
                Don't have an account? <a href="#" className="text-primary fw-bold text-decoration-none">Sign up</a>
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