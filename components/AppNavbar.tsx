import Link from 'next/link'
import type { ReactNode } from 'react'

interface AppNavbarProps {
  right?: ReactNode
}

export default function AppNavbar({ right }: AppNavbarProps) {
  return (
    <nav className="bg-white border-b border-slate-100 px-4 sm:px-6 py-3.5 flex items-center justify-between sticky top-0 z-20 shadow-sm">
      <Link href="/dashboard" className="flex items-center gap-2 group">
        <span className="text-2xl">🏠</span>
        <div className="flex flex-col leading-tight">
          <span className="text-lg font-extrabold text-slate-800 group-hover:text-emerald-700 transition-colors">
            Dealer<span className="text-emerald-500">Pro</span>
          </span>
          <span className="text-[10px] text-slate-400 font-medium tracking-wide">
            by Shri Ram Krishna Group of Properties
          </span>
        </div>
      </Link>

      {right && (
        <div className="flex items-center gap-3">
          {right}
        </div>
      )}
    </nav>
  )
}
