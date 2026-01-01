/**
 * @file src/pages/dashboard/borrower/application/[id]/personal.js
 * @description Loan Section: Personal Information
 */

import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import useSWR from 'swr';
import toast from 'react-hot-toast';
import BorrowerLayout from '@/components/layouts/BorrowerLayout';
import { ArrowLeft, Save, Loader2 } from 'lucide-react';
import Link from 'next/link';

const fetcher = (url) => fetch(url).then((res) => res.json());

export default function PersonalInfo() {
  const router = useRouter();
  const { id } = router.query;
  const { data, error, mutate } = useSWR(id ? `/api/v1/loans/${id}` : null, fetcher);

  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    phone: '',
    ssn: '', // In production, handle this securely!
    dob: '',
    maritalStatus: 'SINGLE',
    currentAddress: '',
    yearsAtAddress: ''
  });

  // Load existing data if available
  useEffect(() => {
    if (data?.data?.formData?.personal) {
      setFormData(data.data.formData.personal);
    }
  }, [data]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      // 1. Get current form data from DB to ensure we don't overwrite other sections
      const currentJson = data?.data?.formData || {};
      
      // 2. Merge new "personal" data
      const updatedJson = {
        ...currentJson,
        personal: formData
      };

      // 3. Send update
      const res = await fetch(`/api/v1/loans/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ formData: updatedJson }),
      });

      if (!res.ok) throw new Error('Failed to save');

      toast.success('Personal info saved');
      router.push(`/dashboard/borrower/application/${id}`); // Go back to Hub
    } catch (err) {
      toast.error(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  if (!data) return <BorrowerLayout>Loading...</BorrowerLayout>;

  return (
    <BorrowerLayout>
      <div className="max-w-3xl mx-auto">
        {/* Navigation Header */}
        <div className="flex items-center mb-6">
          <Link 
            href={`/dashboard/borrower/application/${id}`}
            className="flex items-center mr-4 text-slate-500 hover:text-primary-700"
          >
            <ArrowLeft className="w-4 h-4 mr-1" /> Back
          </Link>
          <h1 className="text-2xl font-bold text-slate-900">Personal Information</h1>
        </div>

        <div className="overflow-hidden bg-white rounded-lg shadow">
          <form onSubmit={handleSubmit} className="p-6 space-y-6 md:p-8">
            
            <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
              <div>
                <label className="label">Phone Number</label>
                <input 
                  name="phone" 
                  type="tel" 
                  required
                  placeholder="(555) 123-4567"
                  className="mt-1 input-field"
                  value={formData.phone}
                  onChange={handleChange}
                />
              </div>
              <div>
                <label className="label">Date of Birth</label>
                <input 
                  name="dob" 
                  type="date" 
                  required
                  className="mt-1 input-field"
                  value={formData.dob}
                  onChange={handleChange}
                />
              </div>
            </div>

            <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
              <div>
                <label className="label">Social Security Number</label>
                <input 
                  name="ssn" 
                  type="password" 
                  placeholder="XXX-XX-XXXX"
                  className="mt-1 input-field"
                  value={formData.ssn}
                  onChange={handleChange}
                />
                <p className="mt-1 text-xs text-slate-500">Encrypted at rest.</p>
              </div>
              <div>
                <label className="label">Marital Status</label>
                <select 
                  name="maritalStatus" 
                  className="mt-1 input-field"
                  value={formData.maritalStatus}
                  onChange={handleChange}
                >
                  <option value="SINGLE">Unmarried</option>
                  <option value="MARRIED">Married</option>
                  <option value="SEPARATED">Separated</option>
                </select>
              </div>
            </div>

            <hr className="border-slate-100" />

            <div>
              <label className="label">Current Home Address</label>
              <input 
                name="currentAddress" 
                type="text" 
                required
                placeholder="123 Main St, City, State, Zip"
                className="mt-1 input-field"
                value={formData.currentAddress}
                onChange={handleChange}
              />
            </div>

            <div>
              <label className="label">Years at this address</label>
              <input 
                name="yearsAtAddress" 
                type="number" 
                min="0"
                step="0.1"
                required
                className="w-32 mt-1 input-field"
                value={formData.yearsAtAddress}
                onChange={handleChange}
              />
            </div>

            <div className="flex justify-end pt-6">
              <button type="submit" disabled={loading} className="btn-primary">
                {loading ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Save className="w-4 h-4 mr-2" />}
                Save & Continue
              </button>
            </div>

          </form>
        </div>
      </div>
    </BorrowerLayout>
  );
}