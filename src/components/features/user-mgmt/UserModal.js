/**
 * @file src/components/features/user-mgmt/UserModal.js
 * @description Modal for Creating, Editing, and Password Resets
 */

import { useState, useEffect } from 'react';
import { X, Loader2, Save, KeyRound } from 'lucide-react';
import toast from 'react-hot-toast';

export default function UserModal({ isOpen, onClose, mutate, userToEdit = null }) {
  const [loading, setLoading] = useState(false);
  const [showPasswordReset, setShowPasswordReset] = useState(false);
  
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    role: 'BORROWER',
    status: 'ACTIVE'
  });

  useEffect(() => {
    if (userToEdit) {
      setFormData({
        firstName: userToEdit.firstName,
        lastName: userToEdit.lastName,
        email: userToEdit.email,
        role: userToEdit.role,
        status: userToEdit.status,
        password: '', 
      });
      setShowPasswordReset(false); // Reset toggle on open
    } else {
      setFormData({
        firstName: '', lastName: '', email: '', password: '', role: 'BORROWER', status: 'ACTIVE'
      });
      setShowPasswordReset(true); // Always show password for new users
    }
  }, [userToEdit, isOpen]);

  if (!isOpen) return null;

  async function handleSubmit(e) {
    e.preventDefault();
    setLoading(true);

    try {
      const isEdit = !!userToEdit;
      const url = isEdit ? `/api/v1/users/${userToEdit.id}` : '/api/v1/users';
      const method = isEdit ? 'PUT' : 'POST';

      const payload = { ...formData };
      
      // If editing and password field is empty, remove it so we don't overwrite with ""
      if (isEdit && !payload.password) delete payload.password;

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error?.message || 'Operation failed');

      toast.success(isEdit ? 'User updated successfully' : 'User created successfully');
      mutate();
      onClose();
    } catch (err) {
      toast.error(err.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm">
      <div className="w-full max-w-md overflow-hidden bg-white rounded-lg shadow-xl">
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 bg-slate-50">
          <h3 className="text-lg font-medium text-slate-900">
            {userToEdit ? 'Edit User Details' : 'Create New User'}
          </h3>
          <button onClick={onClose}><X className="w-5 h-5 text-slate-400 hover:text-slate-600" /></button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-700">First Name</label>
              <input required type="text" className="mt-1 input-field" value={formData.firstName} onChange={(e) => setFormData({ ...formData, firstName: e.target.value })} />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700">Last Name</label>
              <input required type="text" className="mt-1 input-field" value={formData.lastName} onChange={(e) => setFormData({ ...formData, lastName: e.target.value })} />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700">Email</label>
            <input required type="email" className="mt-1 input-field" value={formData.email} onChange={(e) => setFormData({ ...formData, email: e.target.value })} />
          </div>

          {/* Password Logic: Always show for Create, Toggle for Edit */}
          <div className="pt-4 mt-2 border-t border-slate-100">
            {!userToEdit ? (
              <div>
                <label className="block text-sm font-medium text-slate-700">Assign Password</label>
                <input required type="password" className="mt-1 input-field" value={formData.password} onChange={(e) => setFormData({ ...formData, password: e.target.value })} />
              </div>
            ) : (
              <div>
                <button 
                  type="button" 
                  onClick={() => setShowPasswordReset(!showPasswordReset)}
                  className="flex items-center text-sm font-medium text-primary-700 hover:underline"
                >
                  <KeyRound className="w-4 h-4 mr-1" />
                  {showPasswordReset ? 'Cancel Password Reset' : 'Reset User Password'}
                </button>
                {showPasswordReset && (
                  <div className="mt-2 animate-in fade-in slide-in-from-top-1">
                    <label className="block text-sm font-medium text-slate-700">New Password</label>
                    <input type="password" className="mt-1 input-field" placeholder="Enter new password" value={formData.password} onChange={(e) => setFormData({ ...formData, password: e.target.value })} />
                  </div>
                )}
              </div>
            )}
          </div>

          <div className="grid grid-cols-2 gap-4 pt-4 border-t border-slate-100">
            <div>
              <label className="block text-sm font-medium text-slate-700">Role</label>
              <select className="mt-1 input-field" value={formData.role} onChange={(e) => setFormData({ ...formData, role: e.target.value })}>
                <option value="BORROWER">Borrower</option>
                <option value="LENDER">Lender</option>
                <option value="SUPER_ADMIN">Super Admin</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700">Account Status</label>
              <select className="mt-1 input-field" value={formData.status} onChange={(e) => setFormData({ ...formData, status: e.target.value })}>
                <option value="ACTIVE">Active</option>
                <option value="PENDING_VERIFICATION">Pending</option>
                <option value="LOCKED">Locked</option>
                <option value="SUSPENDED">Suspended</option>
              </select>
            </div>
          </div>

          <div className="flex justify-end gap-3 mt-6">
            <button type="button" onClick={onClose} className="btn-secondary">Cancel</button>
            <button type="submit" disabled={loading} className="btn-primary">
              {loading ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Save className="w-4 h-4 mr-2" />}
              {userToEdit ? 'Update User' : 'Create User'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}