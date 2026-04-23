export default function Footer() {
  return (
    <footer className="bg-white border-top py-4 mt-auto">
      <div className="container">
        <div className="row align-items-center">
          
          {/* Bên trái: Tên thương hiệu và bản quyền */}
          <div className="col-md-6 text-center text-md-start">
            <span className="fw-bold text-primary">4H's Shortener</span>
            <span className="text-muted ms-2">© 2026</span>
          </div>

          {/* Bên phải: Các liên kết nhanh */}
          <div className="col-md-6 text-center text-md-end mt-2 mt-md-0">
            <a href="#" className="text-muted text-decoration-none me-3 small">Privacy</a>
            <a href="#" className="text-muted text-decoration-none me-3 small">Terms</a>
            <a href="#" className="text-muted text-decoration-none small">Contact</a>
          </div>

        </div>
      </div>
    </footer>
  );
}