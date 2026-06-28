import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';
import DashboardLayout from './layouts/DashboardLayout';

// Pages
import LandingPage from './pages/LandingPage';
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import WebsiteTraining from './pages/WebsiteTraining';
import WebsiteManagement from './pages/WebsiteManagement';
import ChatInterface from './pages/ChatInterface';
import Analytics from './pages/Analytics';
import Profile from './pages/Profile';
import DocumentationCenter from './pages/DocumentationCenter';
import DocumentationPreview from './pages/DocumentationPreview';

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Routes>
          {/* Public Routes */}
          <Route path="/" element={<LandingPage />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />

          {/* Protected Console Dashboard Routes */}
          <Route
            element={
              <ProtectedRoute>
                <DashboardLayout />
              </ProtectedRoute>
            }
          >
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/train" element={<WebsiteTraining />} />
            <Route path="/websites" element={<WebsiteManagement />} />
            <Route path="/chat" element={<ChatInterface />} />
            <Route path="/documentation" element={<DocumentationCenter />} />
            <Route path="/documentation/:websiteId" element={<DocumentationPreview />} />
            <Route path="/analytics" element={<Analytics />} />
            <Route path="/profile" element={<Profile />} />
          </Route>

          {/* Catch All redirect */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;
