import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import logo from '../images/logo.jpeg';
import {
  Train,
  Search,
  FileText,
  MapPin,
  Navigation,
  Calendar,
  LogIn,
  User,
} from 'lucide-react';

// Import page components
import SearchTrains from './SearchTrains';
import TrainSchedule from './TrainSchedule';
import PnrStatus from './PnrStatus';
import LiveStatus from './LiveStatus';
import StationStatus from './StationStatus';

const HomePage = () => {
  const { isAuthenticated, user } = useAuth();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('search');

  const tabs = [
    {
      id: 'search',
      label: 'Search Trains',
      icon: Search,
      component: SearchTrains,
    },
    {
      id: 'schedule',
      label: 'Train Schedule',
      icon: Calendar,
      component: TrainSchedule,
    },
    {
      id: 'live-status',
      label: 'Live Status',
      icon: Navigation,
      component: LiveStatus,
    },
    {
      id: 'station',
      label: 'Station Status',
      icon: MapPin,
      component: StationStatus,
    },
    {
      id: 'pnr',
      label: 'PNR Status',
      icon: FileText,
      component: PnrStatus,
    },
  ];

  const ActiveComponent = tabs.find(t => t.id === activeTab)?.component;

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-gray-200 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Logo */}
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-2">
                <img 
                  src={logo} 
                  alt="QuickSmart Train Logo" 
                  className="w-8 h-8 rounded-lg object-contain"
                  onError={(e) => {
                    e.target.style.display = 'none';
                    e.target.nextElementSibling.style.display = 'flex';
                  }}
                />
                <div className="p-2 bg-gradient-to-r from-blue-600 to-purple-600 rounded-xl hidden">
                  <Train className="w-6 h-6 text-white" />
                </div>
              </div>
              <div>
                <h1 className="text-xl font-bold text-gray-900">QuickSmart Train</h1>
                <p className="text-xs text-gray-500">Book your journey</p>
              </div>
            </div>

            {/* Auth Button */}
            <div>
              {isAuthenticated ? (
                <button
                  onClick={() => navigate('/dashboard')}
                  className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg hover:shadow-lg transition-all"
                >
                  <User className="w-4 h-4" />
                  <span className="hidden sm:inline">{user?.email?.split('@')[0]}</span>
                  <span className="sm:hidden">Dashboard</span>
                </button>
              ) : (
                <button
                  onClick={() => navigate('/login')}
                  className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg hover:shadow-lg transition-all"
                >
                  <LogIn className="w-4 h-4" />
                  <span>Login</span>
                </button>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Hero Section */}
        <div className="text-center mb-8">
          <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-3">
            Plan Your Train Journey
          </h2>
          <p className="text-gray-600 text-lg max-w-2xl mx-auto">
            Search trains, check schedules, track live status, and book tickets - all in one place
          </p>
        </div>

        {/* Tab Navigation */}
        <div className="bg-white rounded-2xl shadow-lg mb-6 p-2">
          <div className="flex flex-wrap gap-2">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center gap-2 px-4 py-3 rounded-xl font-medium transition-all ${
                    isActive
                      ? 'bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-md'
                      : 'text-gray-600 hover:bg-gray-100'
                  }`}
                >
                  <Icon className="w-5 h-5" />
                  <span className="hidden sm:inline">{tab.label}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Active Tab Content */}
        <div className="bg-white rounded-2xl shadow-lg p-6">
          {ActiveComponent && <ActiveComponent isPublic={true} />}
        </div>

        {/* Footer */}
        <div className="mt-12 text-center">
          <p className="text-gray-500 text-sm">
            Powered by <span className="font-semibold text-blue-600">serverpe.in</span> • Mock Data for Educational Purpose
          </p>
        </div>
      </main>
    </div>
  );
};

export default HomePage;
