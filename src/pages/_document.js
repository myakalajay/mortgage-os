/**
 * @file src/pages/_document.js
 * @description Server-Side Document Structure
 * * INTENT:
 * Controls the <html> and <body> tags. 
 * Essential for accessibility (lang="en") and proper hydration.
 */

import { Html, Head, Main, NextScript } from 'next/document';

export default function Document() {
  return (
    <Html lang="en" className="h-full antialiased bg-slate-50">
      <Head>
        {/* Favicon & Manifest would go here */}
        <link rel="icon" href="/favicon.ico" />
        <meta name="theme-color" content="#800000" /> {/* Brand Maroon */}
      </Head>
      <body className="h-full">
        <Main />
        <NextScript />
      </body>
    </Html>
  );
}