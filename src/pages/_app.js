/**
 * @file src/pages/_app.js
 * @description Global Application Wrapper
 * * INTENT:
 * 1. Loads global CSS (Tailwind).
 * 2. Initializes the 'Inter' font (optimized by Next.js).
 * 3. Sets up the Toast notification system (react-hot-toast).
 * 4. Provides a consistent layout context.
 */

import '@/styles/globals.css';
import { Inter } from 'next/font/google';
import { Toaster } from 'react-hot-toast';
import Head from 'next/head';

// Optimize the Inter font (subsets reduce file size)
const inter = Inter({ 
  subsets: ['latin'],
  variable: '--font-inter',
});

export default function App({ Component, pageProps }) {
  // Use the layout defined at the page level, or a default fragment
  const getLayout = Component.getLayout || ((page) => page);

  return (
    <>
      <Head>
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <title>MortgageOS | Secure Lending Platform</title>
      </Head>
      
      {/* Apply Font Variable Globally */}
      <div className={`${inter.variable} font-sans min-h-screen bg-slate-50 text-slate-900`}>
        
        {/* Render the Page with its specific Layout */}
        {getLayout(<Component {...pageProps} />)}
        
        {/* Global Notifications */}
        <Toaster 
          position="top-right"
          toastOptions={{
            duration: 4000,
            style: {
              background: '#363636',
              color: '#fff',
            },
            success: {
              style: {
                background: '#047857', // Green-700
              },
            },
            error: {
              style: {
                background: '#b91c1c', // Red-700
              },
            },
          }}
        />
      </div>
    </>
  );
}