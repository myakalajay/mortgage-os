/**
 * @file src/pages/dashboard/lender/loans/[id].js
 * @description Lender Workbench: Process a specific loan (Includes Notes, PDF, & Risk Engine)
 */

import { useState } from 'react';
import { useRouter } from 'next/router';
import useSWR from 'swr';
import toast from 'react-hot-toast';
import Link from 'next/link';
import LenderLayout from '@/components/layouts/LenderLayout';
import { generateLoanPDF } from '@/lib/pdf-generator';
import { 
  ArrowLeft, FileText, AlertTriangle, ExternalLink, Loader2, Download, Activity 
} from 'lucide-react';

const fetcher = (url) => fetch(url).then((res) => res.json());

// --- HELPER: RISK CALCULATION ENGINE ---
function calculateRisk(formData) {
  // If income data is missing, we can't calculate
  if (!formData?.income || !formData?.income?.monthlyIncome) return null;

  const monthlyIncome = Number(formData.income.monthlyIncome) || 0;
  
  // For MVP, we assume a standard debt load since we don't pull credit reports yet.
  // In a real app, this comes from the Credit Report API (Equifax/TransUnion).
  const monthlyDebt = 1500; 

  if (monthlyIncome === 0) return { dti: 0, level: 'HIGH', color: 'bg-red-100 text-red-800' };

  const dti = ((monthlyDebt / monthlyIncome) * 100).toFixed(1);
  
  let level = 'LOW';
  let color = 'bg-green-100 text-green-800';

  // Standard Mortgage Rule: DTI > 43% is risky
  if (dti > 43) {
    level = 'HIGH';
    color = 'bg-red-100 text-red-800';
  } else if (dti > 36) {
    level = 'MEDIUM';
    color = 'bg-yellow-100 text-yellow-800';
  }

  return { dti, level, color };
}

// --- INTERNAL COMPONENT: NOTES SECTION ---
function NotesSection({ loanId }) {
  const { data, mutate } = useSWR(`/api/v1/loans/${loanId}/notes`, fetcher);
  const [noteText, setNoteText] = useState('');
  const [saving, setSaving] = useState(false);

  const handleAddNote = async (e) => {
    e.preventDefault();
    if (!noteText.trim()) return;
    setSaving(true);
    try {
      const res = await fetch(`/api/v1/loans/${loanId}/notes`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ content: noteText })
      });
      if (!res.ok) throw new Error('Failed to add note');
      setNoteText('');
      mutate();
      toast.success('Note added');
    } catch (err) {
      toast.error('Error saving note');
    } finally {
      setSaving(false);
    }
  };

  const notes = data?.data || [];

  return (
    <div className="p-4 border rounded-lg bg-slate-50 border-slate-200">
      <h3 className="flex items-center mb-3 text-sm font-semibold text-slate-900">
        <AlertTriangle className="w-4 h-4 mr-2 text-yellow-500" /> 
        Internal Notes
      </h3>
      
      <div className="pr-1 mb-4 space-y-3 overflow-y-auto max-h-60">
        {notes.length === 0 && <p className="text-xs italic text-slate-400">No notes yet.</p>}
        {notes.map(note => (
          <div key={note.id} className="p-3 text-sm bg-white border rounded shadow-sm border-slate-200">
            <p className="mb-1 text-slate-800">{note.content}</p>
            <div className="flex justify-between text-xs text-slate-400">
              {/* Added optional chaining for safety */}
              <span>{note.author?.firstName} ({note.author?.role})</span>
              <span>{new Date(note.createdAt).toLocaleDateString()}</span>
            </div>
          </div>
        ))}
      </div>

      <form onSubmit={handleAddNote}>
        <textarea 
          className="w-full h-20 mb-2 text-sm input-field"
          placeholder="Add internal note..."
          value={noteText}
          onChange={(e) => setNoteText(e.target.value)}
        ></textarea>
        <button 
          type="submit" 
          disabled={saving || !noteText.trim()} 
          className="justify-center w-full text-xs btn-secondary"
        >
          {saving ? <Loader2 className="w-3 h-3 animate-spin" /> : 'Save Note'}
        </button>
      </form>
    </div>
  );
}

// ------------------------------------------
// MAIN COMPONENT: LENDER WORKBENCH
// ------------------------------------------

