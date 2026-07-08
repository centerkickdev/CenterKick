'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';

export default function ErrorBoundary({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    setIsAdmin(window.location.pathname.startsWith('/admin'));

    // Log the error to our backend
    fetch('/api/logs/error', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        error: { message: error.message, stack: error.stack },
        pageUrl: window.location.href,
        activityContext: 'App Error Boundary',
      }),
    }).catch(err => console.error('Failed to log error to backend:', err));
  }, [error]);

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center p-4">
      <div className="max-w-md w-full bg-white rounded-3xl p-8 shadow-xl border border-gray-100 text-center">
        <div className="w-16 h-16 bg-red-50 text-[#b50a0a] rounded-2xl flex items-center justify-center mx-auto mb-6">
          <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="12" cy="12" r="10" />
            <line x1="12" y1="8" x2="12" y2="12" />
            <line x1="12" y1="16" x2="12.01" y2="16" />
          </svg>
        </div>
        
        <h1 className="text-2xl font-bold text-gray-900 tracking-tighter mb-2">
          Something went wrong
        </h1>
        
        {isAdmin ? (
          <div className="text-left bg-gray-900 text-red-400 p-4 rounded-xl mt-4 mb-6 overflow-auto text-sm font-mono max-h-60 border border-gray-800 shadow-inner">
            <p className="font-bold text-white mb-2 tracking-wide text-xs">Developer Details:</p>
            <p className="mb-2">{error.message}</p>
            {error.stack && (
              <pre className="text-xs text-gray-400 opacity-80 whitespace-pre-wrap">{error.stack}</pre>
            )}
            {error.digest && (
              <p className="mt-2 text-gray-500">Digest: {error.digest}</p>
            )}
          </div>
        ) : (
          <p className="text-gray-900 text-base font-medium mb-8">
            An unexpected error occurred. Our team has been automatically notified and is looking into it.
          </p>
        )}

        <div className="flex gap-4">
          <button
            onClick={() => reset()}
            className="flex-1 py-4 bg-gray-900 hover:bg-black text-white rounded-xl font-bold text-sm tracking-wide transition-all"
          >
            Try Again
          </button>
          <Link
            href="/"
            className="flex-1 py-4 bg-gray-100 hover:bg-gray-200 text-gray-900 rounded-xl font-bold text-sm tracking-wide transition-all"
          >
            Go Home
          </Link>
        </div>
      </div>
    </div>
  );
}
