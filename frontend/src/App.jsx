import { Routes, Route } from 'react-router-dom';
import Navbar from './components/Navbar';
import Hero from './components/Hero';
import ShortenForm from './components/ShortenForm';
import LoginForm from './components/LoginForm';
import Footer from './components/Footer';

function App() {
  return (
    <div className="d-flex flex-column min-vh-100 bg-light">
      <Navbar />

      <main className="flex-grow-1 d-flex align-items-center py-5">
        <div className="container">
          <Routes>
            {/* PHẢI CÓ: Trang chủ (Home) */}
            <Route path="/" element={<Hero />} />
            
            {/* Trang rút gọn link */}
            <Route path="/shorten" element={<ShortenForm />} />
            
            {/* Trang đăng nhập */}
            <Route path="/login" element={<LoginForm />} />
          </Routes>
        </div>
      </main>

      <Footer />
    </div>
  );
}

export default App;