/**
 * @file src/pages/dashboard/borrower/application/[id].js
 * @description The "Command Center" for a specific loan application
 */

import { useState } from 'react';
import { useRouter } from 'next/router';
import Link from 'next/link';
import useSWR from 'swr';
import toast from 'react-hot-toast';
import BorrowerLayout from '@/components/layouts/BorrowerLayout';
import UploadModal from '@/components/features/dashboard/borrower/UploadModal'; // Corrected Path
import { 
  CheckCircle, Circle, Clock, FileText, Upload, ChevronRight, MapPin, DollarSign, Send
} from 'lucide-react';

const fetcher = (url) => fetch(url).then((res) => res.json());

export default function ApplicationHub() {
  const router = useRouter();
  const { id } = router.query;
  const [isUploadOpen, setIsUploadOpen] = useState(false);
  
  // Only fetch if we have an ID
  const { data, error, mutate } = useSWR(id ? `/api/v1/loans/${id}` : null, fetcher);

  const loading = !data && !error;
  const loan = data?.data;

  if (loading) return <BorrowerLayout><div className="py-20 text-center">Loading Application...</div></BorrowerLayout>;
  if (error) return <BorrowerLayout><div className="py-20 text-center text-red-600">Application not found.</div></BorrowerLayout>;

  // --- ACTIONS ---

  const handleSubmitApplication = async () => {
    if (!confirm('Are you sure you want to submit your application to the lender? You cannot make changes afterwards.')) return;
    
    try {
      const res = await fetch(`/api/v1/loans/${loan.id}/submit`, { method: 'POST' });
      if (!res.ok) throw new Error('Submission failed');
      
      toast.success('Application Submitted Successfully!');
      mutate(); // Refresh UI to show new status
    } catch (err) {
      toast.error('Error submitting application');
      console.error(err);
    }
  };

  // --- CONFIG ---

  // Updated Task List to use Dynamic Routes
  const tasks = [
    { 
      id: 'property', 
      title: 'Property Details', 
      // Link to dynamic page with section='property'
      href: `/dashboard/borrower/application/${id}/property`, 
      // Check if 'property' object exists in formData
      status: loan.formData?.property ? 'completed' : 'current', 
      desc: 'Address and occupancy' 
    },
    { 
      id: 'personal', 
      title: 'Personal Information', 
      // This links to the SPECIFIC page we built (it was custom)
      href: `/dashboard/borrower/application/${id}/personal`, 
      status: loan.formData?.personal ? 'completed' : 'pending', 
      desc: 'Identity and contact info' 
    },
    { 
      id: 'income', 
      title: 'Employment & Income', 
      // Link to dynamic page with section='income'
      href: `/dashboard/borrower/application/${id}/income`, 
      status: loan.formData?.income ? 'completed' : 'pending', 
      desc: 'Primary employer details' 
    },
    { 
      id: 'assets', 
      title: 'Assets & Liabilities', 
      // Link to dynamic page with section='assets'
      href: `/dashboard/borrower/application/${id}/assets`, 
      status: loan.formData?.assets ? 'completed' : 'pending', 
      desc: 'Bank account information' 
    },
  ];

  const StatusIcon = ({ status }) => {
    if (status === 'completed') return <CheckCircle className="w-6 h-6 text-green-500" />;
    if (status === 'current') return <Circle className="w-6 h-6 text-primary-600 fill-primary-50" />;
    return <Circle className="w-6 h-6 text-slate-300" />;
  };

  return (
    <BorrowerLayout>
      {/* HEADER */}
      <div className="mb-8 overflow-hidden bg-white rounded-lg shadow">
        <div className="px-6 py-8 bg-primary-900 md:flex md:items-center md:justify-between">
           <div>
             <h1 className="text-2xl font-bold text-white">
               {loan.loanType === 'PURCHASE' ? 'Purchase' : 'Refinance'} Application
             </h1>
             <div className="flex items-center mt-2 text-sm text-primary-100">
               <span className={`px-2 py-1 mr-3 text-xs font-semibold tracking-wider uppercase rounded ${
                 loan.status === 'SUBMITTED' ? 'bg-green-500 text-white' : 'bg-primary-800'
               }`}>
                 {loan.status.replace('_', ' ')}
               </span>
               <span className="flex items-center mr-4">
                 <MapPin className="w-4 h-4 mr-1" /> {loan.propertyState}
               </span>
               <span className="flex items-center">
                 <DollarSign className="w-4 h-4 mr-1" /> Est. ${Number(loan.estimatedValue).toLocaleString()}
               </span>
             </div>
           </div>
           
           <div className="flex gap-3 mt-4 md:mt-0">
             <button className="px-4 py-2 text-sm font-semibold text-white transition-colors border rounded-md bg-white/10 border-white/20 hover:bg-white/20">
               Contact Loan Officer
             </button>

             {/* SUBMIT BUTTON - Only show if DRAFT */}
             {loan.status === 'DRAFT' && (
               <button 
                 onClick={handleSubmitApplication}
                 className="flex items-center px-4 py-2 text-sm font-semibold text-white transition-colors bg-green-500 rounded-md shadow-lg hover:bg-green-600"
               >
                 <Send className="w-4 h-4 mr-2" />
                 Submit Application
               </button>
             )}
           </div>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
        
        {/* LEFT COLUMN: TASKS */}
        <div className="lg:col-span-2">
          <h3 className="mb-4 text-lg font-medium text-slate-900">Application Tasks</h3>
          <div className="overflow-hidden bg-white border shadow sm:rounded-md border-slate-200">
            <ul className="divide-y divide-slate-200">
              {tasks.map((task) => (
                <li key={task.id}>
                  {/* Conditionally render Link or Div based on whether href exists */}
                  {task.href ? (
                    <Link href={task.href} className="block w-full text-left transition-colors hover:bg-slate-50">
                      <div className="flex items-center px-4 py-4 sm:px-6">
                        <div className="flex-1 min-w-0 sm:flex sm:items-center sm:justify-between">
                          <div className="flex items-center">
                            <StatusIcon status={task.status} />
                            <div className="ml-4">
                              <p className="text-sm font-medium truncate text-primary-700">{task.title}</p>
                              <p className="flex items-center text-sm text-slate-500">{task.desc}</p>
                            </div>
                          </div>
                        </div>
                        <div className="flex-shrink-0 ml-5">
                          <ChevronRight className="w-5 h-5 text-slate-400" />
                        </div>
                      </div>
                    </Link>
                  ) : (
                    <div className="block w-full text-left cursor-not-allowed opacity-60">
                      <div className="flex items-center px-4 py-4 sm:px-6">
                        <div className="flex-1 min-w-0 sm:flex sm:items-center sm:justify-between">
                          <div className="flex items-center">
                            <StatusIcon status={task.status} />
                            <div className="ml-4">
                              <p className="text-sm font-medium truncate text-slate-500">{task.title}</p>
                              <p className="flex items-center text-sm text-slate-400">{task.desc} (Coming Soon)</p>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* RIGHT COLUMN: DOCUMENTS */}
        <div>
          <h3 className="mb-4 text-lg font-medium text-slate-900">Required Documents</h3>
          <div className="p-6 bg-white border rounded-lg shadow border-slate-200">
            
            {loan.documents && loan.documents.length > 0 ? (
              <ul className="mb-6 space-y-3">
                {loan.documents.map(doc => (
                  <li key={doc.id} className="flex items-center p-2 text-sm rounded text-slate-600 bg-slate-50">
                    <FileText className="w-4 h-4 mr-2 text-slate-400" />
                    <span className="flex-1 truncate">{doc.name}</span>
                    <span className="text-xs bg-yellow-100 text-yellow-800 px-1.5 py-0.5 rounded ml-2">
                      {doc.status}
                    </span>
                  </li>
                ))}
              </ul>
            ) : (
              <div className="py-6 mb-4 text-center">
                <FileText className="w-10 h-10 mx-auto mb-2 text-slate-200" />
                <p className="text-sm text-slate-500">No documents uploaded yet.</p>
              </div>
            )}

            <button 
              onClick={() => setIsUploadOpen(true)}
              className="flex flex-col items-center justify-center w-full p-4 transition-colors border-2 border-dashed rounded-md border-slate-300 text-slate-500 hover:border-primary-500 hover:text-primary-600"
            >
              <Upload className="w-8 h-8 mb-2" />
              <span className="text-sm font-medium">Upload Documents</span>
              <span className="mt-1 text-xs text-slate-400">PDF, PNG, JPG up to 10MB</span>
            </button>
          </div>
        </div>
      </div>

      {/* UPLOAD MODAL */}
      {loan && (
        <UploadModal 
          isOpen={isUploadOpen} 
          onClose={() => setIsUploadOpen(false)}
          loanId={loan.id}
          onUploadSuccess={() => mutate()} 
        />
      )}

    </BorrowerLayout>
  );
}