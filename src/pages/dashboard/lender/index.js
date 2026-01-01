/**
 * @file src/pages/dashboard/lender/index.js
 * @description Lender Pipeline View
 */

import useSWR from 'swr';
import Link from 'next/link';
import LenderLayout from '@/components/layouts/LenderLayout';
import { Search, Filter, ArrowRight, Loader2, FileText, User } from 'lucide-react';

const fetcher = (url) => fetch(url).then((res) => res.json());

export default function LenderDashboard() {
  const { data, error } = useSWR('/api/v1/lender/loans', fetcher);

  const loading = !data && !error;
  const loans = data?.data || [];

  // Helper to color-code status
  const getStatusColor = (status) => {
    const map = {
      SUBMITTED: 'bg-blue-100 text-blue-800',
      PROCESSING: 'bg-purple-100 text-purple-800',
      UNDERWRITING: 'bg-yellow-100 text-yellow-800',
      APPROVED_CONDITIONAL: 'bg-green-100 text-green-800',
      CLEAR_TO_CLOSE: 'bg-emerald-100 text-emerald-800',
      REJECTED: 'bg-red-100 text-red-800',
      CLOSED: 'bg-slate-100 text-slate-800'
    };
    return map[status] || 'bg-gray-100 text-gray-800';
  };

  return (
    <LenderLayout>
      <div className="mb-8 sm:flex sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Loan Pipeline</h1>
          <p className="mt-1 text-sm text-slate-500">
            View and manage incoming applications.
          </p>
        </div>
        <div className="flex gap-3 mt-4 sm:mt-0">
           <button className="flex items-center btn-secondary">
             <Filter className="w-4 h-4 mr-2" /> Filter
           </button>
           <div className="relative rounded-md shadow-sm">
             <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
               <Search className="w-4 h-4 text-slate-400" />
             </div>
             <input type="text" className="pl-10 input-field" placeholder="Search borrower..." />
           </div>
        </div>
      </div>

      <div className="overflow-hidden bg-white border rounded-lg shadow border-slate-200">
        <table className="min-w-full divide-y divide-slate-200">
          <thead className="bg-slate-50">
            <tr>
              <th scope="col" className="px-6 py-3 text-xs font-medium tracking-wider text-left uppercase text-slate-500">Borrower</th>
              <th scope="col" className="px-6 py-3 text-xs font-medium tracking-wider text-left uppercase text-slate-500">Loan Details</th>
              <th scope="col" className="px-6 py-3 text-xs font-medium tracking-wider text-left uppercase text-slate-500">Status</th>
              <th scope="col" className="px-6 py-3 text-xs font-medium tracking-wider text-left uppercase text-slate-500">Docs</th>
              <th scope="col" className="relative px-6 py-3"><span className="sr-only">Actions</span></th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-slate-200">
            {loading ? (
              <tr><td colSpan="5" className="px-6 py-10 text-center"><Loader2 className="w-6 h-6 mx-auto text-blue-600 animate-spin"/></td></tr>
            ) : loans.length === 0 ? (
              <tr><td colSpan="5" className="px-6 py-10 text-center text-slate-500">No active applications found.</td></tr>
            ) : (
              loans.map((loan) => (
                <tr key={loan.id} className="transition-colors hover:bg-slate-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className="flex items-center justify-center flex-shrink-0 w-10 h-10 rounded-full bg-slate-100 text-slate-500">
                        <User className="w-5 h-5" />
                      </div>
                      <div className="ml-4">
                        <div className="text-sm font-medium text-slate-900">{loan.user.firstName} {loan.user.lastName}</div>
                        <div className="text-sm text-slate-500">{loan.user.email}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-slate-900">
                      {loan.loanType === 'PURCHASE' ? 'Purchase' : 'Refinance'}
                    </div>
                    <div className="text-sm text-slate-500">
                      {loan.propertyState} • Est. ${Number(loan.estimatedValue).toLocaleString()}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusColor(loan.status)}`}>
                      {loan.status.replace('_', ' ')}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-sm whitespace-nowrap text-slate-500">
                    <div className="flex items-center">
                      <FileText className="w-4 h-4 mr-1 text-slate-400" />
                      {loan._count.documents}
                    </div>
                  </td>
                  <td className="px-6 py-4 text-sm font-medium text-right whitespace-nowrap">
                    <Link 
                      href={`/dashboard/lender/loans/${loan.id}`}
                      className="flex items-center justify-end text-blue-600 hover:text-blue-900"
                    >
                      Process <ArrowRight className="w-4 h-4 ml-1" />
                    </Link>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </LenderLayout>
  );
}