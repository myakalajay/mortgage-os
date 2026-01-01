/**
 * @file src/pages/dashboard/lender/closed.js
 * @description Historical Archive of finalized loans
 */

import useSWR from 'swr';
import Link from 'next/link';
import LenderLayout from '@/components/layouts/LenderLayout';
import { Loader2, Archive, CheckCircle, XCircle } from 'lucide-react';

const fetcher = (url) => fetch(url).then((res) => res.json());

export default function ClosedLoans() {
  const { data, error } = useSWR('/api/v1/lender/loans', fetcher);

  const loading = !data && !error;
  const allLoans = data?.data || [];

  // FILTER: Only finalized loans
  const closedLoans = allLoans.filter(loan => 
    ['CLOSED', 'REJECTED', 'WITHDRAWN'].includes(loan.status)
  );

  return (
    <LenderLayout>
      <div className="mb-8">
        <h1 className="flex items-center text-2xl font-bold text-slate-900">
          <Archive className="w-6 h-6 mr-3 text-slate-600" />
          Closed & Archived
        </h1>
        <p className="mt-1 text-sm text-slate-500">
          History of funded and denied applications.
        </p>
      </div>

      <div className="overflow-hidden bg-white border rounded-lg shadow border-slate-200">
        <table className="min-w-full divide-y divide-slate-200">
          <thead className="bg-slate-50">
            <tr>
              <th className="px-6 py-3 text-xs font-medium tracking-wider text-left uppercase text-slate-500">Borrower</th>
              <th className="px-6 py-3 text-xs font-medium tracking-wider text-left uppercase text-slate-500">Outcome</th>
              <th className="px-6 py-3 text-xs font-medium tracking-wider text-left uppercase text-slate-500">Date</th>
              <th className="relative px-6 py-3"><span className="sr-only">View</span></th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-slate-200">
            {loading ? (
               <tr><td colSpan="4" className="px-6 py-10 text-center"><Loader2 className="w-6 h-6 mx-auto animate-spin text-slate-400"/></td></tr>
            ) : closedLoans.length === 0 ? (
               <tr><td colSpan="4" className="px-6 py-10 text-center text-slate-500">No closed loans found.</td></tr>
            ) : (
              closedLoans.map((loan) => (
                <tr key={loan.id} className="hover:bg-slate-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-slate-900">{loan.user.lastName}, {loan.user.firstName}</div>
                    <div className="text-sm text-slate-500">{loan.loanType}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {loan.status === 'CLOSED' ? (
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                        <CheckCircle className="w-3 h-3 mr-1" /> Funded
                      </span>
                    ) : (
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-slate-100 text-slate-800">
                        <XCircle className="w-3 h-3 mr-1" /> {loan.status}
                      </span>
                    )}
                  </td>
                  <td className="px-6 py-4 text-sm whitespace-nowrap text-slate-500">
                    {new Date(loan.updatedAt).toLocaleDateString()}
                  </td>
                  <td className="px-6 py-4 text-sm font-medium text-right whitespace-nowrap">
                    <Link href={`/dashboard/lender/loans/${loan.id}`} className="text-blue-600 hover:text-blue-900">
                      View File
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