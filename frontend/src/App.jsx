import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './context/AuthContext';
import ProtectedRoute from './hooks/ProtectedRoute';
import Navbar from './components/Navbar';
import Hero from './components/Hero';
import ShortenForm from './components/ShortenForm';
import LoginForm from './components/LoginForm';
import SignupForm from './components/SignupForm';
import Footer from './components/Footer';
import QrForm from './components/QrForm';
import Dashboard from './pages/Dashboard';
import Stats from './pages/Stats';

function App() {
  const { loading } = useAuth();

  if (loading) {
    return (
      <div className="d-flex flex-column min-vh-100 bg-light">
        <div className="d-flex justify-content-center align-items-center flex-grow-1">
          <div className="spinner-border text-primary" role="status">
            <span className="visually-hidden">Loading...</span>
          </div>
        </div>
      </div>
    );
  }

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

            <Route
              path="/dashboard"
              element={
                <ProtectedRoute>
                  <Dashboard />
                </ProtectedRoute>
              }
            />
            <Route
              path="/stats/:shortCode"
              element={
                <ProtectedRoute>
                  <Stats />
                </ProtectedRoute>
              }
            />

            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </div>
      </main>

      <Footer />
    </div>
  );
}

export default App;