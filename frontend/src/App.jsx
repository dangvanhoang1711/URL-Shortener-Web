import { Routes, Route, Navigate, useParams } from 'react-router-dom';
import { useAuth } from './context/AuthContext';
import { useEffect } from 'react';
import ProtectedRoute from './hooks/ProtectedRoute';
import Navbar from './components/Navbar';
import Hero from './components/Hero';
import LoginForm from './components/LoginForm';
import SignupForm from './components/SignupForm';
import Footer from './components/Footer';
import Dashboard from './pages/Dashboard';
import Stats from './pages/Stats';
import Features from './pages/Features';
import Privacy from './pages/Privacy';
import Terms from './pages/Terms';
import Contact from './pages/Contact';
import ForgotPassword from './pages/ForgotPassword';
import VerifyPin from './pages/VerifyPin';
import ResetPassword from './pages/ResetPassword';

function RedirectHandler() {
  const { shortCode } = useParams();
  useEffect(() => {
    if (shortCode) {
      window.location.replace(`/api/urls/${shortCode}`);
    }
  }, [shortCode]);
  return null;
}

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
            <Route path="/features" element={<Features />} />
            <Route path="/privacy" element={<Privacy />} />
            <Route path="/terms" element={<Terms />} />
            <Route path="/contact" element={<Contact />} />
            <Route path="/login" element={<LoginForm />} />
            <Route path="/signup" element={<SignupForm />} />
            <Route path="/forgot-password" element={<ForgotPassword />} />
            <Route path="/verify-pin" element={<VerifyPin />} />
            <Route path="/reset-password" element={<ResetPassword />} />

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

            <Route path="/:shortCode" element={<RedirectHandler />} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </div>
      </main>

      <Footer />
    </div>
  );
}

export default App;