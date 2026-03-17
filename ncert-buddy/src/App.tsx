/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './context/AuthContext.jsx';
import LandingPage from './pages/LandingPage';
import LoginPage from './pages/LoginPage';
import SignupPage from './pages/SignupPage';
import ForgotPasswordPage from './pages/ForgotPasswordPage';
import DashboardPage from './pages/DashboardPage';
import QuizPage from './pages/QuizPage';
import PapersPage from './pages/PapersPage';
import SettingsPage from './pages/SettingsPage';
import TutorialsPage from './pages/TutorialsPage';

// Protected route — redirects to login if not authenticated
function ProtectedRoute({ children }) {
  const { isAuthenticated, loading } = useAuth();
  
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-primary-bg">
        <div className="flex flex-col items-center gap-4">
          <div className="w-10 h-10 border-4 border-teal-primary border-t-transparent rounded-full animate-spin" />
          <p className="text-body-text font-sans font-medium">Loading...</p>
        </div>
      </div>
    );
  }
  
  if (!isAuthenticated) {
    return <Navigate to="/login" />;
  }
  
  return children;
}

// Public route — redirects to dashboard if already authenticated
function PublicRoute({ children }) {
  const { isAuthenticated, loading } = useAuth();
  
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-primary-bg">
        <div className="flex flex-col items-center gap-4">
          <div className="w-10 h-10 border-4 border-teal-primary border-t-transparent rounded-full animate-spin" />
          <p className="text-body-text font-sans font-medium">Loading...</p>
        </div>
      </div>
    );
  }
  
  if (isAuthenticated) {
    return <Navigate to="/dashboard" />;
  }
  
  return children;
}

export default function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/login" element={
          <PublicRoute><LoginPage /></PublicRoute>
        } />
        <Route path="/signup" element={
          <PublicRoute><SignupPage /></PublicRoute>
        } />
        <Route path="/forgot-password" element={<ForgotPasswordPage />} />
        <Route path="/tutorials" element={<TutorialsPage />} />
        <Route path="/dashboard" element={
          <ProtectedRoute><DashboardPage /></ProtectedRoute>
        } />
        <Route path="/quiz" element={
          <ProtectedRoute><QuizPage /></ProtectedRoute>
        } />
        <Route path="/papers" element={
          <ProtectedRoute><PapersPage /></ProtectedRoute>
        } />
        <Route path="/settings" element={
          <ProtectedRoute><SettingsPage /></ProtectedRoute>
        } />
      </Routes>
    </Router>
  );
}
