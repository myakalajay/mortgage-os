/**
 * @file src/pages/dashboard/borrower/profile.js
 * @description Borrower Self-Service Settings
 */

import { useState } from 'react';
import useSWR from 'swr';
import toast from 'react-hot-toast';
import BorrowerLayout from '@/components/layouts/BorrowerLayout';
import { User, Save, Loader2, Lock } from 'lucide-react';

const fetcher = (url) => fetch(url).then((res) => res.json());

export default function BorrowerProfile() {
  const { data, mutate } = useSWR('/api/v1/profile', fetcher);
  const [loading, setLoading] = useState(false);
  
  const user = data?.data;

  async function handleSubmit(e) {
    e.preventDefault();
    setLoading(true);
    const formData = new FormData(e.target);
    const payload = Object.fromEntries(formData);
    
    // Remove empty password if not changing
    if (!payload.password) delete payload.password;

    try {
      const res = await fetch('/api/v1/profile', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      if (!res.ok) throw new Error('Update failed');
      
      toast.success('Profile updated successfully');
      mutate();
    } catch (err) {
      toast.error('Failed to update profile');
    } finally {
      setLoading(false);
    }
  }

  if (!user) return <BorrowerLayout><div className="p-10 text-center">Loading...</div></BorrowerLayout>;

  return (
    <BorrowerLayout>
      <div className="max-w-2xl mx-auto">
        <h1 className="flex items-center mb-6 text-2xl font-bold text-slate-900">
          <User className="w-6 h-6 mr-2 text-primary-700" />
          My Profile & Settings
        </h1>

        <div className="overflow-hidden bg-white border rounded-lg shadow border-slate-200">
          <div className="px-6 py-4 border-b bg-slate-50 border-slate-200">
            <h3 className="text-sm font-medium text-slate-900">Account Information</h3>
          </div>
          
          <form onSubmit={handleSubmit} className="p-6 space-y-6">
            <div className="grid grid-cols-2 gap-6">
              <div>
                <label className="label">First Name</label>
                <input name="firstName" defaultValue={user.firstName} className="mt-1 input-field" required />
              </div>
              <div>
                <label className="label">Last Name</label>
                <input name="lastName" defaultValue={user.lastName} className="mt-1 input-field" required />
              </div>
            </div>

            <div>
              <label className="label">Email Address</label>
              <input name="email" defaultValue={user.email} className="mt-1 input-field bg-slate-50" readOnly title="Contact support to change email" />
              <p className="mt-1 text-xs text-slate-500">To change your email, please contact support.</p>
            </div>

            <div className="pt-4 border-t border-slate-100">
              <h3 className="flex items-center mb-4 text-sm font-medium text-slate-900">
                <Lock className="w-4 h-4 mr-2 text-slate-400" /> 
                Security
              </h3>
              <div>
                <label className="label">New Password</label>
                <input 
                  name="password" 
                  type="password" 
                  placeholder="Leave blank to keep current password" 
                  className="mt-1 input-field" 
                  minLength={8}
                />
              </div>
            </div>

            <div className="flex justify-end pt-2">
              <button type="submit" disabled={loading} className="btn-primary">
                {loading ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Save className="w-4 h-4 mr-2" />}
                Save Changes
              </button>
            </div>
          </form>
        </div>
      </div>
    </BorrowerLayout>
  );
}