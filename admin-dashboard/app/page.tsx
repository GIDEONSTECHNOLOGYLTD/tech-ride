'use client';

import { useEffect, useState } from 'react';
import { BarChart3, Users, Car, DollarSign, TrendingUp, AlertCircle } from 'lucide-react';
import { dashboardAPI, driversAPI, ridesAPI } from '../src/lib/api';

export default function Dashboard() {
  const [stats, setStats] = useState<any>(null);
  const [recentRides, setRecentRides] = useState<any[]>([]);
  const [pendingDrivers, setPendingDrivers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      setLoading(true);
      const [statsRes, ridesRes, driversRes] = await Promise.all([
        dashboardAPI.getStats(),
        ridesAPI.getAll(1, 5),
        driversAPI.getAll(1, 5, 'PENDING'),
      ]);

      setStats(statsRes.data.stats);
      setRecentRides(ridesRes.data.rides);
      setPendingDrivers(driversRes.data.drivers);
    } catch (err: any) {
      console.error('Dashboard load error:', err);
      setError(err.response?.data?.error || 'Failed to load dashboard data');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
          <p className="text-gray-900 font-semibold mb-2">Failed to load dashboard</p>
          <p className="text-gray-600 mb-4">{error}</p>
          <button
            onClick={loadDashboardData}
            className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  const statCards = [
    {
      title: 'Total Rides',
      value: stats?.totalRides?.toLocaleString() || '0',
      change: '+12.5%',
      icon: BarChart3,
      color: 'bg-blue-500',
    },
    {
      title: 'Active Riders',
      value: stats?.totalUsers?.toLocaleString() || '0',
      change: '+8.2%',
      icon: Users,
      color: 'bg-green-500',
    },
    {
      title: 'Active Drivers',
      value: stats?.totalDrivers?.toLocaleString() || '0',
      change: '+5.3%',
      icon: Car,
      color: 'bg-purple-500',
    },
    {
      title: 'Revenue (₦)',
      value: `₦${(stats?.totalRevenue || 0).toLocaleString()}`,
      change: '+15.7%',
      icon: DollarSign,
      color: 'bg-orange-500',
    },
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16 items-center">
            <h1 className="text-2xl font-bold text-gray-900">🚗 Ride Admin</h1>
            <div className="flex items-center gap-4">
              <span className="text-sm text-gray-600">Admin Dashboard</span>
            </div>
          </div>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h2 className="text-3xl font-bold text-gray-900">Dashboard Overview</h2>
          <p className="text-gray-600 mt-1">Real-time analytics and platform metrics</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {statCards.map((stat, index) => (
            <div key={index} className="bg-white rounded-xl shadow-sm p-6 border border-gray-100 hover:shadow-md transition-shadow">
              <div className="flex items-center justify-between mb-4">
                <div className={`${stat.color} p-3 rounded-lg`}>
                  <stat.icon className="w-6 h-6 text-white" />
                </div>
                <span className="flex items-center text-sm font-medium text-green-600">
                  <TrendingUp className="w-4 h-4 mr-1" />
                  {stat.change}
                </span>
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-1">{stat.value}</h3>
              <p className="text-sm text-gray-600">{stat.title}</p>
            </div>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Recent Rides</h3>
            <div className="space-y-3">
              {recentRides.length > 0 ? (
                recentRides.map((ride) => (
                  <div key={ride._id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div>
                      <p className="font-medium text-gray-900">Ride #{ride._id.slice(-6)}</p>
                      <p className="text-sm text-gray-600">
                        {ride.pickupLocation?.address?.slice(0, 30)}...
                      </p>
                    </div>
                    <span
                      className={`px-3 py-1 rounded-full text-sm font-medium ${
                        ride.status === 'COMPLETED'
                          ? 'bg-green-100 text-green-700'
                          : ride.status === 'IN_PROGRESS'
                          ? 'bg-blue-100 text-blue-700'
                          : 'bg-yellow-100 text-yellow-700'
                      }`}
                    >
                      {ride.status}
                    </span>
                  </div>
                ))
              ) : (
                <p className="text-gray-500 text-center py-8">No recent rides</p>
              )}
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              Pending Approvals
              {pendingDrivers.length > 0 && (
                <span className="ml-2 px-2 py-1 bg-red-100 text-red-700 rounded-full text-xs">
                  {pendingDrivers.length}
                </span>
              )}
            </h3>
            <div className="space-y-3">
              {pendingDrivers.length > 0 ? (
                pendingDrivers.map((driver) => (
                  <div key={driver._id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-purple-100 rounded-full flex items-center justify-center">
                        <Car className="w-5 h-5 text-purple-600" />
                      </div>
                      <div>
                        <p className="font-medium text-gray-900">
                          {driver.user?.firstName} {driver.user?.lastName}
                        </p>
                        <p className="text-sm text-gray-600">
                          {driver.vehicleModel} • {driver.licensePlate}
                        </p>
                      </div>
                    </div>
                    <button
                      onClick={() => handleApproveDriver(driver._id)}
                      className="px-3 py-1 bg-blue-500 text-white rounded-lg text-sm font-medium hover:bg-blue-600"
                    >
                      Review
                    </button>
                  </div>
                ))
              ) : (
                <p className="text-gray-500 text-center py-8">No pending approvals</p>
              )}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
