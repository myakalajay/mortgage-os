/**
 * @file src/pages/dashboard/borrower/application/[id]/[section].js
 * @description Dynamic Form Engine for Loan Sections
 */

import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import useSWR from 'swr';
import Link from 'next/link';
import toast from 'react-hot-toast';
import BorrowerLayout from '@/components/layouts/BorrowerLayout';
import { ArrowLeft, Save, Loader2, Check } from 'lucide-react';

const fetcher = (url) => fetch(url).then((res) => res.json());

// --- FORM CONFIGURATION ---
// This defines the "Shape" of every section
const FORM_CONFIGS = {
  property: {
    title: "Property Information",
    description: "Tell us about the home you are buying or refinancing.",
    fields: [
      { name: "address", label: "Street Address", type: "text", placeholder: "123 Maple Ave" },
      { name: "city", label: "City", type: "text" },
      { name: "state", label: "State", type: "text", width: "short" },
      { name: "zip", label: "Zip Code", type: "text", width: "short" },
      { name: "propertyType", label: "Property Type", type: "select", options: ["Single Family", "Condo", "Townhouse", "Multi-Unit"] },
      { name: "occupancy", label: "Occupancy", type: "select", options: ["Primary Residence", "Second Home", "Investment"] },
    ]
  },
  income: {
    title: "Employment & Income",
    description: "Please provide details about your current primary employment.",
    fields: [
      { name: "employerName", label: "Employer Name", type: "text", placeholder: "Acme Corp" },
      { name: "jobTitle", label: "Job Title", type: "text" },
      { name: "startDate", label: "Start Date", type: "date" },
      { name: "employmentType", label: "Type", type: "select", options: ["Full Time (W2)", "Part Time", "Self Employed", "Retired"] },
      { name: "monthlyIncome", label: "Gross Monthly Income ($)", type: "number", placeholder: "5000" },
    ]
  },
  assets: {
    title: "Assets & Savings",
    description: "List the primary bank account you will use for the down payment.",
    fields: [
      { name: "bankName", label: "Bank Name", type: "text", placeholder: "Chase, Wells Fargo, etc." },
      { name: "accountType", label: "Account Type", type: "select", options: ["Checking", "Savings", "Money Market", "401k/Retirement"] },
      { name: "accountNumber", label: "Last 4 Digits of Account", type: "text", width: "short" },
      { name: "balance", label: "Current Balance ($)", type: "number", placeholder: "25000" },
    ]
  }
};

export default function DynamicSection() {
  const router = useRouter();
  const { id, section } = router.query;
  
  const { data, mutate } = useSWR(id ? `/api/v1/loans/${id}` : null, fetcher);
  
  const [localData, setLocalData] = useState({});
  const [loading, setLoading] = useState(false);

  // Load existing data when fetched
  useEffect(() => {
    if (data?.data?.formData && section) {
      setLocalData(data.data.formData[section] || {});
    }
  }, [data, section]);

  const config = FORM_CONFIGS[section];

  if (!config) {
    return <BorrowerLayout><div className="p-10 text-center">Loading section...</div></BorrowerLayout>;
  }

  const handleChange = (e) => {
    setLocalData({ ...localData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const currentFormData = data?.data?.formData || {};
      
      // Update specific section
      const updatedFormData = {
        ...currentFormData,
        [section]: localData
      };

      const res = await fetch(`/api/v1/loans/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ formData: updatedFormData }),
      });

      if (!res.ok) throw new Error('Failed to save');

      toast.success(`${config.title} Saved`);
      router.push(`/dashboard/borrower/application/${id}`);
    } catch (err) {
      toast.error(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <BorrowerLayout>
      <div className="max-w-3xl mx-auto">
        {/* Header */}
        <div className="flex items-center mb-6">
          <Link 
            href={`/dashboard/borrower/application/${id}`}
            className="flex items-center mr-4 text-slate-500 hover:text-primary-700"
          >
            <ArrowLeft className="w-4 h-4 mr-1" /> Back
          </Link>
          <div>
            <h1 className="text-2xl font-bold text-slate-900">{config.title}</h1>
            <p className="text-sm text-slate-500">{config.description}</p>
          </div>
        </div>

        {/* Dynamic Form Card */}
        <div className="overflow-hidden bg-white border rounded-lg shadow border-slate-200">
          <form onSubmit={handleSubmit} className="p-6 space-y-6 md:p-8">
            
            <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
              {config.fields.map((field) => (
                <div key={field.name} className={field.width === 'short' ? 'md:col-span-1' : 'md:col-span-2'}>
                  <label className="block mb-1 text-sm font-medium text-slate-700">
                    {field.label}
                  </label>
                  
                  {field.type === 'select' ? (
                    <select
                      name={field.name}
                      value={localData[field.name] || ''}
                      onChange={handleChange}
                      className="input-field"
                    >
                      <option value="">Select...</option>
                      {field.options.map(opt => (
                        <option key={opt} value={opt}>{opt}</option>
                      ))}
                    </select>
                  ) : (
                    <input
                      type={field.type}
                      name={field.name}
                      placeholder={field.placeholder || ''}
                      value={localData[field.name] || ''}
                      onChange={handleChange}
                      className="input-field"
                    />
                  )}
                </div>
              ))}
            </div>

            <div className="flex justify-end pt-6 border-t border-slate-100">
               <Link href={`/dashboard/borrower/application/${id}`} className="mr-3 btn-secondary">
                 Cancel
               </Link>
               <button type="submit" disabled={loading} className="btn-primary">
                 {loading ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Save className="w-4 h-4 mr-2" />}
                 Save Section
               </button>
            </div>

          </form>
        </div>
      </div>
    </BorrowerLayout>
  );
}