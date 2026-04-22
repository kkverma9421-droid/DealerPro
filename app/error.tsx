'use client'

import { useEffect } from 'react'

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    console.error('[DealerPro] Unhandled error:', error)
  }, [error])

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center px-4 text-center">
      <span className="text-7xl mb-6 select-none">⚠️</span>
      <h1 className="text-2xl font-extrabold text-slate-800 mb-2">Something went wrong</h1>
      <p className="text-slate-500 text-sm mb-6 max-w-sm">
        An unexpected error occurred. Please try again or go back to the dashboard.
      </p>
      {error.digest && (
        <p className="text-[11px] text-slate-400 font-mono mb-6">Error ID: {error.digest}</p>
      )}
      <div className="flex gap-3">
        <button
          onClick={reset}
          className="px-6 py-3 bg-emerald-500 hover:bg-emerald-600 text-white font-bold rounded-xl transition"
        >
          Try Again
        </button>
        <a
          href="/dashboard"
          className="px-6 py-3 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-xl transition"
        >
          ← Dashboard
        </a>
      </div>
    </div>
  )
}
