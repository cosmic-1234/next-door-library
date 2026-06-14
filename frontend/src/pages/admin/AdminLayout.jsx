import { useState } from 'react';
import { Outlet, NavLink, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { FiBarChart2, FiBook, FiList, FiUsers, FiLogOut, FiMenu, FiX, FiHome } from 'react-icons/fi';
import { useAuth } from '../../context/AuthContext';

const adminNavItems = [
  { to: '/admin', label: 'Dashboard', icon: FiBarChart2, end: true },
  { to: '/admin/books', label: 'Books', icon: FiBook },
  { to: '/admin/rentals', label: 'Rentals', icon: FiList },
  { to: '/admin/users', label: 'Users', icon: FiUsers },
];

export default function AdminLayout() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(true);

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <div className="admin-layout">
      {/* Sidebar */}
      <motion.aside
        className={`admin-sidebar ${sidebarOpen ? 'sidebar-open' : 'sidebar-closed'}`}
        initial={{ x: -280 }}
        animate={{ x: 0 }}
        transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
      >
        <div className="sidebar-header">
          <div className="sidebar-logo">
            <svg viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg" width="28" height="28">
              <circle cx="20" cy="20" r="18" stroke="var(--copper)" strokeWidth="1.5" opacity="0.5"/>
              <path d="M20 30C14 25 10 20 10 15C10 12 12.7 10 16 10C17.9 10 19.6 11 20 12.5C20.4 11 22.1 10 24 10C27.3 10 30 12 30 15C30 20 26 25 20 30Z"
                stroke="var(--copper)" strokeWidth="1.2" fill="var(--copper)" fillOpacity="0.1"/>
            </svg>
            <div>
              <span className="sidebar-logo-text">Admin Panel</span>
              <span className="sidebar-logo-sub">Next Door Library</span>
            </div>
          </div>

          <button className="sidebar-toggle" onClick={() => setSidebarOpen(!sidebarOpen)}>
            {sidebarOpen ? <FiX size={18} /> : <FiMenu size={18} />}
          </button>
        </div>

        <nav className="sidebar-nav">
          {adminNavItems.map(({ to, label, icon: Icon, end }) => (
            <NavLink
              key={to}
              to={to}
              end={end}
              className={({ isActive }) => `sidebar-nav-item ${isActive ? 'sidebar-nav-item-active' : ''}`}
            >
              <Icon size={18} />
              <span>{label}</span>
            </NavLink>
          ))}
        </nav>

        <div className="sidebar-footer">
          <NavLink to="/" className="sidebar-nav-item">
            <FiHome size={18} />
            <span>View Site</span>
          </NavLink>

          <div className="sidebar-user">
            <div className="sidebar-user-avatar">{user?.name?.[0]}</div>
            <div>
              <p className="sidebar-user-name">{user?.name}</p>
              <p className="sidebar-user-role">Administrator</p>
            </div>
          </div>

          <button className="sidebar-logout" onClick={handleLogout}>
            <FiLogOut size={16} />
            <span>Sign Out</span>
          </button>
        </div>
      </motion.aside>

      {/* Main Content */}
      <main className={`admin-main ${sidebarOpen ? 'admin-main-shifted' : ''}`}>
        <div className="admin-topbar">
          <button className="admin-topbar-toggle" onClick={() => setSidebarOpen(!sidebarOpen)}>
            <FiMenu size={20} />
          </button>
          <span className="admin-topbar-title">Next Door Library — Admin</span>
        </div>

        <div className="admin-content">
          <Outlet />
        </div>
      </main>

      <style>{`
        .admin-layout {
          display: flex;
          min-height: 100vh;
          background: var(--cream);
        }

        .admin-sidebar {
          width: 260px;
          background: var(--brown-deep);
          position: fixed;
          top: 0;
          left: 0;
          bottom: 0;
          z-index: 50;
          display: flex;
          flex-direction: column;
          transition: width 0.3s ease;
          overflow: hidden;
        }

        .sidebar-header {
          padding: 24px 20px;
          border-bottom: 1px solid rgba(196, 144, 106, 0.15);
          display: flex;
          align-items: center;
          justify-content: space-between;
        }

        .sidebar-logo {
          display: flex;
          align-items: center;
          gap: 10px;
        }

        .sidebar-logo-text {
          display: block;
          font-size: var(--text-sm);
          font-weight: 600;
          color: var(--cream);
          line-height: 1;
        }

        .sidebar-logo-sub {
          display: block;
          font-size: 10px;
          color: var(--copper-light);
          margin-top: 2px;
          opacity: 0.7;
        }

        .sidebar-toggle {
          color: rgba(247, 240, 227, 0.5);
          transition: color var(--transition-fast);
          padding: 4px;
        }

        .sidebar-toggle:hover { color: var(--cream); }

        .sidebar-nav {
          flex: 1;
          padding: 16px 12px;
          display: flex;
          flex-direction: column;
          gap: 4px;
          overflow-y: auto;
        }

        .sidebar-nav-item {
          display: flex;
          align-items: center;
          gap: 12px;
          padding: 10px 14px;
          border-radius: var(--radius-md);
          font-size: var(--text-sm);
          font-weight: 400;
          color: rgba(247, 240, 227, 0.6);
          text-decoration: none;
          transition: all var(--transition-fast);
          white-space: nowrap;
          cursor: pointer;
          border: none;
          background: none;
          width: 100%;
          text-align: left;
        }

        .sidebar-nav-item:hover {
          background: rgba(196, 144, 106, 0.1);
          color: var(--cream);
        }

        .sidebar-nav-item-active {
          background: rgba(196, 144, 106, 0.15) !important;
          color: var(--cream) !important;
          border: 1px solid rgba(196, 144, 106, 0.25);
        }

        .sidebar-footer {
          padding: 12px;
          border-top: 1px solid rgba(196, 144, 106, 0.15);
          display: flex;
          flex-direction: column;
          gap: 8px;
        }

        .sidebar-user {
          display: flex;
          align-items: center;
          gap: 10px;
          padding: 10px 14px;
          border-radius: var(--radius-md);
          background: rgba(196, 144, 106, 0.08);
        }

        .sidebar-user-avatar {
          width: 32px;
          height: 32px;
          border-radius: 50%;
          background: var(--copper);
          color: white;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: var(--text-sm);
          font-weight: 600;
          flex-shrink: 0;
        }

        .sidebar-user-name {
          font-size: var(--text-sm);
          font-weight: 500;
          color: var(--cream);
          line-height: 1;
        }

        .sidebar-user-role {
          font-size: 10px;
          color: var(--copper-light);
          margin-top: 2px;
        }

        .sidebar-logout {
          display: flex;
          align-items: center;
          gap: 10px;
          padding: 8px 14px;
          border-radius: var(--radius-md);
          font-size: var(--text-sm);
          color: rgba(201, 137, 122, 0.8);
          transition: all var(--transition-fast);
          cursor: pointer;
          border: none;
          background: none;
          width: 100%;
          text-align: left;
        }

        .sidebar-logout:hover {
          background: rgba(201, 137, 122, 0.1);
          color: var(--dusty-rose);
        }

        .admin-main {
          flex: 1;
          margin-left: 260px;
          min-height: 100vh;
          transition: margin-left 0.3s ease;
          display: flex;
          flex-direction: column;
        }

        .admin-topbar {
          position: sticky;
          top: 0;
          z-index: 40;
          background: rgba(247, 240, 227, 0.92);
          backdrop-filter: blur(20px);
          border-bottom: 1px solid rgba(196, 144, 106, 0.15);
          padding: 14px 28px;
          display: flex;
          align-items: center;
          gap: 16px;
        }

        .admin-topbar-toggle {
          color: var(--text-muted);
          padding: 4px;
          border-radius: var(--radius-sm);
          transition: all var(--transition-fast);
        }

        .admin-topbar-toggle:hover { background: var(--cream-dark); color: var(--text-primary); }

        .admin-topbar-title {
          font-size: var(--text-sm);
          font-weight: 500;
          color: var(--text-muted);
        }

        .admin-content {
          padding: 32px 28px;
          flex: 1;
        }

        @media (max-width: 768px) {
          .admin-sidebar { width: 240px; transform: translateX(-100%); }
          .admin-sidebar.sidebar-open { transform: translateX(0); }
          .admin-main { margin-left: 0; }
        }
      `}</style>
    </div>
  );
}
