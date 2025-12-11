'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Settings as SettingsIcon, Server, Database, Bell } from 'lucide-react';

export default function SettingsPage() {
  const router = useRouter();

  useEffect(() => {
    const token = localStorage.getItem('adminToken');
    if (!token) {
      router.push('/login');
    }
  }, []);

  return (
    <div className="p-8">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900">Settings</h1>
        <p className="text-gray-600">Configure your TechRide platform</p>
      </div>

      <div className="space-y-6">
        <div className="rounded-lg bg-white p-6 shadow">
          <div className="mb-4 flex items-center gap-3">
            <Server className="h-6 w-6 text-blue-600" />
            <h2 className="text-xl font-semibold">System Information</h2>
          </div>
          <div className="space-y-3">
            <div className="flex justify-between py-2 border-b">
              <span className="text-gray-600">Backend API:</span>
              <span className="font-medium">https://tech-ride.onrender.com</span>
            </div>
            <div className="flex justify-between py-2 border-b">
              <span className="text-gray-600">Admin Dashboard:</span>
              <span className="font-medium">https://techride-admin.onrender.com</span>
            </div>
            <div className="flex justify-between py-2">
              <span className="text-gray-600">Version:</span>
              <span className="font-medium">1.0.0</span>
            </div>
          </div>
        </div>

        <div className="rounded-lg bg-white p-6 shadow">
          <div className="mb-4 flex items-center gap-3">
            <Database className="h-6 w-6 text-green-600" />
            <h2 className="text-xl font-semibold">Database Status</h2>
          </div>
          <div className="space-y-3">
            <div className="flex items-center justify-between py-2">
              <span className="text-gray-600">MongoDB:</span>
              <span className="inline-flex items-center rounded-full bg-green-100 px-3 py-1 text-sm font-semibold text-green-800">
                ● Connected
              </span>
            </div>
          </div>
        </div>

        <div className="rounded-lg bg-white p-6 shadow">
          <div className="mb-4 flex items-center gap-3">
            <Bell className="h-6 w-6 text-purple-600" />
            <h2 className="text-xl font-semibold">Notifications</h2>
          </div>
          <div className="space-y-3">
            <div className="flex items-center justify-between py-2">
              <div>
                <p className="font-medium text-gray-900">Push Notifications</p>
                <p className="text-sm text-gray-600">Firebase Cloud Messaging</p>
              </div>
              <span className="text-sm text-yellow-600">⚠️  Not Configured</span>
            </div>
            <div className="flex items-center justify-between py-2">
              <div>
                <p className="font-medium text-gray-900">SMS Notifications</p>
                <p className="text-sm text-gray-600">Twilio</p>
              </div>
              <span className="inline-flex items-center rounded-full bg-green-100 px-3 py-1 text-sm font-semibold text-green-800">
                ● Configured
              </span>
            </div>
          </div>
        </div>

        <div className="rounded-lg bg-white p-6 shadow">
          <div className="mb-4 flex items-center gap-3">
            <SettingsIcon className="h-6 w-6 text-gray-600" />
            <h2 className="text-xl font-semibold">Platform Configuration</h2>
          </div>
          <div className="space-y-3">
            <div className="flex justify-between py-2 border-b">
              <span className="text-gray-600">Commission Rate:</span>
              <span className="font-medium">15%</span>
            </div>
            <div className="flex justify-between py-2 border-b">
              <span className="text-gray-600">Base Fare (Economy):</span>
              <span className="font-medium">₦500</span>
            </div>
            <div className="flex justify-between py-2 border-b">
              <span className="text-gray-600">Cost Per KM:</span>
              <span className="font-medium">₦120</span>
            </div>
            <div className="flex justify-between py-2">
              <span className="text-gray-600">Referral Reward:</span>
              <span className="font-medium">₦1,000</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
