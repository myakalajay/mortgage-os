/**
 * @file src/pages/dashboard/borrower/application/new.js
 * @description Initialize a new Loan Application
 */

import { useState } from 'react';
import { useRouter } from 'next/router';
import BorrowerLayout from '@/components/layouts/BorrowerLayout';
import { Home, DollarSign, Loader2, ArrowRight } from 'lucide-react';
import toast from 'react-hot-toast';

export default function NewApplication() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  
  // US States List (Simplified)
  const STATES = ["AL","AK","AZ","AR","CA","CO","CT","DE","FL","GA","HI","ID","IL","IN","IA","KS","KY","LA","ME","MD","MA","MI","MN","MS","MO","MT","NE","NV","NH","NJ","NM","NY","NC","ND","OH","OK","OR","PA","RI","SC","SD","TN","TX","UT","VT","VA","WA","WV","WI","WY"];

  async function handleSubmit(e) {
    e.preventDefault();
    setLoading(true);

    const formData = {
      loanType: e.target.loanType.value,
      propertyState: e.target.propertyState.value,
      estimatedValue: Number(e.target.estimatedValue.value),
    };

    try {
      const res = await fetch('/api/v1/loans', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      const data = await res.json();

      if (!res.ok) {
        // Handle "Already has active loan" conflict specially
        if (res.status === 409) {
          toast.error("You already have an active application.");
          router.push('/dashboard/borrower');
          return;
        }
        throw new Error(data.error?.message || 'Failed to start application');
      }

      toast.success('Application started successfully!');
      // Redirect to the detailed application view (Not built yet, so go to dashboard for now)
      router.push('/dashboard/borrower');
      
    } catch (err) {
      toast.error(err.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <BorrowerLayout>
      <div className="max-w-2xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-slate-900">Let's get started</h1>
          <p className="mt-2 text-slate-600">
            Tell us a little about what you are looking to do. This creates your loan file.
          </p>
        </div>

        <div className="overflow-hidden bg-white rounded-lg shadow">
          <form onSubmit={handleSubmit} className="p-6 space-y-6 sm:p-8">
            
            {/* 1. Loan Goal */}
            <div>
              <label className="block mb-2 text-sm font-medium text-slate-700">What is your goal?</label>
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <label className="relative flex flex-col p-4 bg-white border rounded-lg cursor-pointer border-slate-200 hover:border-primary-500 focus-within:ring-2 focus-within:ring-primary-500">
                  <input type="radio" name="loanType" value="PURCHASE" className="sr-only peer" defaultChecked required />
                  <span className="font-semibold text-slate-900 peer-checked:text-primary-700">Buy a Home</span>
                  <span className="mt-1 text-sm text-slate-500">I want to purchase a new property.</span>
                  <div className="absolute w-4 h-4 border rounded-full top-4 right-4 border-slate-300 peer-checked:border-primary-600 peer-checked:bg-primary-600"></div>
                </label>

                <label className="relative flex flex-col p-4 bg-white border rounded-lg cursor-pointer border-slate-200 hover:border-primary-500 focus-within:ring-2 focus-within:ring-primary-500">
                  <input type="radio" name="loanType" value="REFINANCE" className="sr-only peer" />
                  <span className="font-semibold text-slate-900 peer-checked:text-primary-700">Refinance</span>
                  <span className="mt-1 text-sm text-slate-500">I own a home and want a better rate.</span>
                  <div className="absolute w-4 h-4 border rounded-full top-4 right-4 border-slate-300 peer-checked:border-primary-600 peer-checked:bg-primary-600"></div>
                </label>
              </div>
            </div>

            {/* 2. Property Location */}
            <div>
              <label htmlFor="propertyState" className="block text-sm font-medium text-slate-700">Property State</label>
              <div className="relative mt-1 rounded-md shadow-sm">
                <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                  <Home className="w-5 h-5 text-slate-400" />
                </div>
                <select
                  name="propertyState"
                  id="propertyState"
                  required
                  className="pl-10 input-field"
                >
                  <option value="">Select a State...</option>
                  {STATES.map(st => <option key={st} value={st}>{st}</option>)}
                </select>
              </div>
            </div>

            {/* 3. Estimated Value */}
            <div>
              <label htmlFor="estimatedValue" className="block text-sm font-medium text-slate-700">Estimated Property Value</label>
              <div className="relative mt-1 rounded-md shadow-sm">
                <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                  <DollarSign className="w-5 h-5 text-slate-400" />
                </div>
                <input
                  type="number"
                  name="estimatedValue"
                  id="estimatedValue"
                  min="10000"
                  placeholder="e.g. 450000"
                  required
                  className="pl-10 input-field"
                />
              </div>
              <p className="mt-1 text-xs text-slate-500">It doesn't have to be exact. A rough estimate is fine.</p>
            </div>

            <div className="flex justify-end pt-4 border-t border-slate-100">
              <button
                type="submit"
                disabled={loading}
                className="w-full btn-primary sm:w-auto"
              >
                {loading ? <Loader2 className="w-5 h-5 mr-2 animate-spin" /> : null}
                Create Application <ArrowRight className="w-4 h-4 ml-2" />
              </button>
            </div>

          </form>
        </div>
      </div>
    </BorrowerLayout>
  );
}