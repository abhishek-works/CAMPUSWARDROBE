import { useState, useEffect, useRef } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { RiShirtLine, RiMenu3Line, RiCloseLine, RiSearchLine, RiAddLine, RiCalendarLine, RiLayoutGridLine, RiLogoutBoxRLine, RiUserLine } from 'react-icons/ri';
import './Navbar.css';

const Navbar = () => {
  const { user, isAuthenticated, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    setMobileOpen(false);
    setDropdownOpen(false);
  }, [location.pathname]);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const navLinks = [
    { path: '/browse', label: 'Browse', icon: <RiSearchLine /> },
    { path: '/create', label: 'List Item', icon: <RiAddLine /> },
    { path: '/bookings', label: 'My Bookings', icon: <RiCalendarLine /> },
    { path: '/my-listings', label: 'My Listings', icon: <RiLayoutGridLine /> },
  ];

  return (
    <nav className={`navbar ${scrolled ? 'navbar-scrolled' : ''}`} id="main-navbar">
      <div className="navbar-inner container">
        <Link to="/" className="navbar-brand" id="navbar-logo">
          <RiShirtLine className="navbar-logo-icon" />
          <span className="navbar-logo-text">Campus<span className="gradient-text">Wardrobe</span></span>
        </Link>

        {isAuthenticated && (
          <div className={`navbar-links ${mobileOpen ? 'navbar-links-open' : ''}`}>
            {navLinks.map((link) => (
              <Link
                key={link.path}
                to={link.path}
                className={`navbar-link ${location.pathname === link.path ? 'navbar-link-active' : ''}`}
                id={`nav-${link.path.slice(1)}`}
              >
                {link.icon}
                <span>{link.label}</span>
              </Link>
            ))}
          </div>
        )}

        <div className="navbar-actions">
          {isAuthenticated ? (
            <div className="navbar-user" ref={dropdownRef}>
              <button
                className="navbar-avatar-btn"
                onClick={() => setDropdownOpen(!dropdownOpen)}
                id="navbar-user-menu"
              >
                <div className="navbar-avatar">
                  {user?.name?.charAt(0).toUpperCase() || 'U'}
                </div>
                <span className="navbar-username">{user?.name?.split(' ')[0]}</span>
              </button>
              {dropdownOpen && (
                <div className="navbar-dropdown animate-slide-down" id="user-dropdown">
                  <div className="navbar-dropdown-header">
                    <span className="navbar-dropdown-name">{user?.name}</span>
                    <span className="navbar-dropdown-email">{user?.email}</span>
                  </div>
                  <div className="navbar-dropdown-divider" />
                  <Link to="/my-listings" className="navbar-dropdown-item">
                    <RiUserLine /> My Profile
                  </Link>
                  <button className="navbar-dropdown-item navbar-dropdown-logout" onClick={handleLogout}>
                    <RiLogoutBoxRLine /> Logout
                  </button>
                </div>
              )}
            </div>
          ) : (
            <div className="navbar-auth-buttons">
              <Link to="/login" className="btn btn-ghost btn-sm" id="nav-login">Login</Link>
              <Link to="/register" className="btn btn-primary btn-sm" id="nav-register">Sign Up</Link>
            </div>
          )}

          {isAuthenticated && (
            <button
              className="navbar-mobile-toggle"
              onClick={() => setMobileOpen(!mobileOpen)}
              id="navbar-mobile-toggle"
              aria-label="Toggle menu"
            >
              {mobileOpen ? <RiCloseLine /> : <RiMenu3Line />}
            </button>
          )}
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
