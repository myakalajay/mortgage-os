/**
 * @file src/pages/500.js
 * @description Custom Server Error
 */

import { ServerCrash } from 'lucide-react';

export default function Custom500() {
  return (
    <div className="flex flex-col justify-center min-h-screen py-12 bg-slate-50 sm:px-6 lg:px-8">
      <div className="text-center sm:mx-auto sm:w-full sm:max-w-md">
        <ServerCrash className="w-16 h-16 mx-auto text-primary-700" />
        <h1 className="mt-4 text-3xl font-bold text-slate-900">System Error</h1>
        <p className="mt-2 text-base text-slate-600">
          Our servers encountered an unexpected condition. 
          The engineering team has been notified.
        </p>
        <div className="mt-8">
          <button 
            onClick={() => window.location.reload()}
            className="inline-flex items-center px-4 py-2 text-sm font-medium text-white border border-transparent rounded-md shadow-sm bg-primary-700 hover:bg-primary-800 focus:outline-none"
          >
            Try Refreshing
          </button>
        </div>
      </div>
    </div>
  );
}