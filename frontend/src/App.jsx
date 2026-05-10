import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './context/AuthContext'; // Import hook check login
import Navbar from './components/Navbar';
import Hero from './components/Hero';
import ShortenForm from './components/ShortenForm';
import LoginForm from './components/LoginForm';
import SignupForm from './components/SignupForm';
import Footer from './components/Footer';
import QrForm from './components/QrForm';

function App() {
  const { user } = useAuth(); // Lấy thông tin user hiện tại

  return (
    <div className="d-flex flex-column min-vh-100 bg-light">
      <Navbar />

      <main className="flex-grow-1 d-flex align-items-center py-5">
        <div className="container">
          <Routes>
            <Route path="/" element={<Hero />} />
            <Route path="/qr-generator" element={<QrForm />} />
            <Route path="/login" element={<LoginForm />} />
            <Route path="/signup" element={<SignupForm />} />

            {/* Thêm Route dự phòng: Nếu gõ bừa URL thì quay về Home */}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </div>
      </main>

      <Footer />
    </div>
  );
}

export default App;