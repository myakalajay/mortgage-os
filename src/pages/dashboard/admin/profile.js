import { useState } from 'react';
import useSWR from 'swr';
import toast from 'react-hot-toast';
import AdminLayout from '@/components/layouts/AdminLayout';
import { User, Save, Loader2 } from 'lucide-react';

const fetcher = (url) => fetch(url).then((res) => res.json());

export default function AdminProfile() {
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

  if (!user) return <AdminLayout>Loading...</AdminLayout>;

  return (
    <AdminLayout>
      <div className="max-w-2xl mx-auto">
        <h1 className="flex items-center mb-6 text-2xl font-bold text-slate-900">
          <User className="w-6 h-6 mr-2 text-primary-700" />
          My Profile
        </h1>

        <div className="p-6 bg-white rounded-lg shadow">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-slate-700">First Name</label>
                <input name="firstName" defaultValue={user.firstName} className="mt-1 input-field" />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700">Last Name</label>
                <input name="lastName" defaultValue={user.lastName} className="mt-1 input-field" />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700">Email Address</label>
              <input name="email" defaultValue={user.email} className="mt-1 input-field" />
            </div>

            <div className="pt-4 border-t border-slate-200">
              <h3 className="mb-2 text-sm font-medium text-slate-900">Security</h3>
              <label className="block text-sm font-medium text-slate-700">New Password</label>
              <input 
                name="password" 
                type="password" 
                placeholder="Leave blank to keep current password" 
                className="mt-1 input-field" 
              />
            </div>

            <div className="flex justify-end">
              <button type="submit" disabled={loading} className="btn-primary">
                {loading ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Save className="w-4 h-4 mr-2" />}
                Save Changes
              </button>
            </div>
          </form>
        </div>
      </div>
    </AdminLayout>
  );
}