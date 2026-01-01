/**
 * @file src/pages/auth/login.js
 * @description Public Login Interface
 */

import { useState } from 'react';
import { useRouter } from 'next/router';
import Head from 'next/head';
import Link from 'next/link';
import { Loader2, Lock, ArrowRight } from 'lucide-react'; // Icons

export default function LoginPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  async function handleSubmit(e) {
    e.preventDefault();
    setLoading(true);
    setError('');

    const formData = {
      email: e.target.email.value,
      password: e.target.password.value,
    };

    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      const data = await res.json();

      if (!res.ok) throw new Error(data.error?.message || 'Login failed');

      // Routing Logic: Direct user based on Role
      const role = data.user.role;
      if (role === 'SUPER_ADMIN') router.push('/dashboard/admin');
      else if (role === 'LENDER') router.push('/dashboard/lender');
      else if (role === 'BORROWER') router.push('/dashboard/borrower');

    } catch (err) {
      setError(err.message);
      setLoading(false);
    }
  }

  return (
    <div className="flex flex-col justify-center min-h-screen py-12 bg-slate-50 sm:px-6 lg:px-8">
      <Head>
        <title>Sign In | Mortgage Platform</title>
      </Head>

      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        {/* Brand Logo Placeholder */}
        <div className="flex items-center justify-center w-12 h-12 mx-auto rounded-lg bg-primary-700">
          <Lock className="w-6 h-6 text-white" />
        </div>
        <h2 className="mt-6 text-3xl font-extrabold text-center text-slate-900">
          Sign in to your account
        </h2>
        <p className="mt-2 text-sm text-center text-slate-600">
          Secure Mortgage Orchestration Platform
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="px-4 py-8 bg-white border-t-4 shadow sm:rounded-lg sm:px-10 border-primary-700">
          <form className="space-y-6" onSubmit={handleSubmit}>
            
            {/* Error Banner */}
            {error && (
              <div className="p-4 border-l-4 border-red-500 bg-red-50">
                <div className="flex">
                  <div className="ml-3">
                    <p className="text-sm text-red-700">{error}</p>
                  </div>
                </div>
              </div>
            )}

            <div>
              <label htmlFor="email" className="block text-sm font-medium text-slate-700">
                Email address
              </label>
              <div className="mt-1">
                <input
                  id="email"
                  name="email"
                  type="email"
                  autoComplete="email"
                  required
                  className="block w-full px-3 py-2 border rounded-md shadow-sm appearance-none border-slate-300 placeholder-slate-400 focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
                />
              </div>
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium text-slate-700">
                Password
              </label>
              <div className="mt-1">
                <input
                  id="password"
                  name="password"
                  type="password"
                  autoComplete="current-password"
                  required
                  className="block w-full px-3 py-2 border rounded-md shadow-sm appearance-none border-slate-300 placeholder-slate-400 focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
                />
              </div>
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <input
                  id="remember-me"
                  name="remember-me"
                  type="checkbox"
                  className="w-4 h-4 rounded text-primary-600 focus:ring-primary-500 border-slate-300"
                />
                <label htmlFor="remember-me" className="block ml-2 text-sm text-slate-900">
                  Remember me
                </label>
              </div>

              <div className="text-sm">
                <Link href="/auth/reset" className="font-medium text-primary-700 hover:text-primary-600">
                  Forgot your password?
                </Link>
              </div>
            </div>

            <div>
              <button
                type="submit"
                disabled={loading}
                className="flex justify-center w-full px-4 py-2 text-sm font-medium text-white transition-colors border border-transparent rounded-md shadow-sm bg-primary-700 hover:bg-primary-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? (
                  <Loader2 className="w-5 h-5 animate-spin" />
                ) : (
                  <span className="flex items-center">
                    Sign in <ArrowRight className="w-4 h-4 ml-2" />
                  </span>
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}