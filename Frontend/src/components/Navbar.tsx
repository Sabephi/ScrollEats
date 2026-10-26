import React, { useState, useEffect } from 'react';
import { NavLink, Link, useLocation, useNavigate } from 'react-router-dom';
import { Search, Plus, LogIn, LogOut } from 'lucide-react';
import logoImg from '../assets/logo.svg';
import logotypImg from '../assets/logotyp.svg';

export const Navbar: React.FC = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    setIsAuthenticated(Boolean(localStorage.getItem('access_token')));
  }, [location]);

  const handleLogout = () => {
    localStorage.removeItem('access_token');
    localStorage.removeItem('refresh_token');
    setIsAuthenticated(false);
    navigate('/');
  };

  return (
    <header className="navbar-container">
      <div className="navbar">
        <div className="navbar-left">
          <Link to="/" className="logo">
            <img src={logotypImg} alt="ScrollEats Logo" className="logotyp-img" />
            <img src={logoImg} alt="ScrollEats Icon" className="logo-img" />
          </Link>

          <nav className="nav-links">
            <NavLink to="/" className="nav-item" end>
              Discover
            </NavLink>
            <NavLink to="/collections" className="nav-item">
              Collections
            </NavLink>
            <NavLink to="/meal-plan" className="nav-item">
              Meal Plan
            </NavLink>
          </nav>
        </div>

        <div className="search-bar">
          <Search size={18} className="search-icon" />
          <input type="text" placeholder="Search recipes, ingredients..." />
        </div>

        <div className="navbar-right">
          <Link to="/add-recipe" className="add-btn" title="Add New Recipe">
            <Plus size={20} />
          </Link>

          {isAuthenticated ? (
            <div className="navbar-user-section">
              <Link to="/profile" className="avatar-link" title="My Profile">
                <img 
                  src="https://images.unsplash.com/photo-1583394838336-acd977736f90?auto=format&fit=crop&w=150&q=80" 
                  alt="Avatar" 
                  className="user-avatar-circle" 
                />
              </Link>
              <button onClick={handleLogout} className="btn-login-nav logout-btn" title="Log Out">
                <LogOut size={16} />
                <span>Log Out</span>
              </button>
            </div>
          ) : (
            <Link to="/auth" className="btn-login-nav" title="Sign In">
              <LogIn size={16} />
              <span>Log In</span>
            </Link>
          )}
        </div>
      </div>
    </header>
  );
};

export default Navbar;