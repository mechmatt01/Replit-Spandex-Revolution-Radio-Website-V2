/* PHASE 2: Navigation Bar (Expanded AMP, Burger, Profile) */
import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import '../styles/theme.css';

const Navbar = ({ toggleTheme }) => {
  const { user } = useAuth();
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  return (
    <nav style={{ display: 'flex', justifyContent: 'space-between', padding: '1rem', background: 'var(--bg-secondary)' }}>
      {/* Brand / Logo */}
      <div className="brand">
        <div className="logo-spinner">💿</div> {/* Temporary Vinyl Logo */}
        Spandex Salvation
      </div>

      {/* AMP Panel (Expanded) */}
      <div className="amp-panel hidden-mobile">
        {/* Expanded links go here */}
        <a href="/">Home</a>
        <a href="/shows">Shows</a>
        <a href="/shop">Merch</a>
      </div>

      {/* Right Side Controls */}
      <div className="nav-controls">
        {/* Theme Toggle for Testing */}
        <button onClick={toggleTheme}>🎨 Theme</button>

        {/* Profile Button */}
        <div className="profile-section">
          {user.isLoggedIn ? (
            <button className="btn-profile">👤 {user.name}</button>
          ) : (
            <button className="btn-login">Sign In</button>
          )}
        </div>

        {/* Burger Menu */}
        <button className="burger-menu" onClick={() => setIsMenuOpen(!isMenuOpen)}>
          ☰
        </button>
      </div>

      {/* Mobile Dropdown */}
      {isMenuOpen && (
        <div className="mobile-menu">
           <a href="/">Home</a>
           <a href="/shows">Shows</a>
           {user.isBandMember && <a href="/submit-song">Submit Song</a>}
        </div>
      )}
    </nav>
  );
};

export default Navbar;