'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'

const NAV_ITEMS = [
  { key: 'dashboard',  href: '/dashboard',    icon: '🏠', label: 'Home'       },
  { key: 'properties', href: '/dashboard',    icon: '🏘', label: 'Properties' },
  { key: 'add',        href: '/add-property', icon: '➕', label: 'Add Listing' },
  { key: 'login',      href: '/login',        icon: '🔐', label: 'Sign In'    },
]

interface SidebarProps {
  activeKey?: string
}

export default function Sidebar({ activeKey = 'dashboard' }: SidebarProps) {
  const pathname = usePathname()

  return (
    <aside className="w-[220px] shrink-0 bg-[#1e3a5f] flex flex-col h-screen sticky top-0 overflow-y-auto">
      {/* Brand */}
      <div className="px-5 py-6 border-b border-white/[0.06]">
        <Link href="/dashboard" className="flex items-center gap-2.5 group">
          <div className="w-10 h-10 rounded-xl bg-emerald-500 flex items-center justify-center text-lg shrink-0">
            🏠
          </div>
          <div className="leading-tight">
            <div className="text-[17px] font-extrabold text-white tracking-tight group-hover:text-emerald-300 transition-colors">
              Dealer<span className="text-emerald-400">Pro</span>
            </div>
            <div className="text-[9px] text-white/30 font-medium tracking-wide">
              SRKG Properties
            </div>
          </div>
        </Link>
      </div>

      {/* Nav items */}
      <nav className="flex-1 px-2.5 py-3">
        {NAV_ITEMS.map(item => {
          const isActive = pathname === item.href || activeKey === item.key
          return (
            <Link
              key={item.key}
              href={item.href}
              className={`flex items-center gap-3 px-4 py-2.5 rounded-xl transition-all mb-0.5 relative ${
                isActive
                  ? 'bg-emerald-500/[0.12] text-emerald-400'
                  : 'text-white/50 hover:text-white hover:bg-white/[0.06]'
              }`}
            >
              {isActive && (
                <div className="absolute left-0 top-[20%] bottom-[20%] w-[3px] rounded-r bg-emerald-400" />
              )}
              <span className="text-[18px] w-5 text-center leading-none">{item.icon}</span>
              <span className={`text-sm ${isActive ? 'font-bold' : 'font-medium'}`}>
                {item.label}
              </span>
            </Link>
          )
        })}
      </nav>

      {/* User profile */}
      <div className="px-5 py-4 border-t border-white/[0.06]">
        <div className="flex items-center gap-2.5 cursor-pointer group">
          <div className="w-8 h-8 rounded-[10px] bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center text-xs font-bold text-emerald-400 shrink-0">
            SK
          </div>
          <div className="min-w-0">
            <div className="text-xs font-bold text-white truncate">Suresh Kumar</div>
            <div className="text-[10px] text-white/35">Admin · SRKG</div>
          </div>
        </div>
      </div>
    </aside>
  )
}
