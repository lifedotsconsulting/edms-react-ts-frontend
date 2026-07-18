import React from 'react';
import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import { useTheme } from '../../context/ThemeContext';
import { Moon, Sun, User, LogOut } from 'lucide-react';
import { removeStorageItem } from '../../utils/localStorageService';
import './MainLayout.css';

const MainLayout: React.FC = () => {
  const { theme, toggleTheme } = useTheme();
  const navigate = useNavigate();

  const handleLogout = () => {
    removeStorageItem('auth_token');
    navigate('/login');
  };

  return (
    <div className="layout-container">
      <header className="title-bar">
        <div className="title-bar-left">
          <div className="logo">Resonac</div>
          <span className="app-title">Drawing Search</span>
        </div>

        <nav className="tabs">
          <NavLink to="/home" className={({ isActive }) => isActive ? 'tab active' : 'tab'}>
            Home
          </NavLink>
          <NavLink to="/files" className={({ isActive }) => isActive ? 'tab active' : 'tab'}>
            Files
          </NavLink>
          <NavLink to="/access-control" className={({ isActive }) => isActive ? 'tab active' : 'tab'}>
            Access Control
          </NavLink>
        </nav>

        <div className="title-bar-right">
          <button className="btn-icon" onClick={toggleTheme} title="Toggle Theme">
            {theme === 'light' ? <Moon size={20} /> : <Sun size={20} />}
          </button>
          <button className="btn-icon" onClick={() => navigate('/profile')} title="Profile">
            <User size={20} />
          </button>
          <button className="btn-icon" onClick={handleLogout} title="Logout">
            <LogOut size={20} />
          </button>
        </div>
      </header>

      <main className="main-content">
        <Outlet />
      </main>
    </div>
  );
};

export default MainLayout;
