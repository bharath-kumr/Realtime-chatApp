import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import axios from 'axios';
import './Login.css';

const BASE_URL = "https://chatapp-2o81.onrender.com";

function Login() {
  const navigate = useNavigate();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const response = await axios.post(
        `${BASE_URL}/api/login/`,
        { username, password },
        { timeout: 60000 }
      );

      localStorage.setItem('token', response.data.access);
      localStorage.setItem('refresh', response.data.refresh);
      localStorage.setItem('username', username);

      navigate('/chat');

    } catch (error) {
      console.error(error);
      if (error.response) {
        const data = error.response.data;
        if (data.error) {
          setError(data.error);
        } else if (data.detail) {
          setError(data.detail);
        } else {
          setError(JSON.stringify(data));
        }
      } else {
        setError('Server not reachable. Please wait 30 seconds and try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-container">
      <h2>Login</h2>

      {error && (
        <div style={{
          background: '#ffe0e0',
          color: '#cc0000',
          border: '1px solid #cc0000',
          borderRadius: '8px',
          padding: '10px',
          marginBottom: '12px',
          fontSize: '14px'
        }}>
          ⚠️ {error}
        </div>
      )}

      <form onSubmit={handleLogin}>
        <input
          type="text"
          placeholder="Username"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          disabled={loading}
          required
        />
        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          disabled={loading}
          required
        />
        <button type="submit" disabled={loading}>
          {loading ? '⏳ Logging in...' : 'Login'}
        </button>
      </form>

      <p>Don't have an account? <Link to="/register">Register</Link></p>
    </div>
  );
}

export default Login;