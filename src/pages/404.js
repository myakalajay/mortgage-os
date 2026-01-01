/**
 * @file src/pages/404.js
 * @description Custom Page Not Found
 */

import Link from 'next/link';
import { FileQuestion } from 'lucide-react';

export default function Custom404() {
  return (
    <div className="flex flex-col justify-center min-h-screen py-12 bg-white sm:px-6 lg:px-8">
      <div className="text-center sm:mx-auto sm:w-full sm:max-w-md">
        <FileQuestion className="w-16 h-16 mx-auto text-slate-300" />
        <h1 className="mt-4 text-4xl font-extrabold tracking-tight text-primary-800">404</h1>
        <h2 className="mt-2 text-lg font-medium text-slate-900">Page not found</h2>
        <p className="mt-2 text-base text-slate-500">
          Sorry, we couldn’t find the page you’re looking for.
        </p>
        <div className="mt-6">
          <Link 
            href="/" 
            className="text-base font-medium text-primary-700 hover:text-primary-600"
          >
            Go back home<span aria-hidden="true"> &rarr;</span>
          </Link>
        </div>
      </div>
    </div>
  );
}