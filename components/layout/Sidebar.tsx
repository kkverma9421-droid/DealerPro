'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'

const NAV_ITEMS = [
  { key: 'dashboard',  href: '/dashboard',    icon: '🏠', label: 'Home'       },
  { key: 'properties', href: '/dashboard',    icon: '🏘', label: 'Properties' },
  { key: 'leads',      href: '/leads',        icon: '💼', label: 'Leads'      },
  { key: 'analytics',  href: '/analytics',    icon: '📊', label: 'Analytics'  },
  { key: 'add',        href: '/add-property', icon: '➕', label: 'Add Listing' },
  { key: 'login',      href: '/login',        icon: '🔐', label: 'Sign In'    },
]

interface SidebarProps {
  activeKey?: string
}

export default function Sidebar({ activeKey = 'dashboard' }: SidebarProps) {
  const pathname = usePathname()

  return (
    <aside className="w-55 shrink-0 bg-[#1e3a5f] flex flex-col h-screen sticky top-0 overflow-y-auto">
      {/* Brand */}
      <div className="px-5 pt-6 pb-4.5 border-b border-white/6">
        <Link href="/dashboard" className="flex items-center gap-2.5 group">
          <div
            className="shrink-0 flex items-center justify-center text-lg"
            style={{ width: 38, height: 38, borderRadius: 11, background: '#00C47A' }}
          >
            🏠
          </div>
          <div className="leading-tight">
            <div className="text-[17px] font-extrabold text-white tracking-tight group-hover:text-emerald-300 transition-colors">
              Dealer<span className="text-emerald-400">Pro</span>
            </div>
            <div className="text-[9px] text-white/30 font-medium tracking-wide">
              by Shri Ram Krishna Group
            </div>
          </div>
        </Link>
      </div>

      {/* Nav items */}
      <nav className="flex-1 overflow-y-auto" style={{ padding: '12px 10px' }}>
        {NAV_ITEMS.map(item => {
          const isActive = pathname === item.href || activeKey === item.key
          return (
            <Link
              key={item.key}
              href={item.href}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 12,
                padding: '10px 16px',
                borderRadius: 12,
                marginBottom: 2,
                position: 'relative',
                transition: 'background 0.15s, color 0.15s',
                background: isActive ? 'rgba(0,196,122,0.12)' : 'transparent',
                color:      isActive ? '#00C47A' : 'rgba(255,255,255,0.5)',
              }}
              className="hover:bg-white/6 hover:text-white!"
            >
              {isActive && (
                <div
                  className="absolute left-0 rounded-r bg-[#00C47A]"
                  style={{ top: '20%', bottom: '20%', width: 3 }}
                />
              )}
              <span className="text-[18px] leading-none text-center" style={{ width: 20 }}>
                {item.icon}
              </span>
              <span className={`text-[13px] ${isActive ? 'font-bold' : 'font-medium'}`}>
                {item.label}
              </span>
            </Link>
          )
        })}
      </nav>

      {/* User profile */}
      <div className="border-t border-white/6" style={{ padding: '16px 20px' }}>
        <div className="flex items-center gap-2.5 cursor-pointer group">
          <div
            className="flex items-center justify-center text-xs font-bold text-emerald-400 shrink-0"
            style={{
              width: 32,
              height: 32,
              borderRadius: 10,
              background: 'rgba(0,196,122,0.13)',
              border: '1.5px solid rgba(0,196,122,0.27)',
            }}
          >
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
