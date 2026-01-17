import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { masterApi, healthApi } from '../services/api';
import toast from 'react-hot-toast';
import logo from '../images/logo.jpeg';
import {
  Train,
  Search,
  Ticket,
  FileText,
  ArrowRight,
  MapPin,
  Clock,
  TrendingUp,
  CheckCircle2,
  AlertCircle,
} from 'lucide-react';

const Dashboard = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [stats, setStats] = useState({
    stations: 0,
    coachTypes: 0,
    reservationTypes: 0,
  });
  const [apiStatus, setApiStatus] = useState('checking');
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      try {
        // Check API health
        const healthResponse = await healthApi.check();
        setApiStatus(healthResponse.status === 'healthy' ? 'healthy' : 'unhealthy');

        // Fetch master data counts
        const [stationsRes, coachTypesRes, reservationTypesRes] = await Promise.all([
          masterApi.getStations(),
          masterApi.getCoachTypes(),
          masterApi.getReservationTypes(),
        ]);

        setStats({
          stations: stationsRes.data?.stations?.length || 0,
          coachTypes: coachTypesRes.data?.coach_types?.length || 0,
          reservationTypes: reservationTypesRes.data?.reservation_types?.length || 0,
        });
      } catch (error) {
        console.error('Error fetching data:', error);
        setApiStatus('unhealthy');
        toast.error('Failed to connect to server');
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, []);

  const quickActions = [
    {
      title: 'Search Trains',
      description: 'Find trains between stations',
      icon: Search,
      path: '/search',
      color: 'primary',
    },
    {
      title: 'My Bookings',
      description: 'View your booking history',
      icon: Ticket,
      path: '/dashboard/bookings',
      color: 'green',
    },
    {
      title: 'PNR Status',
      description: 'Check your ticket status',
      icon: FileText,
      path: '/pnr',
      color: 'purple',
    },
  ];

  const features = [
    {
      icon: MapPin,
      title: `${stats.stations}+ Stations`,
      description: 'Connected across the network',
    },
    {
      icon: Train,
      title: `${stats.coachTypes} Coach Types`,
      description: 'From sleeper to first class',
    },
    {
      icon: Clock,
      title: 'Real-time Updates',
      description: 'Live train tracking',
    },
    {
      icon: TrendingUp,
      title: `${stats.reservationTypes} Booking Types`,
      description: 'General, Tatkal & more',
    },
  ];

  const getColorClasses = (color) => {
    const colors = {
      primary: {
        bg: 'bg-primary-50',
        text: 'text-primary-600',
        icon: 'bg-primary-100',
        hover: 'hover:border-primary-200',
      },
      green: {
        bg: 'bg-green-50',
        text: 'text-green-600',
        icon: 'bg-green-100',
        hover: 'hover:border-green-200',
      },
      purple: {
        bg: 'bg-purple-50',
        text: 'text-purple-600',
        icon: 'bg-purple-100',
        hover: 'hover:border-purple-200',
      },
    };
    return colors[color] || colors.primary;
  };

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Welcome Section */}
      <div className="relative overflow-hidden rounded-2xl gradient-bg p-8 text-white">
        <div className="relative z-10">
          <h1 className="text-3xl font-bold mb-2">
            Welcome, {user?.email?.split('@')[0] || 'Traveler'}! 🚆
          </h1>
          <p className="text-white/80 text-lg max-w-xl">
            Ready to plan your next journey? Search for trains, book tickets, and
            manage your reservations all in one place.
          </p>

          {/* API Status Badge */}
          <div className="mt-6 inline-flex items-center gap-2 px-4 py-2 bg-white/10 backdrop-blur-sm rounded-full">
            {apiStatus === 'checking' ? (
              <>
                <div className="w-2 h-2 bg-yellow-400 rounded-full animate-pulse" />
                <span className="text-sm">Checking server status...</span>
              </>
            ) : apiStatus === 'healthy' ? (
              <>
                <CheckCircle2 className="w-4 h-4 text-green-400" />
                <span className="text-sm">All systems operational</span>
              </>
            ) : (
              <>
                <AlertCircle className="w-4 h-4 text-red-400" />
                <span className="text-sm">Server connection issue</span>
              </>
            )}
          </div>
        </div>

        {/* Decorative Elements */}
        <div className="absolute top-4 right-4 opacity-20">
          <img 
            src={logo} 
            alt="QuickSmart Train Logo" 
            className="w-16 h-16 rounded-xl object-contain"
            onError={(e) => {
              e.target.style.display = 'none';
            }}
          />
        </div>
        <div className="absolute top-0 right-0 opacity-10">
          <Train className="w-64 h-64 -mt-16 -mr-16" />
        </div>
        <div className="absolute bottom-0 left-0 w-96 h-96 bg-white/5 rounded-full -mb-48 -ml-48" />
      </div>

      {/* Quick Actions */}
      <div>
        <h2 className="text-xl font-bold text-gray-900 mb-4">Quick Actions</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {quickActions.map((action) => {
            const colors = getColorClasses(action.color);
            return (
              <button
                key={action.path}
                onClick={() => navigate(action.path)}
                className={`card-hover text-left group border-2 border-transparent ${colors.hover} transition-all`}
              >
                <div className="flex items-start gap-4">
                  <div className={`p-3 ${colors.icon} rounded-xl`}>
                    <action.icon className={`w-6 h-6 ${colors.text}`} />
                  </div>
                  <div className="flex-1">
                    <h3 className="font-semibold text-gray-900 group-hover:text-gray-700">
                      {action.title}
                    </h3>
                    <p className="text-sm text-gray-500 mt-1">{action.description}</p>
                  </div>
                  <ArrowRight className="w-5 h-5 text-gray-300 group-hover:text-gray-400 group-hover:translate-x-1 transition-all mt-1" />
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Stats Grid */}
      <div>
        <h2 className="text-xl font-bold text-gray-900 mb-4">Platform Overview</h2>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {features.map((feature, index) => (
            <div
              key={index}
              className="card text-center group hover:shadow-md transition-shadow"
            >
              <div className="inline-flex items-center justify-center w-12 h-12 bg-primary-50 rounded-xl mb-3 group-hover:scale-110 transition-transform">
                <feature.icon className="w-6 h-6 text-primary-600" />
              </div>
              <h3 className="font-semibold text-gray-900">
                {isLoading ? (
                  <span className="inline-block w-16 h-5 bg-gray-200 rounded animate-pulse" />
                ) : (
                  feature.title
                )}
              </h3>
              <p className="text-sm text-gray-500 mt-1">{feature.description}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Help Section */}
      <div className="card bg-gradient-to-r from-gray-50 to-gray-100 border-none">
        <div className="flex flex-col md:flex-row items-center justify-between gap-4">
          <div>
            <h3 className="text-lg font-semibold text-gray-900">
              Need help booking your ticket?
            </h3>
            <p className="text-gray-600 mt-1">
              Our search feature makes it easy to find the perfect train for your journey.
            </p>
          </div>
          <button
            onClick={() => navigate('/search')}
            className="btn-primary whitespace-nowrap"
          >
            Start Searching
          </button>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
