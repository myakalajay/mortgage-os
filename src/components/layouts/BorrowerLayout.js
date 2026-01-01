import Link from 'next/link';
import { useRouter } from 'next/router';
import { Home, FileText, Settings, LogOut, User } from 'lucide-react'; // Import Settings
import clsx from 'clsx';
import useUser from '@/hooks/useUser';

// --- ADDED 'Settings' TO NAVIGATION ---
const NAVIGATION = [
  { name: 'Dashboard', href: '/dashboard/borrower', icon: Home },
  { name: 'New Application', href: '/dashboard/borrower/new', icon: FileText },
  { name: 'My Profile', href: '/dashboard/borrower/profile', icon: Settings }, // <--- NEW LINK
];

export default function BorrowerLayout({ children }) {
  const router = useRouter();
  const { user, isLoading } = useUser({ redirectTo: '/auth/login' });

  if (isLoading || !user) return <div className="flex items-center justify-center min-h-screen bg-slate-50">Loading...</div>;

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Top Navigation */}
      <nav className="sticky top-0 z-30 bg-white border-b border-slate-200">
        <div className="px-4 mx-auto max-w-7xl sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex">
              <div className="flex items-center flex-shrink-0">
                <div className="flex items-center justify-center w-8 h-8 font-bold text-white rounded-md bg-primary-600">M</div>
                <span className="ml-2 text-xl font-bold text-slate-900">MortgageOS</span>
              </div>
              <div className="hidden sm:ml-6 sm:flex sm:space-x-8">
                {NAVIGATION.map((item) => {
                  const isActive = router.pathname === item.href;
                  return (
                    <Link
                      key={item.name}
                      href={item.href}
                      className={clsx(
                        isActive ? 'border-primary-500 text-slate-900' : 'border-transparent text-slate-500 hover:border-slate-300 hover:text-slate-700',
                        'inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium'
                      )}
                    >
                      <item.icon className="w-4 h-4 mr-2" />
                      {item.name}
                    </Link>
                  );
                })}
              </div>
            </div>
            <div className="flex items-center">
              <span className="mr-4 text-sm text-slate-500">Welcome, {user.firstName}</span>
              <button
                onClick={async () => {
                  await fetch('/api/auth/logout', { method: 'POST' });
                  window.location.href = '/auth/login';
                }}
                className="p-2 rounded-full text-slate-400 hover:text-red-600 hover:bg-slate-100"
                title="Logout"
              >
                <LogOut className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>
      </nav>

      <main className="px-4 py-10 mx-auto max-w-7xl sm:px-6 lg:px-8">
        {children}
      </main>
    </div>
  );
}