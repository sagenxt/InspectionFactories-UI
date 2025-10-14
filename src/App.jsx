import React, { useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Dashboard from './components/Dashboard';
import LoginForm from './components/LoginForm';
import MainContent from './components/MainContent';
import NewInspection from './components/NewInspection';
import ReviewScreen from './components/ReviewScreen';
import Applications from './components/Applications';
import CompletedInspections from './components/CompletedInspections';
import { ToastProvider } from './contexts/ToastContext';

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [user, setUser] = useState(null);

  // Check for existing login data on app load
  useEffect(() => {
    const storedUser = localStorage.getItem('user');
    const storedToken = localStorage.getItem('token');

    if (storedUser && storedToken) {
      try {
        const userData = JSON.parse(storedUser);
        setUser(userData);
        setIsAuthenticated(true);
      } catch {
        // Clear invalid data
        localStorage.removeItem('user');
        localStorage.removeItem('token');
      }
    }
  }, []);

  const handleLogin = (loginResponse) => {
    // Store user data and token in localStorage
    localStorage.setItem('user', JSON.stringify(loginResponse.user));
    localStorage.setItem('token', loginResponse.token);

    setUser(loginResponse.user);
    setIsAuthenticated(true);
  };

  const handleLogout = () => {
    // Clear localStorage
    localStorage.removeItem('user');
    localStorage.removeItem('token');

    setUser(null);
    setIsAuthenticated(false);
  };

  return (
    <ToastProvider>
      <BrowserRouter>
        <div className="App">
          {isAuthenticated ? (
            <Routes>
              <Route path="/" element={<Dashboard onLogout={handleLogout} user={user} />}>
                <Route index element={<MainContent />} />
                <Route path="dashboard" element={<MainContent />} />
                <Route path="applications" element={<Applications />} />
                <Route path="completed-inspections" element={<CompletedInspections />} />
                <Route path="inspection/:reportId" element={<NewInspection />} />
                <Route path="inspection/:reportId/review" element={<ReviewScreen />} />
                <Route path="*" element={<Navigate to="/" replace />} />
              </Route>
            </Routes>
          ) : (
            <LoginForm onLogin={handleLogin} />
          )}
        </div>
      </BrowserRouter>
    </ToastProvider>
  );
}

export default App;