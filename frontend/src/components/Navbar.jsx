import { useState, useEffect, useRef } from 'react';
import { Link, NavLink, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../context/AuthContext';
import { FiMenu, FiX, FiBook, FiUser, FiLogOut, FiSettings, FiShield, FiMapPin, FiChevronDown, FiAward } from 'react-icons/fi';

const navLinks = [
  { to: '/books', label: 'Catalogue' },
  { to: '/suggestions', label: 'Suggestions' },
  { to: '/hubs', label: 'Hubs' },
  { to: '/forum', label: 'Community' },
  { to: '/feed', label: "Friends' Shelf", protected: true },
];

const LOCATIONS = ['All Locations', 'Nagpur', 'IIM Udaipur'];

export default function Navbar() {
  const { user, logout, isAdmin } = useAuth();
  const navigate = useNavigate();
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [locDropdownOpen, setLocDropdownOpen] = useState(false);
  const [selectedLocation, setSelectedLocation] = useState(() => localStorage.getItem('ndl_selected_location') || 'All Locations');
  const dropdownRef = useRef(null);
  const locRef = useRef(null);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 50);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    const handleLocUpdate = (e) => {
      if (e.detail) setSelectedLocation(e.detail);
    };
    window.addEventListener('ndl_location_change', handleLocUpdate);
    return () => window.removeEventListener('ndl_location_change', handleLocUpdate);
  }, []);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setDropdownOpen(false);
      }
      if (locRef.current && !locRef.current.contains(e.target)) {
        setLocDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleLogout = () => {
    logout();
    navigate('/');
    setDropdownOpen(false);
  };

  const handleLocationChange = (loc) => {
    setSelectedLocation(loc);
    localStorage.setItem('ndl_selected_location', loc);
    setLocDropdownOpen(false);
    window.dispatchEvent(new CustomEvent('ndl_location_change', { detail: loc }));
    if (window.location.pathname === '/books') {
      navigate(loc === 'All Locations' ? '/books' : `/books?location=${encodeURIComponent(loc)}`);
    }
  };

  const getInitials = (name) => name?.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);

  return (
    <>
      <motion.nav
        className={`navbar ${scrolled ? 'navbar-scrolled' : ''}`}
        initial={{ y: -100 }}
        animate={{ y: 0 }}
        transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
      >
        <div className="container navbar-inner">
          {/* Logo */}
          <Link to="/" className="navbar-logo">
            <div className="navbar-logo-icon">
              <img src="/logo.png" alt="Next Door Library Logo" className="navbar-logo-img" />
            </div>
            <div>
              <span className="navbar-logo-text">Next Door</span>
              <span className="navbar-logo-sub">Library</span>
            </div>
          </Link>

          {/* Desktop Nav */}
          <div className="navbar-links">
            {navLinks.map(link => (
              (!link.protected || user) && (
                <NavLink
                  key={link.to}
                  to={link.to}
                  className={({ isActive }) => `navbar-link ${isActive ? 'navbar-link-active' : ''}`}
                >
                  {link.label}
                </NavLink>
              )
            ))}
          </div>

          {/* Right Side */}
          <div className="navbar-actions">
            {/* IIM Udaipur Announcement Mini Pill */}
            <button
              className="navbar-iimu-pill"
              onClick={() => window.dispatchEvent(new CustomEvent('open_iimu_popup'))}
              title="Click to view IIM Udaipur campus lending details"
            >
              <span className="iimu-dot">✦</span>
              <span>IIM Udaipur</span>
            </button>

            {/* Location Selector Pill */}
            <div className="navbar-location-wrap" ref={locRef}>
              <button
                className="navbar-location-btn"
                onClick={() => setLocDropdownOpen(!locDropdownOpen)}
                title="Select City / Campus"
              >
                <FiMapPin size={14} style={{ color: 'var(--copper)' }} />
                <span>{selectedLocation}</span>
                <FiChevronDown size={13} style={{ transform: locDropdownOpen ? 'rotate(180deg)' : 'none', transition: 'transform 0.2s', color: 'var(--text-muted)' }} />
              </button>

              <AnimatePresence>
                {locDropdownOpen && (
                  <motion.div
                    className="navbar-loc-dropdown"
                    initial={{ opacity: 0, y: -6, scale: 0.96 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: -6, scale: 0.96 }}
                    transition={{ duration: 0.15 }}
                  >
                    <div style={{ padding: '8px 12px', fontSize: '11px', fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                      Choose Location
                    </div>
                    {LOCATIONS.map(loc => (
                      <button
                        key={loc}
                        className={`navbar-loc-item ${selectedLocation === loc ? 'active' : ''}`}
                        onClick={() => handleLocationChange(loc)}
                      >
                        <FiMapPin size={13} />
                        <span>{loc}</span>
                      </button>
                    ))}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {user ? (
              <div className="navbar-user" ref={dropdownRef}>
                <button
                  id="user-menu-btn"
                  className="navbar-avatar-btn"
                  onClick={() => setDropdownOpen(!dropdownOpen)}
                >
                  {user.avatar ? (
                    <img src={user.avatar} alt={user.name} className="navbar-avatar-img" />
                  ) : (
                    <div className="navbar-avatar-initials">{getInitials(user.name)}</div>
                  )}
                  <span className="navbar-user-name">{user.name.split(' ')[0]}</span>
                </button>

                <AnimatePresence>
                  {dropdownOpen && (
                    <motion.div
                      className="navbar-dropdown"
                      initial={{ opacity: 0, y: -10, scale: 0.95 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: -10, scale: 0.95 }}
                      transition={{ duration: 0.2 }}
                    >
                      <div className="navbar-dropdown-header">
                        <p className="navbar-dropdown-name">{user.name}</p>
                        <p className="navbar-dropdown-email">{user.email}</p>
                      </div>
                      <div className="navbar-dropdown-divider" />
                      <Link to="/dashboard" className="navbar-dropdown-item" onClick={() => setDropdownOpen(false)}>
                        <FiUser size={15} /> My Dashboard
                      </Link>
                      {isAdmin && (
                        <Link to="/admin" className="navbar-dropdown-item navbar-dropdown-admin" onClick={() => setDropdownOpen(false)}>
                          <FiShield size={15} /> Admin Panel
                        </Link>
                      )}
                      <div className="navbar-dropdown-divider" />
                      <button className="navbar-dropdown-item navbar-dropdown-logout" onClick={handleLogout}>
                        <FiLogOut size={15} /> Sign Out
                      </button>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            ) : (
              <div className="navbar-auth">
                <Link to="/login" className="btn btn-ghost btn-sm">Sign In</Link>
                <Link to="/register" className="btn btn-primary btn-sm">Join Library</Link>
              </div>
            )}

            {/* Mobile Toggle */}
            <button className="navbar-mobile-toggle" onClick={() => setMobileOpen(!mobileOpen)} id="mobile-menu-btn">
              {mobileOpen ? <FiX size={22} /> : <FiMenu size={22} />}
            </button>
          </div>
        </div>
      </motion.nav>

      {/* Mobile Menu */}
      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            className="mobile-menu"
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.3 }}
          >
            <div className="mobile-menu-inner">
              {navLinks.map(link => (
                (!link.protected || user) && (
                  <NavLink
                    key={link.to}
                    to={link.to}
                    className="mobile-menu-link"
                    onClick={() => setMobileOpen(false)}
                  >
                    {link.label}
                  </NavLink>
                )
              ))}
              {!user ? (
                <>
                  <Link to="/login" className="mobile-menu-link" onClick={() => setMobileOpen(false)}>Sign In</Link>
                  <Link to="/register" className="btn btn-primary w-full" onClick={() => setMobileOpen(false)} style={{marginTop: '8px'}}>Join Library</Link>
                </>
              ) : (
                <>
                  <Link to="/dashboard" className="mobile-menu-link" onClick={() => setMobileOpen(false)}>My Dashboard</Link>
                  {isAdmin && <Link to="/admin" className="mobile-menu-link" onClick={() => setMobileOpen(false)}>Admin Panel</Link>}
                  <button className="mobile-menu-link mobile-logout" onClick={() => { handleLogout(); setMobileOpen(false); }}>Sign Out</button>
                </>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <style>{`
        .navbar {
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          z-index: var(--z-sticky);
          padding: 20px 0;
          transition: all var(--transition-base);
        }

        .navbar-scrolled {
          background: rgba(247, 240, 227, 0.92);
          backdrop-filter: blur(20px);
          -webkit-backdrop-filter: blur(20px);
          border-bottom: 1px solid rgba(196, 144, 106, 0.2);
          padding: 12px 0;
          box-shadow: 0 4px 30px rgba(44, 24, 16, 0.08);
        }

        .navbar-inner {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 24px;
        }

        .navbar-logo {
          display: flex;
          align-items: center;
          gap: 10px;
          text-decoration: none;
        }

        .navbar-logo-icon {
          display: flex;
          align-items: center;
          justify-content: center;
          width: 36px;
          height: 36px;
          color: var(--brown-rich);
          flex-shrink: 0;
          border-radius: 50%;
          overflow: hidden;
        }

        .navbar-logo-img {
          width: 100%;
          height: 100%;
          object-fit: cover;
          border-radius: 50%;
        }

        .navbar-logo-text {
          display: block;
          font-family: var(--font-serif);
          font-size: 1rem;
          font-weight: 600;
          color: var(--brown-rich);
          line-height: 1;
        }

        .navbar-logo-sub {
          display: block;
          font-family: var(--font-sans);
          font-size: 0.6rem;
          font-weight: 500;
          letter-spacing: 0.15em;
          text-transform: uppercase;
          color: var(--copper);
          line-height: 1;
          margin-top: 2px;
        }

        .navbar-links {
          display: flex;
          align-items: center;
          gap: 32px;
        }

        .navbar-link {
          font-size: var(--text-sm);
          font-weight: 500;
          color: var(--text-secondary);
          text-decoration: none;
          position: relative;
          padding-bottom: 4px;
          transition: color var(--transition-fast);
          letter-spacing: 0.01em;
        }

        .navbar-link::after {
          content: '';
          position: absolute;
          bottom: 0;
          left: 0;
          width: 0;
          height: 1.5px;
          background: var(--copper);
          transition: width var(--transition-base);
        }

        .navbar-link:hover { color: var(--brown-rich); }
        .navbar-link:hover::after { width: 100%; }
        .navbar-link-active { color: var(--brown-rich); }
        .navbar-link-active::after { width: 100%; }

        .navbar-actions {
          display: flex;
          align-items: center;
          gap: 12px;
        }

        .navbar-auth {
          display: flex;
          align-items: center;
          gap: 8px;
        }

        .navbar-user { position: relative; }

        .navbar-avatar-btn {
          display: flex;
          align-items: center;
          gap: 8px;
          background: rgba(196, 144, 106, 0.1);
          border: 1px solid rgba(196, 144, 106, 0.2);
          border-radius: var(--radius-full);
          padding: 6px 14px 6px 6px;
          cursor: pointer;
          transition: all var(--transition-fast);
        }

        .navbar-avatar-btn:hover {
          background: rgba(196, 144, 106, 0.2);
          border-color: var(--copper);
        }

        .navbar-avatar-img {
          width: 28px;
          height: 28px;
          border-radius: 50%;
          object-fit: cover;
        }

        .navbar-avatar-initials {
          width: 28px;
          height: 28px;
          border-radius: 50%;
          background: var(--brown-rich);
          color: var(--cream);
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 11px;
          font-weight: 600;
          letter-spacing: 0.05em;
        }

        .navbar-user-name {
          font-size: var(--text-sm);
          font-weight: 500;
          color: var(--text-primary);
        }

        .navbar-dropdown {
          position: absolute;
          top: calc(100% + 12px);
          right: 0;
          min-width: 220px;
          background: var(--bg-card);
          backdrop-filter: blur(20px);
          border: 1px solid rgba(196, 144, 106, 0.2);
          border-radius: var(--radius-lg);
          box-shadow: var(--shadow-xl);
          padding: 8px;
          z-index: var(--z-dropdown);
        }

        .navbar-dropdown-header {
          padding: 8px 12px;
        }

        .navbar-dropdown-name {
          font-weight: 600;
          font-size: var(--text-sm);
          color: var(--text-primary);
        }

        .navbar-dropdown-email {
          font-size: var(--text-xs);
          color: var(--text-muted);
          margin-top: 2px;
        }

        .navbar-dropdown-divider {
          height: 1px;
          background: rgba(196, 144, 106, 0.15);
          margin: 6px 0;
        }

        .navbar-dropdown-item {
          display: flex;
          align-items: center;
          gap: 10px;
          padding: 9px 12px;
          border-radius: var(--radius-sm);
          font-size: var(--text-sm);
          color: var(--text-secondary);
          text-decoration: none;
          transition: all var(--transition-fast);
          cursor: pointer;
          width: 100%;
          text-align: left;
        }

        .navbar-dropdown-item:hover {
          background: rgba(196, 144, 106, 0.1);
          color: var(--text-primary);
        }

        .navbar-iimu-pill {
          display: flex;
          align-items: center;
          gap: 7px;
          height: 36px;
          padding: 0 15px;
          border-radius: var(--radius-full);
          background: linear-gradient(180deg, rgba(255,255,255,0.92), rgba(247,240,227,0.55));
          border: 1px solid rgba(196, 144, 106, 0.4);
          color: var(--brown-rich);
          font-family: var(--font-sans);
          font-size: 12.5px;
          font-weight: 600;
          letter-spacing: 0.01em;
          white-space: nowrap;
          cursor: pointer;
          box-shadow: 0 1px 2px rgba(44, 24, 16, 0.05);
          transition: transform var(--transition-fast), box-shadow var(--transition-base), border-color var(--transition-base), background var(--transition-base);
        }
        .navbar-iimu-pill:hover {
          transform: translateY(-1px);
          border-color: var(--copper);
          box-shadow: 0 6px 16px rgba(196, 144, 106, 0.22);
        }
        .navbar-iimu-pill:active { transform: translateY(0) scale(0.97); }
        .iimu-dot {
          font-size: 11px;
          color: var(--gold);
          line-height: 1;
        }

        .navbar-location-wrap {
          position: relative;
        }
        .navbar-location-btn {
          display: flex;
          align-items: center;
          gap: 7px;
          height: 36px;
          padding: 0 13px;
          border-radius: var(--radius-full);
          background: linear-gradient(180deg, rgba(255,255,255,0.92), rgba(247,240,227,0.55));
          border: 1px solid rgba(196, 144, 106, 0.4);
          color: var(--brown-rich);
          font-family: var(--font-sans);
          font-size: 12.5px;
          font-weight: 600;
          white-space: nowrap;
          cursor: pointer;
          box-shadow: 0 1px 2px rgba(44, 24, 16, 0.05);
          transition: transform var(--transition-fast), box-shadow var(--transition-base), border-color var(--transition-base), background var(--transition-base);
        }
        .navbar-location-btn:hover {
          transform: translateY(-1px);
          border-color: var(--copper);
          box-shadow: 0 6px 16px rgba(196, 144, 106, 0.22);
        }
        .navbar-location-btn:active { transform: translateY(0) scale(0.97); }
        .navbar-loc-dropdown {
          position: absolute;
          top: calc(100% + 8px);
          right: 0;
          min-width: 170px;
          background: var(--bg-card);
          backdrop-filter: blur(20px);
          border: 1px solid rgba(196, 144, 106, 0.25);
          border-radius: var(--radius-md);
          box-shadow: var(--shadow-xl);
          padding: 4px;
          z-index: var(--z-dropdown);
        }
        .navbar-loc-item {
          display: flex;
          align-items: center;
          gap: 8px;
          width: 100%;
          padding: 8px 12px;
          border-radius: var(--radius-sm);
          font-size: var(--text-xs);
          font-weight: 500;
          color: var(--text-secondary);
          background: transparent;
          border: none;
          cursor: pointer;
          text-align: left;
          transition: all 0.15s ease;
        }
        .navbar-loc-item:hover {
          background: rgba(196, 144, 106, 0.12);
          color: var(--brown-deep);
        }
        .navbar-loc-item.active {
          background: var(--brown-rich);
          color: var(--cream);
          font-weight: 600;
        }
        .navbar-loc-item.active svg {
          color: var(--gold);
        }

        .navbar-dropdown-admin { color: var(--copper); }
        .navbar-dropdown-logout { color: var(--dusty-rose); }
        .navbar-dropdown-logout:hover { background: rgba(201, 137, 122, 0.1); }

        .navbar-mobile-toggle {
          display: none;
          align-items: center;
          justify-content: center;
          width: 36px;
          height: 36px;
          border-radius: var(--radius-md);
          color: var(--text-primary);
          transition: all var(--transition-fast);
        }

        .navbar-mobile-toggle:hover { background: var(--cream-dark); }

        .mobile-menu {
          position: fixed;
          top: 68px;
          left: 0;
          right: 0;
          z-index: calc(var(--z-sticky) - 1);
          background: rgba(247, 240, 227, 0.97);
          backdrop-filter: blur(20px);
          border-bottom: 1px solid rgba(196, 144, 106, 0.2);
          overflow: hidden;
        }

        .mobile-menu-inner {
          padding: 16px;
          display: flex;
          flex-direction: column;
          gap: 4px;
        }

        .mobile-menu-link {
          display: block;
          padding: 12px 16px;
          border-radius: var(--radius-md);
          font-size: var(--text-base);
          color: var(--text-secondary);
          text-decoration: none;
          transition: all var(--transition-fast);
        }

        .mobile-menu-link:hover {
          background: rgba(196, 144, 106, 0.1);
          color: var(--text-primary);
        }

        .mobile-logout { color: var(--dusty-rose); }

        @media (max-width: 768px) {
          .navbar-links, .navbar-auth { display: none; }
          .navbar-mobile-toggle { display: flex; }
          .navbar-user-name { display: none; }
        }
      `}</style>
    </>
  );
}
