import Link from 'next/link'

interface HeaderProps {
  title:    string
  subtitle?: string
}

export default function Header({ title, subtitle }: HeaderProps) {
  return (
    <header className="bg-white border-b border-[#E8ECF4] px-6 h-[60px] flex items-center justify-between sticky top-0 z-50 shadow-[0_1px_4px_rgba(0,0,0,0.04)]">
      <div>
        <div className="text-[15px] font-bold text-[#0B1120]">{title}</div>
        {subtitle && (
          <div className="text-[11px] text-slate-400 font-medium">{subtitle}</div>
        )}
      </div>

      <div className="flex items-center gap-2.5">
        <Link
          href="/dashboard"
          className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-[13px] font-bold rounded-xl transition"
        >
          📋 Follow-ups
        </Link>
        <Link
          href="/add-property"
          className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-emerald-500 hover:bg-emerald-600 text-white text-[13px] font-bold rounded-xl transition shadow-[0_2px_8px_rgba(0,196,122,0.2)]"
        >
          + Add Property
        </Link>
      </div>
    </header>
  )
}
