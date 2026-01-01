/**
 * @file src/pages/dashboard/admin/users/index.js
 * @description User Management List with Edit/Delete
 */

import { useState } from 'react';
import useSWR from 'swr';
import toast from 'react-hot-toast';
import AdminLayout from '@/components/layouts/AdminLayout';
import UserModal from '@/components/features/user-mgmt/UserModal';
import { Plus, Search, Edit2, Trash2, Shield, User, Briefcase, Loader2 } from 'lucide-react';

const fetcher = (...args) => fetch(...args).then(res => res.json());

export default function UserManagement() {
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingUser, setEditingUser] = useState(null);

  const { data, error, mutate } = useSWR(
    `/api/v1/users?page=${page}&limit=10&search=${search}`,
    fetcher
  );

  const loading = !data && !error;
  const users = data?.data || [];
  const pagination = data?.pagination || {};

  // --- ACTIONS ---

  const handleCreate = () => {
    setEditingUser(null);
    setIsModalOpen(true);
  };

  const handleEdit = (user) => {
    setEditingUser(user);
    setIsModalOpen(true);
  };

  const handleDelete = async (user) => {
    if (!window.confirm(`Are you sure you want to permanently delete ${user.email}? This action cannot be undone.`)) {
      return;
    }

    try {
      const res = await fetch(`/api/v1/users/${user.id}`, {
        method: 'DELETE',
      });
      
      const responseData = await res.json();
      
      if (!res.ok) throw new Error(responseData.error?.message || 'Delete failed');

      toast.success('User deleted successfully');
      mutate(); // Refresh the list immediately
    } catch (err) {
      toast.error(err.message);
    }
  };

  // --- RENDER HELPERS ---

  const RoleIcon = ({ role }) => {
    if (role === 'SUPER_ADMIN') return <Shield className="w-4 h-4 text-purple-600" />;
    if (role === 'LENDER') return <Briefcase className="w-4 h-4 text-blue-600" />;
    return <User className="w-4 h-4 text-slate-500" />;
  };

  const StatusBadge = ({ status }) => {
    const styles = {
      ACTIVE: 'bg-green-100 text-green-800',
      INACTIVE: 'bg-slate-100 text-slate-800',
      LOCKED: 'bg-red-100 text-red-800',
      SUSPENDED: 'bg-orange-100 text-orange-800',
      PENDING_VERIFICATION: 'bg-yellow-100 text-yellow-800'
    };
    return (
      <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${styles[status] || styles.INACTIVE}`}>
        {status.replace('_', ' ')}
      </span>
    );
  };

  return (
    <AdminLayout>
      <div className="justify-between sm:flex sm:items-center">
        <div>
          <h1 className="text-2xl font-semibold text-slate-900">User Management</h1>
          <p className="mt-2 text-sm text-slate-700">
            Manage system access, reset passwords, and audit user roles.
          </p>
        </div>
        <button onClick={handleCreate} className="mt-4 btn-primary sm:mt-0">
          <Plus className="w-4 h-4 mr-2" />
          Add User
        </button>
      </div>

      {/* Toolbar */}
      <div className="flex flex-col gap-4 mt-6 sm:flex-row">
        <div className="relative w-full max-w-md rounded-md shadow-sm">
          <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
            <Search className="w-4 h-4 text-slate-400" />
          </div>
          <input
            type="text"
            className="pl-10 input-field"
            placeholder="Search users..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
      </div>

      {/* Table */}
      <div className="flex flex-col mt-6">
        <div className="-mx-4 -my-2 overflow-x-auto sm:-mx-6 lg:-mx-8">
          <div className="inline-block min-w-full py-2 align-middle md:px-6 lg:px-8">
            <div className="overflow-hidden bg-white shadow ring-1 ring-black ring-opacity-5 md:rounded-lg">
              <table className="min-w-full divide-y divide-slate-300">
                <thead className="bg-slate-50">
                  <tr>
                    <th className="px-3 py-3.5 text-left text-sm font-semibold text-slate-900">User Profile</th>
                    <th className="px-3 py-3.5 text-left text-sm font-semibold text-slate-900">Role</th>
                    <th className="px-3 py-3.5 text-left text-sm font-semibold text-slate-900">Status</th>
                    <th className="px-3 py-3.5 text-left text-sm font-semibold text-slate-900">Last Login</th>
                    <th className="relative py-3.5 pl-3 pr-4 sm:pr-6"><span className="sr-only">Actions</span></th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-slate-200">
                  {loading ? (
                    <tr><td colSpan="5" className="px-3 py-10 text-center"><Loader2 className="w-6 h-6 mx-auto animate-spin text-primary-600"/></td></tr>
                  ) : users.length === 0 ? (
                    <tr><td colSpan="5" className="px-3 py-10 text-center text-slate-500">No users found matching your search.</td></tr>
                  ) : (
                    users.map((user) => (
                      <tr key={user.id} className="transition-colors hover:bg-slate-50">
                        <td className="px-3 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            <div className="flex items-center justify-center w-8 h-8 mr-3 text-xs font-bold rounded-full bg-slate-100 text-slate-500">
                              {user.firstName[0]}{user.lastName[0]}
                            </div>
                            <div>
                              <div className="font-medium text-slate-900">{user.firstName} {user.lastName}</div>
                              <div className="text-xs text-slate-500">{user.email}</div>
                            </div>
                          </div>
                        </td>
                        <td className="px-3 py-4 text-sm whitespace-nowrap text-slate-500">
                          <div className="flex items-center gap-2">
                            <RoleIcon role={user.role} />
                            <span className="text-xs capitalize">{user.role.toLowerCase().replace('_', ' ')}</span>
                          </div>
                        </td>
                        <td className="px-3 py-4 text-sm whitespace-nowrap">
                          <StatusBadge status={user.status} />
                        </td>
                        <td className="px-3 py-4 text-xs whitespace-nowrap text-slate-500">
                          {user.lastLoginAt ? new Date(user.lastLoginAt).toLocaleDateString() : 'Never'}
                        </td>
                        <td className="relative py-4 pl-3 pr-4 text-sm font-medium text-right whitespace-nowrap sm:pr-6">
                          <div className="flex justify-end gap-3">
                            <button onClick={() => handleEdit(user)} className="text-primary-600 hover:text-primary-900" title="Edit User">
                              <Edit2 className="w-4 h-4" />
                            </button>
                            {/* Protection: Don't allow deleting Super Admins (optional UI safety) */}
                            {user.role !== 'SUPER_ADMIN' && (
                               <button onClick={() => handleDelete(user)} className="text-red-400 hover:text-red-600" title="Delete User">
                                 <Trash2 className="w-4 h-4" />
                               </button>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
              
              {/* Pagination Controls */}
              <div className="flex items-center justify-between px-4 py-3 border-t bg-slate-50 border-slate-200 sm:px-6">
                 <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1} className="py-1 text-xs btn-secondary">Previous</button>
                 <span className="text-xs text-slate-500">Page {page} of {pagination.totalPages || 1}</span>
                 <button onClick={() => setPage(p => p + 1)} disabled={page >= pagination.totalPages} className="py-1 text-xs btn-secondary">Next</button>
              </div>
            </div>
          </div>
        </div>
      </div>

      <UserModal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
        mutate={mutate} 
        userToEdit={editingUser} 
      />
    </AdminLayout>
  );
}