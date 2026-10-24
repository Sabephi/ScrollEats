import React from 'react';
import { NavLink, Link } from 'react-router-dom';
import { Search, Plus, User } from 'lucide-react';
import logoImg from '../assets/logo.svg';
import logotypImg from '../assets/logotyp.svg';

export const Navbar: React.FC = () => {
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
          
          <NavLink to="/profile" className="avatar" title="My Profile">
            <User size={18} />
          </NavLink>
        </div>
      </div>
    </header>
  );
};