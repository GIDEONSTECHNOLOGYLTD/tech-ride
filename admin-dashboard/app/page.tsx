'use client';

import { BarChart3, Users, Car, DollarSign, TrendingUp } from 'lucide-react';

export default function Dashboard() {
  const stats = [
    { title: 'Total Rides', value: '12,543', change: '+12.5%', icon: BarChart3, color: 'bg-blue-500' },
    { title: 'Active Riders', value: '8,234', change: '+8.2%', icon: Users, color: 'bg-green-500' },
    { title: 'Active Drivers', value: '1,456', change: '+5.3%', icon: Car, color: 'bg-purple-500' },
    { title: 'Revenue', value: '$45,678', change: '+15.7%', icon: DollarSign, color: 'bg-orange-500' },
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
          {stats.map((stat, index) => (
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
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div>
                    <p className="font-medium text-gray-900">Ride #{1234 + i}</p>
                    <p className="text-sm text-gray-600">John Doe → Downtown</p>
                  </div>
                  <span className="px-3 py-1 bg-green-100 text-green-700 rounded-full text-sm font-medium">
                    Completed
                  </span>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Pending Approvals</h3>
            <div className="space-y-3">
              {[1, 2, 3].map((i) => (
                <div key={i} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-purple-100 rounded-full flex items-center justify-center">
                      <Car className="w-5 h-5 text-purple-600" />
                    </div>
                    <div>
                      <p className="font-medium text-gray-900">Driver Application #{i}</p>
                      <p className="text-sm text-gray-600">Pending review</p>
                    </div>
                  </div>
                  <button className="px-3 py-1 bg-blue-500 text-white rounded-lg text-sm font-medium hover:bg-blue-600">
                    Review
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
