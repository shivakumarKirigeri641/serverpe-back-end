/**
 * ============================================================================
 * DASHBOARD PAGE - User Dashboard with Navigation
 * ============================================================================
 */

import { useState } from 'react';
import { Navigate, Link, Outlet, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import ConnectionStatus from '../components/ConnectionStatus';
import {
  FiHome,
  FiCreditCard,
  FiFileText,
  FiXCircle,
  FiList,
  FiClock,
  FiMapPin,
  FiNavigation,
  FiLogOut,
  FiMenu,
  FiX,
} from 'react-icons/fi';

export default function Dashboard() {
  const { isAuthenticated, user, logout, isLoading } = useAuth();
  const location = useLocation();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const navItems = [
    { path: '/dashboard', icon: FiHome, label: 'Dashboard', exact: true },
    { path: '/dashboard/book-ticket', icon: FiCreditCard, label: 'Book Ticket' },
    { path: '/dashboard/pnr-status', icon: FiFileText, label: 'PNR Status' },
    { path: '/dashboard/cancel-ticket', icon: FiXCircle, label: 'Cancel Ticket' },
    { path: '/dashboard/booking-history', icon: FiList, label: 'Booking History' },
    { path: '/dashboard/train-schedule', icon: FiClock, label: 'Train Schedule' },
    { path: '/dashboard/live-train-status', icon: FiMapPin, label: 'Live Train Status' },
    { path: '/dashboard/live-station', icon: FiNavigation, label: 'Live Station' },
  ];

  // Redirect if not authenticated
  if (!isLoading && !isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  const isActive = (path, exact = false) => {
    if (exact) return location.pathname === path;
    return location.pathname.startsWith(path);
  };

  return (
    <div className="min-h-screen">
      {/* Mobile Menu Button */}
      <button
        onClick={() => setSidebarOpen(!sidebarOpen)}
        className="fixed top-20 left-4 z-50 md:hidden p-2 bg-slate-800 rounded-lg"
      >
        {sidebarOpen ? <FiX size={20} /> : <FiMenu size={20} />}
      </button>

      {/* Sidebar */}
      <aside
        className={`sidebar ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'} md:translate-x-0`}
      >
        {/* User Profile */}
        <div className="p-4 border-b border-white/10">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center font-bold">
              {user?.email?.[0]?.toUpperCase() || 'U'}
            </div>
            <div className="flex-1 min-w-0">
              <p className="font-medium truncate">{user?.email}</p>
              <p className="text-xs text-gray-400">Logged in</p>
            </div>
          </div>
        </div>

        {/* Navigation */}
        <nav className="p-4 space-y-2 flex-1 overflow-y-auto">
          {navItems.map((item) => (
            <Link
              key={item.path}
              to={item.path}
              onClick={() => setSidebarOpen(false)}
              className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${
                isActive(item.path, item.exact)
                  ? 'bg-blue-500/20 text-blue-400'
                  : 'text-gray-400 hover:bg-white/5 hover:text-white'
              }`}
            >
              <item.icon size={18} />
              <span>{item.label}</span>
            </Link>
          ))}
        </nav>

        {/* Connection Status */}
        <div className="p-4 border-t border-white/10">
          <ConnectionStatus />
        </div>

        {/* Logout Button */}
        <div className="p-4 border-t border-white/10">
          <button
            onClick={logout}
            className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-red-400 hover:bg-red-500/10 transition-all"
          >
            <FiLogOut size={18} />
            <span>Logout</span>
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="dashboard-container">
        <Outlet />
      </main>

      {/* Mobile Overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-30 md:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}
    </div>
  );
}

// Dashboard Home Component
export function DashboardHome() {
  const { user } = useAuth();

  const quickActions = [
    { path: '/dashboard/book-ticket', icon: '🎫', label: 'Book a Ticket', color: 'from-blue-500 to-purple-500' },
    { path: '/dashboard/pnr-status', icon: '🔍', label: 'Check PNR', color: 'from-green-500 to-teal-500' },
    { path: '/dashboard/booking-history', icon: '📋', label: 'My Bookings', color: 'from-orange-500 to-red-500' },
  ];

  return (
    <div>
      {/* Welcome Section */}
      <div className="glass-card p-6 mb-6">
        <h1 className="text-2xl font-bold mb-2">
          Welcome back! 👋
        </h1>
        <p className="text-gray-400">
          You're logged in as <span className="text-blue-400">{user?.email}</span>
        </p>
      </div>

      {/* Quick Actions */}
      <h2 className="text-xl font-semibold mb-4">Quick Actions</h2>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
        {quickActions.map((action) => (
          <Link
            key={action.path}
            to={action.path}
            className="glass-card p-6 card-hover group"
          >
            <div
              className={`w-12 h-12 rounded-xl bg-gradient-to-br ${action.color} 
                          flex items-center justify-center text-2xl mb-4
                          group-hover:scale-110 transition-transform`}
            >
              {action.icon}
            </div>
            <h3 className="font-semibold">{action.label}</h3>
          </Link>
        ))}
      </div>

      {/* Info Card */}
      <div className="glass-card p-6 border-l-4 border-l-blue-500">
        <h3 className="font-semibold mb-2">🎓 Student Project</h3>
        <p className="text-gray-400 text-sm">
          This is a mock train reservation system for educational purposes.
          All bookings are simulated and no real transactions are made.
        </p>
      </div>
    </div>
  );
}
