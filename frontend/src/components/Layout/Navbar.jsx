import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../../contexts/AuthContext.jsx';
import XPBar from '../Gamification/XPBar.jsx';

const Navbar = ({ onMenuToggle, sidebarOpen }) => {
  const { user, logout } = useAuth();
  const [userMenuOpen, setUserMenuOpen] = useState(false);

  const handleLogout = () => {
    setUserMenuOpen(false);
    logout();
  };

  const initials = user?.name
    ? user.name.split(' ').map((n) => n[0]).slice(0, 2).join('').toUpperCase()
    : '??';

  return (
    <nav className="navbar">
      <div className="navbar-left">
        <button
          className="navbar-menu-btn"
          onClick={onMenuToggle}
          aria-label={sidebarOpen ? 'Fechar menu' : 'Abrir menu'}
        >
          <span className={`hamburger ${sidebarOpen ? 'open' : ''}`}>
            <span />
            <span />
            <span />
          </span>
        </button>
        <div className="navbar-brand">
          <span className="navbar-brand-icon">⚡</span>
          <span className="navbar-brand-text">TaskFlow</span>
        </div>
      </div>

      <div className="navbar-center">
        <XPBar />
      </div>

      <div className="navbar-right">
        {user?.streak > 0 && (
          <div className="navbar-streak" title={`${user.streak} dias seguidos`}>
            <span>🔥</span>
            <span className="streak-count">{user.streak}</span>
          </div>
        )}

        <div className="navbar-user" onClick={() => setUserMenuOpen((p) => !p)}>
          <div className="user-avatar">{initials}</div>
          <span className="user-name-short">{user?.name?.split(' ')[0]}</span>
          <svg className="chevron-icon" viewBox="0 0 20 20" fill="currentColor">
            <path
              fillRule="evenodd"
              d="M5.23 7.21a.75.75 0 011.06.02L10 11.168l3.71-3.938a.75.75 0 111.08 1.04l-4.25 4.5a.75.75 0 01-1.08 0l-4.25-4.5a.75.75 0 01.02-1.06z"
              clipRule="evenodd"
            />
          </svg>
        </div>

        <AnimatePresence>
          {userMenuOpen && (
            <>
              <div className="dropdown-backdrop" onClick={() => setUserMenuOpen(false)} />
              <motion.div
                className="user-dropdown"
                initial={{ opacity: 0, y: -8, scale: 0.96 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: -8, scale: 0.96 }}
                transition={{ duration: 0.15 }}
              >
                <div className="dropdown-user-info">
                  <div className="user-avatar-lg">{initials}</div>
                  <div>
                    <p className="dropdown-name">{user?.name}</p>
                    <p className="dropdown-email">{user?.email}</p>
                  </div>
                </div>

                {user?.badges && user.badges.length > 0 && (
                  <div className="dropdown-badges">
                    <p className="dropdown-section-title">Badges</p>
                    <div className="badges-list">
                      {user.badges.slice(0, 4).map((b) => (
                        <div key={b.id} className="badge-item" title={b.label}>
                          <span>{b.emoji}</span>
                          <span className="badge-label">{b.label}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                <div className="dropdown-stats">
                  <div className="dropdown-stat">
                    <span className="stat-value">{user?.tasksCompleted || 0}</span>
                    <span className="stat-label">Concluídas</span>
                  </div>
                  <div className="dropdown-stat">
                    <span className="stat-value">{user?.xp || 0}</span>
                    <span className="stat-label">XP Total</span>
                  </div>
                  <div className="dropdown-stat">
                    <span className="stat-value">{user?.streak || 0}</span>
                    <span className="stat-label">Streak</span>
                  </div>
                </div>

                <button className="dropdown-logout" onClick={handleLogout}>
                  <svg viewBox="0 0 20 20" fill="currentColor" width="16" height="16">
                    <path
                      fillRule="evenodd"
                      d="M3 4.25A2.25 2.25 0 015.25 2h5.5A2.25 2.25 0 0113 4.25v2a.75.75 0 01-1.5 0v-2a.75.75 0 00-.75-.75h-5.5a.75.75 0 00-.75.75v11.5c0 .414.336.75.75.75h5.5a.75.75 0 00.75-.75v-2a.75.75 0 011.5 0v2A2.25 2.25 0 0110.75 18h-5.5A2.25 2.25 0 013 15.75V4.25z"
                      clipRule="evenodd"
                    />
                    <path
                      fillRule="evenodd"
                      d="M6 10a.75.75 0 01.75-.75h9.546l-1.048-.943a.75.75 0 111.004-1.114l2.5 2.25a.75.75 0 010 1.114l-2.5 2.25a.75.75 0 11-1.004-1.114l1.048-.943H6.75A.75.75 0 016 10z"
                      clipRule="evenodd"
                    />
                  </svg>
                  Sair
                </button>
              </motion.div>
            </>
          )}
        </AnimatePresence>
      </div>
    </nav>
  );
};

export default Navbar;
