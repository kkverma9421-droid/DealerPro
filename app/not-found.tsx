import Link from 'next/link'

export default function NotFound() {
  return (
    <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center px-4 text-center">
      <span className="text-7xl mb-6 select-none">🏚️</span>
      <h1 className="text-3xl font-extrabold text-slate-800 mb-2">404 — Page Not Found</h1>
      <p className="text-slate-500 text-base mb-8 max-w-sm">
        This page doesn&apos;t exist or may have been moved.
      </p>
      <div className="flex gap-3">
        <Link
          href="/dashboard"
          className="px-6 py-3 bg-emerald-500 hover:bg-emerald-600 text-white font-bold rounded-xl transition"
        >
          ← Dashboard
        </Link>
        <Link
          href="/"
          className="px-6 py-3 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-xl transition"
        >
          Home
        </Link>
      </div>
    </div>
  )
}
