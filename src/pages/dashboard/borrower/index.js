/**
 * @file src/pages/dashboard/borrower/index.js
 * @description Borrower Dashboard (Connected)
 */

import Link from 'next/link';
import useSWR from 'swr';
import BorrowerLayout from '@/components/layouts/BorrowerLayout';
import useUser from '@/hooks/useUser';
import { ArrowRight, FileText, Clock, AlertCircle, Loader2 } from 'lucide-react';

const fetcher = (url) => fetch(url).then((res) => res.json());

export default function BorrowerDashboard() {
  const { user } = useUser();
  const { data, error } = useSWR('/api/v1/loans', fetcher);

  const loading = !data && !error;
  const loans = data?.data || [];
  const activeLoan = loans[0]; // Assuming single active loan policy for now

  // Helper for Status Bar
  const getProgress = (status) => {
    const stages = {
      'DRAFT': 10,
      'SUBMITTED': 30,
      'PROCESSING': 50,
      'UNDERWRITING': 70,
      'APPROVED_CONDITIONAL': 85,
      'CLEAR_TO_CLOSE': 95,
      'CLOSED': 100
    };
    return stages[status] || 0;
  };

  return (
    <BorrowerLayout>
      <div className="mb-8 md:flex md:items-center md:justify-between">
        <div className="flex-1 min-w-0">
          <h2 className="text-2xl font-bold leading-7 text-slate-900 sm:text-3xl sm:truncate">
            Welcome back, {user?.firstName}
          </h2>
          <p className="mt-1 text-sm text-slate-500">
            Track your mortgage application and manage documents.
          </p>
        </div>
      </div>

      {/* ERROR STATE */}
      {error && (
        <div className="flex items-center p-4 mb-6 text-red-700 rounded-md bg-red-50">
          <AlertCircle className="w-5 h-5 mr-2" />
          Failed to load application data.
        </div>
      )}

      {/* LOADING STATE */}
      {loading ? (
        <div className="flex justify-center p-12 bg-white border rounded-lg border-slate-200">
          <Loader2 className="w-8 h-8 animate-spin text-primary-700" />
        </div>
      ) : !activeLoan ? (
        // STATE 1: No Application Started
        <div className="overflow-hidden bg-white border rounded-lg shadow border-slate-200">
          <div className="px-4 py-12 text-center sm:px-6">
            <FileText className="w-12 h-12 mx-auto text-slate-300" />
            <h3 className="mt-2 text-lg font-medium text-slate-900">No Active Application</h3>
            <p className="max-w-sm mx-auto mt-1 text-sm text-slate-500">
              Ready to buy your dream home? Start your digital mortgage application in less than 5 minutes.
            </p>
            <div className="mt-6">
              <Link
                href="/dashboard/borrower/application/new"
                className="inline-flex items-center btn-primary"
              >
                Start New Application <ArrowRight className="w-4 h-4 ml-2" />
              </Link>
            </div>
          </div>
        </div>
      ) : (
        // STATE 2: Active Application Found
        <div className="overflow-hidden bg-white border shadow sm:rounded-lg border-slate-200">
          <div className="flex items-center justify-between px-4 py-5 border-b sm:px-6 bg-slate-50 border-slate-200">
            <div>
              <h3 className="text-lg font-medium leading-6 text-slate-900">
                {activeLoan.loanType === 'PURCHASE' ? 'Purchase Application' : 'Refinance Application'}
              </h3>
              <p className="max-w-2xl mt-1 text-sm text-slate-500">
                Started on {new Date(activeLoan.createdAt).toLocaleDateString()}
              </p>
            </div>
            <Link 
              href={`/dashboard/borrower/application/${activeLoan.id}`}
              className="text-sm font-medium text-primary-700 hover:text-primary-900"
            >
              View Details &rarr;
            </Link>
          </div>
          <div className="px-4 py-5 sm:p-6">
             <div className="mb-4">
                <div className="flex items-center justify-between mb-2">
                   <div className="flex items-center">
                     <Clock className="w-5 h-5 mr-2 text-primary-700" />
                     <span className="font-medium text-slate-900">Current Status:</span>
                     <span className="inline-flex px-2 ml-2 text-xs font-semibold leading-5 text-blue-800 bg-blue-100 rounded-full">
                       {activeLoan.status.replace('_', ' ')}
                     </span>
                   </div>
                   <span className="text-sm font-medium text-slate-500">{getProgress(activeLoan.status)}% Complete</span>
                </div>
                {/* Progress Bar */}
                <div className="w-full bg-slate-200 rounded-full h-2.5">
                  <div 
                    className="bg-primary-600 h-2.5 rounded-full transition-all duration-1000" 
                    style={{ width: `${getProgress(activeLoan.status)}%` }}
                  ></div>
                </div>
             </div>
             
             <div className="grid grid-cols-1 gap-4 mt-6 sm:grid-cols-3">
                <div className="p-3 border rounded bg-slate-50 border-slate-100">
                  <span className="text-xs uppercase text-slate-500">Property State</span>
                  <div className="font-medium text-slate-900">{activeLoan.propertyState}</div>
                </div>
                <div className="p-3 border rounded bg-slate-50 border-slate-100">
                  <span className="text-xs uppercase text-slate-500">Est. Value</span>
                  <div className="font-medium text-slate-900">
                    {activeLoan.estimatedValue ? `$${Number(activeLoan.estimatedValue).toLocaleString()}` : '-'}
                  </div>
                </div>
                <div className="p-3 border rounded bg-slate-50 border-slate-100">
                  <span className="text-xs uppercase text-slate-500">Documents</span>
                  <div className="font-medium text-slate-900">{activeLoan._count?.documents || 0} Uploaded</div>
                </div>
             </div>
          </div>
        </div>
      )}
    </BorrowerLayout>
  );
}