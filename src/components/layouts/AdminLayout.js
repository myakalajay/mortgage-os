/**
 * @file src/components/layouts/AdminLayout.js
 * @description Super Admin Dashboard Shell
 */

import Link from 'next/link';
import { useRouter } from 'next/router';
import { LayoutDashboard, Users, FileText, Settings, LogOut, ShieldAlert, Shield } from 'lucide-react';
import clsx from 'clsx';
import useUser from '@/hooks/useUser';

// Updated Navigation to match the pages we actually built
const NAVIGATION = [
  // Maps to src/pages/dashboard/admin/index.js (Stats + User Mgmt)
  { name: 'System Overview', href: '/dashboard/admin', icon: LayoutDashboard }, 
  // Maps to src/pages/dashboard/admin/audit.js
  { name: 'Audit Logs', href: '/dashboard/admin/audit', icon: Shield }, 
];

export default function AdminLayout({ children }) {
  const router = useRouter();
  const { user, isLoading } = useUser({ redirectTo: '/auth/login' });

  // Prevent flash of content while checking auth
  if (isLoading || !user) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-slate-50">
        <div className="flex flex-col items-center animate-pulse">
          <div className="w-12 h-12 mb-4 rounded-full bg-slate-200"></div>
          <div className="w-32 h-4 rounded bg-slate-200"></div>
        </div>
      </div>
    );
  }

  // Strict Role Enforcement
  if (user.role !== 'SUPER_ADMIN') {
    return (
      <div className="flex items-center justify-center min-h-screen text-red-800 bg-red-50">
        <div className="text-center">
            <ShieldAlert className="w-12 h-12 mx-auto mb-4" />
            <h1 className="text-2xl font-bold">Access Denied</h1>
            <p className="mt-2">Super Admin Privileges Required.</p>
            <Link href="/auth/login" className="inline-block mt-4 underline hover:text-red-900">Return to Login</Link>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen bg-slate-50">
      {/* SIDEBAR */}
      <div className="fixed inset-y-0 z-50 flex-col hidden w-64 md:flex">
        <div className="flex flex-col flex-grow overflow-y-auto bg-white border-r shadow-sm border-slate-200">
          {/* Brand */}
          <div className="flex items-center flex-shrink-0 h-16 px-6 text-xl font-bold tracking-tight text-white bg-slate-900">
            MortgageOS <span className="px-1.5 py-0.5 ml-2 text-[10px] font-bold border rounded bg-primary-600 text-white border-transparent">ADMIN</span>
          </div>

          {/* Nav Items */}
          <div className="flex flex-col flex-grow mt-6">
            <nav className="flex-1 px-3 space-y-1">
              {NAVIGATION.map((item) => {
                const isActive = router.pathname === item.href;
                return (
                  <Link
                    key={item.name}
                    href={item.href}
                    className={clsx(
                      isActive
                        ? 'bg-primary-50 text-primary-700 border-r-4 border-primary-700' // Fixed bg-primary-5 typo
                        : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900 border-transparent',
                      'group flex items-center px-3 py-2.5 text-sm font-medium rounded-md transition-all'
                    )}
                  >
                    <item.icon
                      className={clsx(
                        isActive ? 'text-primary-700' : 'text-slate-400 group-hover:text-slate-500',
                        'mr-3 flex-shrink-0 h-5 w-5'
                      )}
                    />
                    {item.name}
                  </Link>
                );
              })}
            </nav>
          </div>

          {/* User Profile / Logout */}
          <div className="flex flex-shrink-0 p-4 border-t border-slate-200 bg-slate-50">
            <div className="flex-shrink-0 block w-full group">
              <div className="flex items-center">
                <div className="flex items-center justify-center font-bold rounded-full w-9 h-9 bg-slate-200 text-slate-600">
                    {user.firstName[0]}
                </div>
                <div className="ml-3">
                  <p className="text-sm font-medium text-slate-700">{user.firstName} {user.lastName}</p>
                  <p className="text-xs text-slate-500">Super Admin</p>
                </div>
                <button 
                  onClick={async () => {
                    try {
                      await fetch('/api/auth/logout', { method: 'POST' });
                      window.location.href = '/auth/login'; 
                    } catch (err) {
                      console.error('Logout failed', err);
                      router.push('/auth/login');
                    }
                  }}
                  className="p-2 ml-auto transition-colors rounded-full text-slate-400 hover:text-red-600 hover:bg-red-50"
                  title="Sign Out"
                >
                  <LogOut className="w-5 h-5" />
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* MAIN CONTENT AREA */}
      <div className="flex flex-col flex-1 transition-all duration-300 md:pl-64">
        <main className="flex-1">
          <div className="py-8">
            <div className="px-4 mx-auto max-w-7xl sm:px-6 md:px-8">
              {children}
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}