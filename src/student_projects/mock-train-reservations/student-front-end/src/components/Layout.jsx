import React, { useState } from 'react';
import { Outlet, NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import toast from 'react-hot-toast';
import logo from '../images/logo.jpeg';
import {
  Train,
  Home,
  Search,
  Ticket,
  FileText,
  LogOut,
  Menu,
  X,
  User,
  ChevronDown,
  Calendar,
  Activity,
  Building2,
} from 'lucide-react';

const Layout = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    try {
      await logout();
      toast.success('Logged out successfully');
      navigate('/login');
    } catch (error) {
      toast.error('Failed to logout');
    }
  };

  const navigation = [
    { name: 'Dashboard', path: '/dashboard', icon: Home },
    { name: 'Search Trains', path: '/dashboard/search', icon: Search },
    { name: 'Train Schedule', path: '/dashboard/schedule', icon: Calendar },
    { name: 'Live Status', path: '/dashboard/live-status', icon: Activity },
    { name: 'Station Trains', path: '/dashboard/station', icon: Building2 },
    { name: 'My Bookings', path: '/dashboard/bookings', icon: Ticket },
    { name: 'PNR Status', path: '/dashboard/pnr', icon: FileText },
  ];

  const NavItem = ({ item, mobile = false }) => (
    <NavLink
      to={item.path}
      onClick={() => mobile && setSidebarOpen(false)}
      className={({ isActive }) =>
        `flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 ${
          isActive
            ? 'bg-primary-50 text-primary-700 font-semibold'
            : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
        }`
      }
    >
      <item.icon className="w-5 h-5" />
      <span>{item.name}</span>
    </NavLink>
  );

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Mobile Sidebar Overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`fixed top-0 left-0 z-50 h-full w-72 bg-white border-r border-gray-200 transform transition-transform duration-300 lg:translate-x-0 ${
          sidebarOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div className="flex flex-col h-full">
          {/* Logo */}
          <div className="flex items-center justify-between p-6 border-b border-gray-100">
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-2">
                <img 
                  src={logo} 
                  alt="QuickSmart Train Logo" 
                  className="w-9 h-9 rounded-xl object-contain bg-primary-100 p-1"
                  onError={(e) => {
                    e.target.style.display = 'none';
                    e.target.nextElementSibling.style.display = 'flex';
                  }}
                />
                <div className="p-2 bg-primary-100 rounded-xl hidden">
                  <Train className="w-7 h-7 text-primary-600" />
                </div>
              </div>
              <div>
                <h1 className="text-xl font-bold text-gray-900">QuickSmart</h1>
                <p className="text-xs text-gray-500">Train Reservation</p>
              </div>
            </div>
            <button
              onClick={() => setSidebarOpen(false)}
              className="lg:hidden p-2 rounded-lg hover:bg-gray-100"
            >
              <X className="w-5 h-5 text-gray-500" />
            </button>
          </div>

          {/* Navigation */}
          <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
            {navigation.map((item) => (
              <NavItem key={item.path} item={item} mobile />
            ))}
          </nav>

          {/* User Section */}
          <div className="p-4 border-t border-gray-100">
            <button
              onClick={handleLogout}
              className="flex items-center gap-3 w-full px-4 py-3 text-red-600 rounded-xl hover:bg-red-50 transition-colors"
            >
              <LogOut className="w-5 h-5" />
              <span className="font-medium">Logout</span>
            </button>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <div className="lg:pl-72">
        {/* Top Header */}
        <header className="sticky top-0 z-30 bg-white/80 backdrop-blur-lg border-b border-gray-200">
          <div className="flex items-center justify-between px-4 lg:px-8 h-16">
            {/* Mobile Menu Button */}
            <button
              onClick={() => setSidebarOpen(true)}
              className="lg:hidden p-2 rounded-lg hover:bg-gray-100"
            >
              <Menu className="w-6 h-6 text-gray-600" />
            </button>

            {/* Page Title - Hidden on mobile */}
            <div className="hidden lg:block">
              <h2 className="text-lg font-semibold text-gray-800">
                Welcome back! 👋
              </h2>
            </div>

            {/* Mobile Logo */}
            <div className="lg:hidden flex items-center gap-2">
              <img 
                src={logo} 
                alt="QuickSmart Train Logo" 
                className="w-6 h-6 rounded object-contain"
                onError={(e) => {
                  e.target.style.display = 'none';
                  e.target.nextElementSibling.style.display = 'block';
                }}
              />
              <Train className="w-6 h-6 text-primary-600 hidden" />
              <span className="font-bold text-gray-900">QuickSmart</span>
            </div>

            {/* User Menu */}
            <div className="relative">
              <button
                onClick={() => setUserMenuOpen(!userMenuOpen)}
                className="flex items-center gap-3 p-2 rounded-xl hover:bg-gray-100 transition-colors"
              >
                <div className="w-9 h-9 bg-primary-100 rounded-full flex items-center justify-center">
                  <User className="w-5 h-5 text-primary-600" />
                </div>
                <div className="hidden sm:block text-left">
                  <p className="text-sm font-medium text-gray-700 truncate max-w-[150px]">
                    {user?.email || 'User'}
                  </p>
                </div>
                <ChevronDown className="w-4 h-4 text-gray-400 hidden sm:block" />
              </button>

              {/* User Dropdown */}
              {userMenuOpen && (
                <>
                  <div
                    className="fixed inset-0 z-40"
                    onClick={() => setUserMenuOpen(false)}
                  />
                  <div className="absolute right-0 mt-2 w-56 bg-white rounded-xl shadow-lg border border-gray-200 py-2 z-50 animate-slide-down">
                    <div className="px-4 py-3 border-b border-gray-100">
                      <p className="text-sm font-medium text-gray-900">
                        {user?.email || 'User'}
                      </p>
                      <p className="text-xs text-gray-500">Logged in</p>
                    </div>
                    <button
                      onClick={() => {
                        setUserMenuOpen(false);
                        handleLogout();
                      }}
                      className="flex items-center gap-3 w-full px-4 py-3 text-red-600 hover:bg-red-50 transition-colors"
                    >
                      <LogOut className="w-4 h-4" />
                      <span className="text-sm font-medium">Logout</span>
                    </button>
                  </div>
                </>
              )}
            </div>
          </div>
        </header>

        {/* Page Content */}
        <main className="p-4 lg:p-8">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default Layout;
