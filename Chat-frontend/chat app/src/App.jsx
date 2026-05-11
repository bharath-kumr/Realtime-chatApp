import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Register from './components/Register.jsx';
import Login from './components/Login.jsx';
import Chat from './components/Chat.jsx';

// ✅ Protected Route - redirects to login if no token
const ProtectedRoute = ({ children }) => {
  const token = localStorage.getItem('token');
  if (!token) {
    return <Navigate to="/login" />;
  }
  return children;
};

function App() {
  return (
    <Router>
      <Routes>
        {/* ✅ Home goes to login */}
        <Route path="/" element={<Navigate to="/login" />} />

        {/* ✅ Login - if already logged in go to chat */}
        <Route path="/login" element={
          <PublicRoute>
            <Login />
          </PublicRoute>
        } />

        {/* ✅ Register - if already logged in go to chat */}
        <Route path="/register" element={
          <PublicRoute>
            <Register />
          </PublicRoute>
        } />

        {/* ✅ Chat - protected, must be logged in */}
        <Route path="/chat" element={
          <ProtectedRoute>
            <Chat />
          </ProtectedRoute>
        } />
      </Routes>
    </Router>
  );
}

export default App;