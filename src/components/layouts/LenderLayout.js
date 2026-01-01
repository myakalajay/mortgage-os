/**
 * @file src/components/layouts/LenderLayout.js
 * @description Operational Layout for Loan Officers
 */

import Link from 'next/link';
import { useRouter } from 'next/router';
import { LayoutDashboard, FileStack, CheckSquare, LogOut, Briefcase } from 'lucide-react';
import clsx from 'clsx';
import useUser from '@/hooks/useUser';

const NAVIGATION = [
  { name: 'Pipeline', href: '/dashboard/lender', icon: LayoutDashboard },
  { name: 'Underwriting Queue', href: '/dashboard/lender/queue', icon: FileStack },
  { name: 'Closed Loans', href: '/dashboard/lender/closed', icon: CheckSquare },
];

export default function LenderLayout({ children }) {
  const router = useRouter();
  const { user, isLoading } = useUser({ redirectTo: '/auth/login' });

  if (isLoading || !user) return <div className="flex items-center justify-center min-h-screen bg-slate-50">Loading...</div>;

  // Strict Role Check
  if (user.role !== 'LENDER' && user.role !== 'SUPER_ADMIN') {
    return <div className="p-8 text-center text-red-600">Access Denied: Lenders Only</div>;
  }

  return (
    <div className="flex flex-col min-h-screen bg-slate-100">
      {/* Top Header */}
      <header className="sticky top-0 z-30 bg-white border-b border-slate-200">
        <div className="flex items-center justify-between h-16 px-4 mx-auto max-w-7xl sm:px-6 lg:px-8">
          <div className="flex items-center">
            <Briefcase className="w-8 h-8 mr-2 text-blue-600" />
            <span className="text-xl font-bold tracking-tight text-slate-900">MortgageOS <span className="font-normal text-slate-400">Lender</span></span>
            
            {/* Desktop Nav */}
            <nav className="hidden ml-10 space-x-8 md:flex">
              {NAVIGATION.map((item) => {
                const isActive = router.pathname === item.href;
                return (
                  <Link
                    key={item.name}
                    href={item.href}
                    className={clsx(
                      isActive ? 'text-blue-600 border-blue-600' : 'text-slate-500 border-transparent hover:text-slate-700 hover:border-slate-300',
                      'inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium h-16 transition-colors'
                    )}
                  >
                    <item.icon className="w-4 h-4 mr-2" />
                    {item.name}
                  </Link>
                );
              })}
            </nav>
          </div>

          <div className="flex items-center gap-4">
            <div className="hidden text-right sm:block">
              <div className="text-sm font-medium text-slate-900">{user.firstName} {user.lastName}</div>
              <div className="text-xs text-slate-500">Loan Officer</div>
            </div>
            <button
              onClick={async () => {
                await fetch('/api/auth/logout', { method: 'POST' });
                window.location.href = '/auth/login';
              }}
              className="p-2 transition-colors text-slate-400 hover:text-red-600"
            >
              <LogOut className="w-5 h-5" />
            </button>
          </div>
        </div>
      </header>

      {/* Main Workspace */}
      <main className="flex-1 w-full px-4 py-8 mx-auto max-w-7xl sm:px-6 lg:px-8">
        {children}
      </main>
    </div>
  );
}