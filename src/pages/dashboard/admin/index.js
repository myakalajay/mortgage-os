/**
 * @file src/pages/dashboard/admin/index.js
 * @description Admin Dashboard with Stats and User Management
 */

import useSWR from 'swr';
import AdminLayout from '@/components/layouts/AdminLayout';
import { Users, FileText, DollarSign, Trash2 } from 'lucide-react';
import toast from 'react-hot-toast';

const fetcher = (url) => fetch(url).then((res) => res.json());

export default function AdminDashboard() {
  const { data: userData, mutate } = useSWR('/api/v1/admin/users', fetcher);
  const { data: statsData } = useSWR('/api/v1/admin/stats', fetcher); // <--- NEW STATS FETCH

  const users = userData?.data || [];
  const stats = statsData?.data || { totalUsers: 0, totalLoans: 0, totalVolume: 0 };

  const handleDelete = async (userId) => {
    if (!confirm('Are you sure? This will delete the user and all their loans.')) return;
    try {
      await fetch(`/api/v1/admin/users?id=${userId}`, { method: 'DELETE' });
      toast.success('User deleted');
      mutate();
    } catch (e) { toast.error('Error deleting user'); }
  };

  return (
    <AdminLayout>
      <h1 className="mb-8 text-2xl font-bold text-slate-900">System Overview</h1>

      {/* STATS CARDS */}
      <div className="grid grid-cols-1 gap-6 mb-8 md:grid-cols-3">
        <div className="flex items-center p-6 bg-white border rounded-lg shadow border-slate-200">
          <div className="p-3 mr-4 text-blue-600 bg-blue-100 rounded-full">
            <Users className="w-6 h-6" />
          </div>
          <div>
            <p className="text-sm font-medium text-slate-500">Total Users</p>
            <p className="text-2xl font-bold text-slate-900">{stats.totalUsers}</p>
          </div>
        </div>
        <div className="flex items-center p-6 bg-white border rounded-lg shadow border-slate-200">
          <div className="p-3 mr-4 text-purple-600 bg-purple-100 rounded-full">
            <FileText className="w-6 h-6" />
          </div>
          <div>
            <p className="text-sm font-medium text-slate-500">Total Applications</p>
            <p className="text-2xl font-bold text-slate-900">{stats.totalLoans}</p>
          </div>
        </div>
        <div className="flex items-center p-6 bg-white border rounded-lg shadow border-slate-200">
          <div className="p-3 mr-4 text-green-600 bg-green-100 rounded-full">
            <DollarSign className="w-6 h-6" />
          </div>
          <div>
            <p className="text-sm font-medium text-slate-500">Pipeline Volume</p>
            <p className="text-2xl font-bold text-slate-900">
              ${(stats.totalVolume / 1000000).toFixed(1)}M
            </p>
          </div>
        </div>
      </div>

      {/* USER TABLE (Existing Logic) */}
      <div className="overflow-hidden bg-white border rounded-lg shadow border-slate-200">
        <div className="px-6 py-4 border-b border-slate-200 bg-slate-50">
          <h3 className="text-lg font-medium text-slate-900">User Management</h3>
        </div>
        <table className="min-w-full divide-y divide-slate-200">
          <thead className="bg-white">
            <tr>
              <th className="px-6 py-3 text-xs font-medium text-left uppercase text-slate-500">User</th>
              <th className="px-6 py-3 text-xs font-medium text-left uppercase text-slate-500">Role</th>
              <th className="px-6 py-3 text-xs font-medium text-left uppercase text-slate-500">Joined</th>
              <th className="px-6 py-3 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-slate-200">
            {users.map((u) => (
              <tr key={u.id} className="hover:bg-slate-50">
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="font-medium text-slate-900">{u.firstName} {u.lastName}</div>
                  <div className="text-sm text-slate-500">{u.email}</div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                    u.role === 'SUPER_ADMIN' ? 'bg-red-100 text-red-800' : 
                    u.role === 'LENDER' ? 'bg-purple-100 text-purple-800' : 'bg-green-100 text-green-800'
                  }`}>
                    {u.role}
                  </span>
                </td>
                <td className="px-6 py-4 text-sm whitespace-nowrap text-slate-500">
                  {new Date(u.createdAt).toLocaleDateString()}
                </td>
                <td className="px-6 py-4 text-sm font-medium text-right whitespace-nowrap">
                  {u.role !== 'SUPER_ADMIN' && (
                    <button onClick={() => handleDelete(u.id)} className="text-red-600 hover:text-red-900">
                      <Trash2 className="w-4 h-4" />
                    </button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </AdminLayout>
  );
}