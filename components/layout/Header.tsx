import Link from 'next/link'

interface HeaderProps {
  title:    string
  subtitle?: string
}

export default function Header({ title, subtitle }: HeaderProps) {
  return (
    <header
      className="bg-white border-b border-[#E8ECF4] flex items-center justify-between sticky top-0 z-50"
      style={{
        height: 60,
        padding: '0 24px',
        boxShadow: '0 1px 4px rgba(0,0,0,0.04)',
      }}
    >
      <div>
        <div className="text-[15px] font-bold text-[#0B1120]">{title}</div>
        {subtitle && (
          <div className="text-[11px] text-slate-400 font-medium">{subtitle}</div>
        )}
      </div>

      <div className="flex items-center gap-2.5">
        <Link
          href="/dashboard"
          style={{ borderRadius: 12, padding: '7px 14px' }}
          className="inline-flex items-center gap-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-[13px] font-bold transition"
        >
          📋 Follow-ups
        </Link>
        <Link
          href="/add-property"
          style={{
            borderRadius: 12,
            padding: '7px 14px',
            boxShadow: '0 2px 8px rgba(0,196,122,0.2)',
          }}
          className="inline-flex items-center gap-1.5 bg-emerald-500 hover:bg-emerald-600 text-white text-[13px] font-bold transition"
        >
          + Add Property
        </Link>
      </div>
    </header>
  )
}
