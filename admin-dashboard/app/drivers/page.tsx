'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { CheckCircle, XCircle, Eye, Search } from 'lucide-react';
import { driversAPI } from '../../src/lib/api';

export default function DriversPage() {
  const router = useRouter();
  const [drivers, setDrivers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('ALL');
  const [search, setSearch] = useState('');

  useEffect(() => {
    const token = localStorage.getItem('adminToken');
    if (!token) {
      router.push('/login');
      return;
    }
    loadDrivers();
  }, [filter]);

  const loadDrivers = async () => {
    try {
      setLoading(true);
      const status = filter === 'ALL' ? undefined : filter;
      const res = await driversAPI.getAll(1, 50, status);
      setDrivers(res.data.drivers);
    } catch (err: any) {
      if (err.response?.status === 401) {
        router.push('/login');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async (driverId: string) => {
    try {
      await driversAPI.approve(driverId);
      loadDrivers();
    } catch (err) {
      alert('Failed to approve driver');
    }
  };

  const handleReject = async (driverId: string) => {
    const reason = prompt('Enter rejection reason:');
    if (!reason) return;
    try {
      await driversAPI.reject(driverId, reason);
      loadDrivers();
    } catch (err) {
      alert('Failed to reject driver');
    }
  };

  const filteredDrivers = drivers.filter((driver) =>
    search ? 
      driver.userId?.firstName?.toLowerCase().includes(search.toLowerCase()) ||
      driver.userId?.phoneNumber?.includes(search) ||
      driver.licensePlate?.toLowerCase().includes(search.toLowerCase())
      : true
  );

  return (
    <div className="p-8">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900">Driver Management</h1>
        <p className="text-gray-600">Approve, reject, and manage drivers</p>
      </div>

      <div className="mb-6 flex gap-4">
        <div className="flex-1">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Search by name, phone, or license plate..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full rounded-lg border border-gray-300 py-2 pl-10 pr-4 focus:border-blue-500 focus:outline-none"
            />
          </div>
        </div>

        <select
          value={filter}
          onChange={(e) => setFilter(e.target.value)}
          className="rounded-lg border border-gray-300 px-4 py-2 focus:border-blue-500 focus:outline-none"
        >
          <option value="ALL">All Drivers</option>
          <option value="PENDING">Pending</option>
          <option value="APPROVED">Approved</option>
          <option value="REJECTED">Rejected</option>
        </select>
      </div>

      {loading ? (
        <div className="flex h-64 items-center justify-center">
          <div className="text-gray-500">Loading drivers...</div>
        </div>
      ) : (
        <div className="overflow-hidden rounded-lg bg-white shadow">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                  Driver
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                  Vehicle
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                  Rating
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 bg-white">
              {filteredDrivers.map((driver) => (
                <tr key={driver._id}>
                  <td className="whitespace-nowrap px-6 py-4">
                    <div>
                      <div className="font-medium text-gray-900">
                        {driver.userId?.firstName} {driver.userId?.lastName}
                      </div>
                      <div className="text-sm text-gray-500">{driver.userId?.phoneNumber}</div>
                    </div>
                  </td>
                  <td className="whitespace-nowrap px-6 py-4">
                    <div>
                      <div className="text-sm text-gray-900">
                        {driver.vehicleMake} {driver.vehicleModel}
                      </div>
                      <div className="text-sm text-gray-500">{driver.licensePlate}</div>
                    </div>
                  </td>
                  <td className="whitespace-nowrap px-6 py-4">
                    <span
                      className={`inline-flex rounded-full px-2 py-1 text-xs font-semibold ${
                        driver.verificationStatus === 'APPROVED'
                          ? 'bg-green-100 text-green-800'
                          : driver.verificationStatus === 'REJECTED'
                          ? 'bg-red-100 text-red-800'
                          : 'bg-yellow-100 text-yellow-800'
                      }`}
                    >
                      {driver.verificationStatus}
                    </span>
                  </td>
                  <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-900">
                    {driver.rating?.toFixed(1) || 'N/A'}
                  </td>
                  <td className="whitespace-nowrap px-6 py-4 text-sm">
                    <div className="flex gap-2">
                      {driver.verificationStatus === 'PENDING' && (
                        <>
                          <button
                            onClick={() => handleApprove(driver._id)}
                            className="inline-flex items-center rounded-md bg-green-600 px-3 py-1 text-white hover:bg-green-700"
                          >
                            <CheckCircle className="mr-1 h-4 w-4" />
                            Approve
                          </button>
                          <button
                            onClick={() => handleReject(driver._id)}
                            className="inline-flex items-center rounded-md bg-red-600 px-3 py-1 text-white hover:bg-red-700"
                          >
                            <XCircle className="mr-1 h-4 w-4" />
                            Reject
                          </button>
                        </>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {filteredDrivers.length === 0 && (
            <div className="py-12 text-center text-gray-500">
              No drivers found
            </div>
          )}
        </div>
      )}
    </div>
  );
}