export default function LenderWorkbench() {
  const router = useRouter();
  const { id } = router.query;
  const { data, error, mutate } = useSWR(id ? `/api/v1/loans/${id}` : null, fetcher);
  const [updating, setUpdating] = useState(false);

  const loading = !data && !error;
  const loan = data?.data;

  if (loading) return <LenderLayout><div className="p-10 text-center">Loading File...</div></LenderLayout>;
  if (error) return <LenderLayout><div className="p-10 text-center text-red-600">Error loading loan.</div></LenderLayout>;

  // --- ACTIONS ---
  const handleStatusChange = async (newStatus) => {
    setUpdating(true);
    try {
      const res = await fetch(`/api/v1/loans/${id}/status`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus }),
      });
      if (!res.ok) throw new Error('Update failed');
      toast.success(`Loan moved to ${newStatus.replace('_', ' ')}`);
      mutate();
    } catch (err) {
      toast.error('Failed to update status');
    } finally {
      setUpdating(false);
    }
  };

  const handleDownloadPDF = () => {
    try {
      if (!loan) return;
      const blob = generateLoanPDF(loan);
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `App_${loan.user.lastName}_${loan.id.substring(0,6)}.pdf`);
      document.body.appendChild(link);
      link.click();
      link.parentNode.removeChild(link);
      toast.success("PDF Downloaded");
    } catch (err) {
      console.error(err);
      toast.error("Failed to generate PDF");
    }
  };

  // --- CONFIG ---
  const WORKFLOW_ACTIONS = [
    { label: 'Start Processing', value: 'PROCESSING', current: 'SUBMITTED', color: 'bg-blue-600 hover:bg-blue-700' },
    { label: 'Send to Underwriting', value: 'UNDERWRITING', current: 'PROCESSING', color: 'bg-purple-600 hover:bg-purple-700' },
    { label: 'Issue Conditional Approval', value: 'APPROVED_CONDITIONAL', current: 'UNDERWRITING', color: 'bg-green-600 hover:bg-green-700' },
    { label: 'Clear to Close', value: 'CLEAR_TO_CLOSE', current: 'APPROVED_CONDITIONAL', color: 'bg-emerald-600 hover:bg-emerald-700' },
    { label: 'Close Loan', value: 'CLOSED', current: 'CLEAR_TO_CLOSE', color: 'bg-slate-800 hover:bg-slate-900' },
  ];

  const nextAction = WORKFLOW_ACTIONS.find(a => a.current === loan.status);
  
  // Calculate Risk Profile
  const risk = calculateRisk(loan.formData);

  return (
    <LenderLayout>
      {/* HEADER */}
      <div className="sticky z-20 flex items-center justify-between px-4 py-4 mb-8 -mx-4 bg-white border-b shadow-sm border-slate-200 sm:-mx-6 lg:-mx-8 sm:px-6 lg:px-8 top-16">
        <div className="flex items-center">
           <Link href="/dashboard/lender" className="mr-4 text-slate-400 hover:text-slate-600">
             <ArrowLeft className="w-5 h-5" />
           </Link>
           <div>
             <h1 className="flex items-center text-xl font-bold text-slate-900">
               {loan.user.firstName} {loan.user.lastName}
               <span className="ml-3 px-2.5 py-0.5 rounded-full text-xs font-medium bg-slate-100 text-slate-800 border border-slate-200">
                 {loan.loanType}
               </span>
             </h1>
             <div className="flex items-center mt-1 text-sm text-slate-500">
               File ID: <span className="mx-1 font-mono">{loan.id.substring(0,8)}</span> • Submitted {new Date(loan.createdAt).toLocaleDateString()}
             </div>
           </div>
        </div>

        <div className="flex items-center gap-3">
          <button 
            onClick={handleDownloadPDF}
            className="p-2 transition-colors rounded-full text-slate-500 hover:text-slate-700 hover:bg-slate-100"
            title="Download PDF Summary"
          >
            <Download className="w-5 h-5" />
          </button>

          <div className={`px-3 py-1 rounded text-sm font-medium border ${
            loan.status === 'CLOSED' ? 'bg-slate-800 text-white border-slate-800' : 'bg-slate-100 text-slate-700 border-slate-200'
          }`}>
            {loan.status.replace('_', ' ')}
          </div>
          
          {nextAction && (
            <button
              onClick={() => handleStatusChange(nextAction.value)}
              disabled={updating}
              className={`text-white px-4 py-2 rounded-md text-sm font-medium transition-colors shadow-sm ${nextAction.color}`}
            >
              {updating ? <Loader2 className="w-4 h-4 animate-spin"/> : nextAction.label}
            </button>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
        
        {/* LEFT: INFO */}
        <div className="space-y-6 lg:col-span-2">
          {/* Property Card */}
          <div className="overflow-hidden bg-white border rounded-lg shadow border-slate-200">
             <div className="px-6 py-4 font-medium border-b border-slate-200 bg-slate-50 text-slate-900">
               Property & Loan
             </div>
             <div className="grid grid-cols-2 gap-6 p-6">
                <div>
                   <label className="text-xs uppercase text-slate-500">Est. Value</label>
                   <div className="text-lg font-medium">${Number(loan.estimatedValue).toLocaleString()}</div>
                </div>
                <div>
                   <label className="text-xs uppercase text-slate-500">Location</label>
                   <div className="text-lg font-medium">{loan.propertyState}</div>
                </div>
                <div className="col-span-2">
                   <label className="text-xs uppercase text-slate-500">Address</label>
                   <div className="text-base text-slate-700">
                     {loan.propertyAddress || <span className="italic text-slate-400">Not provided yet</span>}
                   </div>
                </div>
             </div>
          </div>

          {/* Borrower Card */}
          <div className="overflow-hidden bg-white border rounded-lg shadow border-slate-200">
             <div className="px-6 py-4 font-medium border-b border-slate-200 bg-slate-50 text-slate-900">
               Borrower Details
             </div>
             <div className="grid grid-cols-2 gap-6 p-6">
                <div><label className="text-xs uppercase text-slate-500">Email</label><div className="text-sm text-slate-900">{loan.user.email}</div></div>
                <div><label className="text-xs uppercase text-slate-500">Phone</label><div className="text-sm text-slate-900">{loan.formData?.personal?.phone || '-'}</div></div>
             </div>
          </div>
        </div>

        {/* RIGHT: RISK, DOCS, NOTES */}
        <div className="space-y-6">
           
           {/* RISK ASSESSMENT WIDGET */}
           {risk && (
             <div className="overflow-hidden bg-white border rounded-lg shadow border-slate-200">
               <div className="flex items-center justify-between px-6 py-4 font-medium border-b border-slate-200 bg-slate-50 text-slate-900">
                  <span className="flex items-center"><Activity className="w-4 h-4 mr-2 text-slate-500" /> Risk Assessment</span>
                  <span className={`px-2 py-0.5 rounded text-xs font-bold ${risk.color}`}>
                    {risk.level} RISK
                  </span>
               </div>
               <div className="p-6">
                  <div className="flex items-end justify-between mb-2">
                    <span className="text-sm text-slate-500">Debt-to-Income (DTI)</span>
                    <span className="text-2xl font-bold text-slate-900">{risk.dti}%</span>
                  </div>
                  {/* Visual Bar */}
                  <div className="w-full mb-2 rounded-full bg-slate-200 h-2.5">
                    <div 
                      className={`h-2.5 rounded-full ${risk.level === 'HIGH' ? 'bg-red-500' : risk.level === 'MEDIUM' ? 'bg-yellow-500' : 'bg-green-500'}`} 
                      style={{ width: `${Math.min(risk.dti, 100)}%` }}
                    ></div>
                  </div>
                  <p className="text-xs text-slate-400">
                    Calculated from reported income & mock liabilities.
                  </p>
               </div>
             </div>
           )}

           {/* DOCS */}
           <div className="bg-white border rounded-lg shadow border-slate-200">
             <div className="flex items-center justify-between px-6 py-4 font-medium border-b border-slate-200 bg-slate-50 text-slate-900">
               <span>Documents</span>
               <span className="bg-slate-200 text-slate-600 text-xs px-2 py-0.5 rounded-full">{loan.documents?.length || 0}</span>
             </div>
             <ul className="overflow-y-auto divide-y divide-slate-100 max-h-60">
               {loan.documents?.length === 0 ? <li className="p-6 text-sm text-center text-slate-500">No documents.</li> : loan.documents.map((doc) => (
                 <li key={doc.id} className="flex items-center justify-between p-4 hover:bg-slate-50 group">
                    <div className="flex items-center overflow-hidden">
                      <FileText className="flex-shrink-0 w-5 h-5 mr-3 text-slate-400" />
                      <div className="min-w-0"><p className="text-sm font-medium truncate text-slate-900">{doc.name}</p></div>
                    </div>
                    <a href={doc.url} target="_blank" rel="noreferrer" className="text-blue-600 hover:text-blue-800"><ExternalLink className="w-4 h-4" /></a>
                 </li>
               ))}
             </ul>
           </div>

           {/* NOTES */}
           <NotesSection loanId={id} />

        </div>
      </div>
    </LenderLayout>
  );
}