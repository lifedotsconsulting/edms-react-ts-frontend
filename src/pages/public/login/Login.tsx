import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { setStorageItem } from '../../../utils/localStorageService';
import './Login.css';

const Login: React.FC = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const navigate = useNavigate();

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    // Dummy authentication
    if (username && password) {
      setStorageItem('auth_token', 'dummy-token');
      navigate('/home');
    }
  };

  return (
    <div className="login-container">
      <div className="login-card">
        <div className="login-header">
          <h1 className="login-title">Resonac</h1>
          <p className="login-subtitle">Drawing Search Platform</p>
        </div>
        
        <form onSubmit={handleLogin} className="login-form">
          <div className="form-group">
            <label htmlFor="username">Username</label>
            <input 
              id="username"
              type="text" 
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="Enter your username"
              required
            />
          </div>
          
          <div className="form-group">
            <label htmlFor="password">Password</label>
            <input 
              id="password"
              type="password" 
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Enter your password"
              required
            />
          </div>
          
          <button type="submit" className="btn btn-primary w-full login-btn">
            Sign In
          </button>
        </form>
      </div>
    </div>
  );
};

export default Login;
