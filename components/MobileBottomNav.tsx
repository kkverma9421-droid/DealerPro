'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'

const NAV_ITEMS = [
  { icon: '🏠', label: 'Home',       href: '/dashboard', activeOn: '/dashboard'  },
  { icon: '🏘', label: 'Properties', href: '/dashboard', activeOn: null           },
  { icon: '💼', label: 'Leads',      href: '/leads',     activeOn: '/leads'       },
  { icon: '📅', label: 'Follow-up',  href: '/leads',     activeOn: null           },
  { icon: '📊', label: 'Analytics',  href: '/analytics', activeOn: '/analytics'   },
]

export default function MobileBottomNav({
  leadsBadge   = 0,
  overduesBadge = 0,
}: {
  leadsBadge?:    number
  overduesBadge?: number
}) {
  const pathname = usePathname()

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 md:hidden bg-white border-t border-[#E8ECF4] flex shadow-[0_-4px_20px_rgba(0,0,0,0.08)]">
      {NAV_ITEMS.map((item, i) => {
        const isActive = item.activeOn !== null && pathname === item.activeOn
        const badge    = item.label === 'Leads' ? leadsBadge
          : item.label === 'Follow-up' ? overduesBadge : 0

        return (
          <Link
            key={i}
            href={item.href}
            className={`relative flex-1 flex flex-col items-center justify-center py-2.5 gap-0.5 transition-colors ${
              isActive ? 'text-emerald-600' : 'text-[#94A3B8] hover:text-emerald-500'
            }`}
          >
            {isActive && (
              <span className="absolute top-0 inset-x-0 h-[2px] bg-emerald-500 rounded-b" />
            )}
            {badge > 0 && (
              <span className="absolute top-1.5 left-[calc(50%+5px)] min-w-[14px] h-3.5 flex items-center justify-center bg-red-500 text-white text-[7px] font-extrabold rounded-full px-0.5 leading-none">
                {badge > 9 ? '9+' : badge}
              </span>
            )}
            <span className="text-[18px] leading-none select-none">{item.icon}</span>
            <span className={`text-[9px] tracking-wide ${isActive ? 'font-bold' : 'font-semibold'}`}>
              {item.label}
            </span>
          </Link>
        )
      })}
    </nav>
  )
}
