/**
 * @file src/pages/dashboard/lender/queue.js
 * @description Priority Work Queue for Underwriting
 */

import useSWR from 'swr';
import Link from 'next/link';
import LenderLayout from '@/components/layouts/LenderLayout';
import { Loader2, AlertCircle, FileStack, ArrowRight } from 'lucide-react';

const fetcher = (url) => fetch(url).then((res) => res.json());

export default function UnderwritingQueue() {
  const { data, error } = useSWR('/api/v1/lender/loans', fetcher);

  const loading = !data && !error;
  const allLoans = data?.data || [];

  // FILTER: Only show active processing stages
  const activeLoans = allLoans.filter(loan => 
    ['PROCESSING', 'UNDERWRITING', 'APPROVED_CONDITIONAL'].includes(loan.status)
  );

  return (
    <LenderLayout>
      <div className="mb-8">
        <h1 className="flex items-center text-2xl font-bold text-slate-900">
          <FileStack className="w-6 h-6 mr-3 text-purple-600" />
          Underwriting Queue
        </h1>
        <p className="mt-1 text-sm text-slate-500">
          High-priority files requiring review and decision.
        </p>
      </div>

      <div className="overflow-hidden bg-white border rounded-lg shadow border-slate-200">
        <ul className="divide-y divide-slate-200">
          {loading ? (
             <li className="p-10 text-center"><Loader2 className="w-8 h-8 mx-auto text-purple-600 animate-spin"/></li>
          ) : activeLoans.length === 0 ? (
             <li className="flex flex-col items-center p-10 text-center">
                <div className="p-4 mb-3 rounded-full bg-slate-100">
                  <FileStack className="w-8 h-8 text-slate-400" />
                </div>
                <h3 className="font-medium text-slate-900">Queue Empty</h3>
                <p className="mt-1 text-sm text-slate-500">No loans are currently in underwriting.</p>
             </li>
          ) : (
            activeLoans.map((loan) => (
              <li key={loan.id} className="transition-colors hover:bg-slate-50">
                <Link href={`/dashboard/lender/loans/${loan.id}`} className="block px-6 py-5">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center min-w-0 gap-4">
                      <div className="flex items-center justify-center flex-shrink-0 w-12 h-12 text-lg font-bold text-purple-600 bg-purple-100 rounded-full">
                        {loan.user.firstName[0]}
                      </div>
                      <div className="min-w-0">
                        <p className="text-sm font-medium truncate text-slate-900">
                          {loan.user.lastName}, {loan.user.firstName}
                        </p>
                        <p className="text-sm truncate text-slate-500">
                          {loan.loanType} • {loan.propertyState}
                        </p>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-6">
                      <div className="hidden text-right sm:block">
                        <p className="text-xs tracking-wide uppercase text-slate-500">Status</p>
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                          loan.status === 'UNDERWRITING' ? 'bg-yellow-100 text-yellow-800' : 
                          'bg-purple-100 text-purple-800'
                        }`}>
                          {loan.status.replace('_', ' ')}
                        </span>
                      </div>
                      <ArrowRight className="w-5 h-5 text-slate-300" />
                    </div>
                  </div>
                </Link>
              </li>
            ))
          )}
        </ul>
      </div>
    </LenderLayout>
  );
}