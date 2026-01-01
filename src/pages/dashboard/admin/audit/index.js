/**
 * @file src/pages/dashboard/admin/audit.js
 * @description Compliance & Security Log Viewer
 */

import useSWR from 'swr';
import AdminLayout from '@/components/layouts/AdminLayout';
import { Shield, Search, Loader2, FileText, User, Activity } from 'lucide-react';

const fetcher = (url) => fetch(url).then((res) => res.json());

export default function AuditLogs() {
  const { data, error } = useSWR('/api/v1/admin/audit-logs', fetcher);

  const loading = !data && !error;
  const logs = data?.data || [];

  // Helper to format the JSON metadata into readable text
  const formatMetadata = (meta) => {
    if (!meta) return '-';
    // If it's a simple object, stringify it cleanly
    try {
      return JSON.stringify(meta).replace(/[{"}]/g, '').replace(/,/g, ', ');
    } catch (e) {
      return 'Complex Data';
    }
  };

  const getActionColor = (action) => {
    if (action.includes('LOGIN')) return 'bg-blue-100 text-blue-800';
    if (action.includes('STATUS')) return 'bg-purple-100 text-purple-800';
    if (action.includes('UPLOAD')) return 'bg-yellow-100 text-yellow-800';
    if (action.includes('DELETE')) return 'bg-red-100 text-red-800';
    return 'bg-slate-100 text-slate-800';
  };

  return (
    <AdminLayout>
      <div className="mb-8">
        <h1 className="flex items-center text-2xl font-bold text-slate-900">
          <Shield className="w-6 h-6 mr-3 text-slate-700" />
          System Audit Logs
        </h1>
        <p className="mt-1 text-sm text-slate-500">
          Immutable record of all security and business events.
        </p>
      </div>

      <div className="overflow-hidden bg-white border rounded-lg shadow border-slate-200">
        {/* Toolbar */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 bg-slate-50">
          <h3 className="text-sm font-medium text-slate-900">Recent Activity</h3>
          <div className="relative max-w-xs rounded-md shadow-sm">
            <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
              <Search className="w-4 h-4 text-slate-400" />
            </div>
            <input type="text" className="pl-10 text-xs input-field" placeholder="Search logs..." />
          </div>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-slate-200">
            <thead className="bg-slate-50">
              <tr>
                <th className="px-6 py-3 text-xs font-medium tracking-wider text-left uppercase text-slate-500">Time</th>
                <th className="px-6 py-3 text-xs font-medium tracking-wider text-left uppercase text-slate-500">Actor</th>
                <th className="px-6 py-3 text-xs font-medium tracking-wider text-left uppercase text-slate-500">Action</th>
                <th className="px-6 py-3 text-xs font-medium tracking-wider text-left uppercase text-slate-500">Details (Metadata)</th>
              </tr>
            </thead>
            <tbody className="text-sm bg-white divide-y divide-slate-200">
              {loading ? (
                <tr><td colSpan="4" className="px-6 py-10 text-center"><Loader2 className="w-6 h-6 mx-auto animate-spin text-slate-400"/></td></tr>
              ) : logs.length === 0 ? (
                <tr><td colSpan="4" className="px-6 py-10 text-center text-slate-500">No logs found.</td></tr>
              ) : (
                logs.map((log) => (
                  <tr key={log.id} className="font-mono text-xs hover:bg-slate-50">
                    <td className="px-6 py-4 whitespace-nowrap text-slate-500">
                      {new Date(log.createdAt).toLocaleString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {log.user ? (
                        <div className="flex items-center">
                          <span className="font-medium text-slate-900">{log.user.email}</span>
                          <span className="ml-2 text-xs text-slate-400">({log.user.role})</span>
                        </div>
                      ) : (
                        <span className="italic text-red-500">System / Deleted User</span>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 py-1 rounded-full font-semibold ${getActionColor(log.action)}`}>
                        {log.action}
                      </span>
                    </td>
                    <td className="max-w-xs px-6 py-4 truncate text-slate-600" title={JSON.stringify(log.metadata)}>
                      {formatMetadata(log.metadata)}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </AdminLayout>
  );
}