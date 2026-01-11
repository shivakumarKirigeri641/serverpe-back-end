import React, { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const { user, logout, isLoggedIn } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const navLinks = [
    { path: '/', label: 'Home', icon: '🏠' },
    { path: '/pnr-status', label: 'PNR Status', icon: '🔍' },
  ];

  const authLinks = [
    { path: '/history', label: 'My Bookings', icon: '🎫' },
  ];

  const isActive = (path) => location.pathname === path;

  return (
    <nav className="bg-slate-900/80 backdrop-blur-lg border-b border-slate-800 sticky top-0 z-50">
      <div className="container mx-auto px-4">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center space-x-2">
            <span className="text-3xl">🚂</span>
            <div>
              <h1 className="text-xl font-bold gradient-text">TrainReserve</h1>
              <p className="text-xs text-slate-400">Mock Reservation System</p>
            </div>
          </Link>

          {/* Desktop Nav */}
          <div className="hidden md:flex items-center space-x-4">
            {navLinks.map((link) => (
              <Link
                key={link.path}
                to={link.path}
                className={`flex items-center space-x-1 px-3 py-2 rounded-lg transition-all duration-200
                  ${isActive(link.path) 
                    ? 'bg-blue-500/20 text-blue-400' 
                    : 'text-slate-300 hover:text-white hover:bg-slate-800'
                  }`}
              >
                <span>{link.icon}</span>
                <span>{link.label}</span>
              </Link>
            ))}

            {isLoggedIn && authLinks.map((link) => (
              <Link
                key={link.path}
                to={link.path}
                className={`flex items-center space-x-1 px-3 py-2 rounded-lg transition-all duration-200
                  ${isActive(link.path) 
                    ? 'bg-blue-500/20 text-blue-400' 
                    : 'text-slate-300 hover:text-white hover:bg-slate-800'
                  }`}
              >
                <span>{link.icon}</span>
                <span>{link.label}</span>
              </Link>
            ))}

            <div className="h-6 w-px bg-slate-700 mx-2"></div>

            {!isLoggedIn ? (
              <Link to="/login" className="btn-primary py-1.5 px-4 text-sm">
                Login
              </Link>
            ) : (
              <div className="flex items-center space-x-4">
                <span className="text-xs text-slate-400 max-w-[120px] truncate" title={user.email}>
                  {user.email}
                </span>
                <button
                  onClick={handleLogout}
                  className="text-slate-400 hover:text-red-400 transition-colors text-sm font-medium"
                >
                  Logout
                </button>
              </div>
            )}
          </div>

          {/* Mobile menu button */}
          <button
            onClick={() => setIsOpen(!isOpen)}
            className="md:hidden p-2 rounded-lg hover:bg-slate-800"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              {isOpen ? (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              ) : (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              )}
            </svg>
          </button>
        </div>

        {/* Mobile Nav */}
        {isOpen && (
          <div className="md:hidden py-4 border-t border-slate-800 animate-slide-up">
            {navLinks.map((link) => (
              <Link
                key={link.path}
                to={link.path}
                onClick={() => setIsOpen(false)}
                className={`flex items-center space-x-2 px-4 py-3 rounded-lg transition-all
                  ${isActive(link.path) 
                    ? 'bg-blue-500/20 text-blue-400' 
                    : 'text-slate-300 hover:bg-slate-800'
                  }`}
              >
                <span>{link.icon}</span>
                <span>{link.label}</span>
              </Link>
            ))}
          </div>
        )}
      </div>
    </nav>
  );
};

export default Navbar;
