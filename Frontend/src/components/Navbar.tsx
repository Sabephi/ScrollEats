import React from 'react';
import logoImg from '../assets/logo.svg';
import logotypImg from '../assets/logotyp.svg';

export const Navbar: React.FC = () => {
  return (
    <header className="navbar-container">
      <div className="navbar">
        <div className="navbar-left">
          <div className="logo">
            <img src={logotypImg} alt="ScrollEats Logo" className="logotyp-img" />
            <img src={logoImg} alt="ScrollEats Logo" className="logo-img" />
          </div>
          <nav className="nav-links">
            <a href="#" className="active">Discover</a>
            <a href="#">Collections</a>
            <a href="#">Meal Plan</a>
          </nav>
        </div>

        <div className="search-bar">
          <input type="text" placeholder="Search recipes, ingredients..." />
        </div>

        <div className="navbar-right">
          <button className="add-btn">+</button>
          <div className="avatar">👤</div>
        </div>
      </div>
    </header>
  );
};