/**
 * Navbar Component
 * Main navigation bar with auth status and connection indicator
 */

import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import ConnectionStatus from './ConnectionStatus';

const Navbar = () => {
    const { isAuthenticated, user, logout } = useAuth();
    const navigate = useNavigate();
    const location = useLocation();
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

    const handleLogout = async () => {
        await logout();
        navigate('/');
    };

    const isActive = (path) => location.pathname === path;

    const navLinks = [
        { path: '/', label: 'Home', public: true },
        { path: '/search', label: 'Search Trains', public: true },
        { path: '/pnr-status', label: 'PNR Status', public: true },
        { path: '/train-schedule', label: 'Schedule', public: true },
        { path: '/live-train-status', label: 'Live Status', public: true },
        { path: '/station-status', label: 'Station', public: true },
    ];

    const authLinks = [
        { path: '/dashboard/book-ticket', label: 'Book Ticket' },
        { path: '/dashboard/booking-history', label: 'My Bookings' },
        { path: '/dashboard/cancel-ticket', label: 'Cancel Ticket' },
    ];

    return (
        <nav className="bg-slate-900/95 backdrop-blur-md border-b border-slate-700/50 sticky top-0 z-50">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex items-center justify-between h-16">
                    {/* Logo */}
                    <Link to="/" className="flex items-center space-x-3">
                        <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
                            <span className="text-white font-bold text-xl">🚆</span>
                        </div>
                        <span className="text-xl font-bold bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent hidden sm:block">
                            TrainBook
                        </span>
                    </Link>

                    {/* Desktop Navigation */}
                    <div className="hidden lg:flex items-center space-x-1">
                        {navLinks.map((link) => (
                            <Link
                                key={link.path}
                                to={link.path}
                                className={`px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200
                                    ${isActive(link.path)
                                        ? 'bg-blue-500/20 text-blue-400'
                                        : 'text-slate-300 hover:text-white hover:bg-slate-800'
                                    }`}
                            >
                                {link.label}
                            </Link>
                        ))}
                        
                        {isAuthenticated && authLinks.map((link) => (
                            <Link
                                key={link.path}
                                to={link.path}
                                className={`px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200
                                    ${isActive(link.path)
                                        ? 'bg-blue-500/20 text-blue-400'
                                        : 'text-slate-300 hover:text-white hover:bg-slate-800'
                                    }`}
                            >
                                {link.label}
                            </Link>
                        ))}
                    </div>

                    {/* Right side - Auth & Connection */}
                    <div className="flex items-center space-x-4">
                        <ConnectionStatus />
                        
                        {isAuthenticated ? (
                            <div className="flex items-center space-x-3">
                                <span className="text-sm text-slate-400 hidden md:block">
                                    {user?.email}
                                </span>
                                <button
                                    onClick={handleLogout}
                                    className="btn-secondary text-sm"
                                >
                                    Logout
                                </button>
                            </div>
                        ) : (
                            <Link
                                to="/login"
                                className="btn-primary text-sm"
                            >
                                Login
                            </Link>
                        )}

                        {/* Mobile menu button */}
                        <button
                            className="lg:hidden p-2 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800"
                            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                        >
                            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                {mobileMenuOpen ? (
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                ) : (
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                                )}
                            </svg>
                        </button>
                    </div>
                </div>

                {/* Mobile menu */}
                {mobileMenuOpen && (
                    <div className="lg:hidden pb-4 animate-slideUp">
                        <div className="flex flex-col space-y-1">
                            {navLinks.map((link) => (
                                <Link
                                    key={link.path}
                                    to={link.path}
                                    onClick={() => setMobileMenuOpen(false)}
                                    className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200
                                        ${isActive(link.path)
                                            ? 'bg-blue-500/20 text-blue-400'
                                            : 'text-slate-300 hover:text-white hover:bg-slate-800'
                                        }`}
                                >
                                    {link.label}
                                </Link>
                            ))}
                            
                            {isAuthenticated && (
                                <>
                                    <div className="border-t border-slate-700 my-2"></div>
                                    {authLinks.map((link) => (
                                        <Link
                                            key={link.path}
                                            to={link.path}
                                            onClick={() => setMobileMenuOpen(false)}
                                            className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200
                                                ${isActive(link.path)
                                                    ? 'bg-blue-500/20 text-blue-400'
                                                    : 'text-slate-300 hover:text-white hover:bg-slate-800'
                                                }`}
                                        >
                                            {link.label}
                                        </Link>
                                    ))}
                                </>
                            )}
                        </div>
                    </div>
                )}
            </div>
        </nav>
    );
};

export default Navbar;
