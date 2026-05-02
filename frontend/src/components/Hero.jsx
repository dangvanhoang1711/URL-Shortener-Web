import { Link } from 'react-router-dom';

export default function Hero() {
  return (
    <div className="row align-items-center g-5">
      {/* Cột bên trái: Nội dung chữ */}
      <div className="col-lg-6 text-center text-lg-start">
        <h1 className="display-3 fw-black text-dark mb-4" style={{ lineHeight: '1.1' }}>
          Connections that <span className="text-primary">start with a click.</span>
        </h1>
        <p className="lead text-secondary mb-5">
          Transform your long, messy links into powerful short URLs that are easy to share, manage, and track.
        </p>
        
        <div className="d-flex gap-3 justify-content-center justify-content-lg-start">
          {/* Dùng Link to="/shorten" để chuyển trang mượt mà */}
          <Link 
            to="/shorten" 
            className="btn btn-primary btn-lg px-5 py-3 rounded-pill fw-bold shadow-sm"
          >
            Get Started for Free
          </Link>
          
          <button className="btn btn-outline-dark btn-lg px-5 py-3 rounded-pill fw-bold">
            Learn More
          </button>
        </div>

        <div className="mt-5 d-flex align-items-center gap-4 justify-content-center justify-content-lg-start text-muted">
          <div><span className="fw-bold text-dark">10K+</span> Users</div>
          <div className="vr"></div>
          <div><span className="fw-bold text-dark">1M+</span> Links created</div>
        </div>
      </div>
      
      {/* Cột bên phải: Hình ảnh minh họa hoặc Box trang trí */}
      <div className="col-lg-6 d-none d-lg-block text-center">
        <div className="position-relative">
          {/* Một cái hộp trắng đổ bóng nhìn cho sang trọng */}
          <div className="bg-white p-5 shadow-lg rounded-5 transform-hover transition">
             <div className="display-1 text-primary mb-4">🔗</div>
             <h3 className="fw-bold mb-3">4H's Shortener</h3>
             <p className="text-muted">Create. Share. Track.</p>
             
             {/* Giả lập một cái link đã rút gọn */}
             <div className="bg-light p-3 rounded-3 border border-dashed border-primary">
                <code className="text-primary fw-bold">4hs.link/my-awesome-url</code>
             </div>
          </div>
          
          {/* Trang trí thêm một cái bóng mờ phía sau */}
          <div 
            className="position-absolute top-50 start-50 translate-middle bg-primary opacity-10 rounded-circle" 
            style={{ width: '400px', height: '400px', zIndex: -1, filter: 'blur(50px)' }}
          ></div>
        </div>
      </div>
    </div>
  );
}