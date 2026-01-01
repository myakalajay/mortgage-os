/**
 * @file src/pages/index.js
 * @description Public Landing Page / Portal Gateway
 */

import Link from 'next/link';
import { Shield, Home, Briefcase, Lock } from 'lucide-react';

export default function LandingPage() {
  return (
    <div className="flex flex-col min-h-screen bg-slate-50">
      
      {/* Navigation */}
      <nav className="bg-white border-b border-slate-200">
        <div className="flex items-center justify-between h-16 px-4 mx-auto max-w-7xl sm:px-6 lg:px-8">
          <div className="flex items-center gap-2">
            <div className="flex items-center justify-center w-8 h-8 font-bold text-white rounded-md bg-primary-700">M</div>
            <span className="text-xl font-bold tracking-tight text-slate-900">MortgageOS</span>
          </div>
          <div className="flex items-center gap-4">
            <Link href="/auth/login" className="text-sm font-medium text-slate-500 hover:text-slate-900">
              Sign In
            </Link>
            <Link href="/auth/register" className="btn-primary">
              Get Started
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <main className="flex flex-col items-center justify-center flex-1 p-6">
        <div className="max-w-3xl mx-auto mb-16 text-center">
          <h1 className="mb-4 text-4xl font-extrabold tracking-tight text-slate-900 sm:text-5xl">
            The Modern Operating System for <span className="text-primary-600">Digital Lending</span>
          </h1>
          <p className="text-lg text-slate-500">
            A secure, role-based platform streamlining the journey from application to closing.
          </p>
        </div>

        {/* Persona Cards */}
        <div className="grid w-full max-w-5xl grid-cols-1 gap-8 md:grid-cols-3">
          
          {/* 1. BORROWER */}
          <Link href="/auth/login" className="relative p-8 transition-all bg-white border shadow-sm group rounded-2xl border-slate-200 hover:border-primary-500 hover:shadow-md">
            <div className="flex items-center justify-center w-12 h-12 mb-6 text-blue-600 transition-transform bg-blue-100 rounded-xl group-hover:scale-110">
              <Home className="w-6 h-6" />
            </div>
            <h3 className="mb-2 text-xl font-bold text-slate-900">Borrowers</h3>
            <p className="mb-6 text-slate-500">
              Start a new loan application, upload documents, and track your status in real-time.
            </p>
            <span className="text-sm font-medium text-blue-600 group-hover:underline">Login to Portal &rarr;</span>
          </Link>

          {/* 2. LENDER */}
          <Link href="/auth/login" className="relative p-8 transition-all bg-white border shadow-sm group rounded-2xl border-slate-200 hover:border-purple-500 hover:shadow-md">
            <div className="flex items-center justify-center w-12 h-12 mb-6 text-purple-600 transition-transform bg-purple-100 rounded-xl group-hover:scale-110">
              <Briefcase className="w-6 h-6" />
            </div>
            <h3 className="mb-2 text-xl font-bold text-slate-900">Loan Officers</h3>
            <p className="mb-6 text-slate-500">
              Manage your pipeline, review underwriting queues, and process loan files efficiently.
            </p>
            <span className="text-sm font-medium text-purple-600 group-hover:underline">Access Workbench &rarr;</span>
          </Link>

          {/* 3. ADMIN */}
          <Link href="/auth/login" className="relative p-8 transition-all bg-white border shadow-sm group rounded-2xl border-slate-200 hover:border-slate-800 hover:shadow-md">
            <div className="flex items-center justify-center w-12 h-12 mb-6 transition-transform bg-slate-100 text-slate-700 rounded-xl group-hover:scale-110">
              <Shield className="w-6 h-6" />
            </div>
            <h3 className="mb-2 text-xl font-bold text-slate-900">System Admin</h3>
            <p className="mb-6 text-slate-500">
              Configure rates, manage users, audit security logs, and oversee platform health.
            </p>
            <span className="text-sm font-medium text-slate-700 group-hover:underline">System Config &rarr;</span>
          </Link>

        </div>
      </main>

      {/* Footer */}
      <footer className="py-8 bg-white border-t border-slate-200">
        <div className="flex items-center justify-center gap-2 px-4 mx-auto text-sm text-center max-w-7xl text-slate-400">
          <Lock className="w-4 h-4" />
          <span>256-bit Secure Encryption • SOC2 Compliant Architecture</span>
        </div>
      </footer>
    </div>
  );
}