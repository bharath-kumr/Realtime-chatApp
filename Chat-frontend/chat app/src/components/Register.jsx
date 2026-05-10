import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import axios from 'axios';
import './Register.css';

const BASE_URL = "https://chatapp-2o81.onrender.com";

function Register() {
  const navigate = useNavigate();
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleRegister = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const response = await axios.post(`${BASE_URL}/api/register/`, {
        username,
        email,
        password
      });

      if (response.status === 201) {
        alert('Registration successful! Please login.');
        navigate('/login');
      }

    } catch (error) {
      console.error(error);
      if (error.response) {
        // ✅ This shows EXACT error from Django
        const data = error.response.data;
        if (data.username) setError(`Username: ${data.username[0]}`);
        else if (data.email) setError(`Email: ${data.email[0]}`);
        else if (data.password) setError(`Password: ${data.password[0]}`);
        else setError(JSON.stringify(data));
      } else {
        setError('Server not reachable. Please wait 30 seconds (Render cold start) and try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="register-container">
      <h2>Register</h2>

      {/* ✅ Shows exact error on screen */}
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

      <form onSubmit={handleRegister}>
        <input
          type="text"
          placeholder="Username"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          disabled={loading}
          required
        />
        <input
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          disabled={loading}
          required
        />
        <input
          type="password"
          placeholder="Password (min 8 characters)"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          disabled={loading}
          required
        />
        <button type="submit" disabled={loading}>
          {loading ? '⏳ Registering...' : 'Register'}
        </button>
      </form>
      <p>Already have an account? <Link to="/login">Login</Link></p>
    </div>
  );
}

export default Register;