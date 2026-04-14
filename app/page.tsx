import Link from 'next/link'

export const metadata = {
  title: 'DealerPro — Premium Property Dealers CRM',
}

export default function HomePage() {
  return (
    <main className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-emerald-950 flex items-center justify-center px-4 relative overflow-hidden">
      {/* Ambient glow */}
      <div className="absolute top-1/3 left-1/4 w-96 h-96 rounded-full pointer-events-none"
        style={{ background: 'radial-gradient(circle, rgba(16,185,129,0.08) 0%, transparent 70%)' }} />
      <div className="absolute bottom-1/3 right-1/4 w-96 h-96 rounded-full pointer-events-none"
        style={{ background: 'radial-gradient(circle, rgba(52,211,153,0.06) 0%, transparent 70%)' }} />

      <div className="relative z-10 text-center max-w-2xl">
        {/* Brand */}
        <div className="flex items-center justify-center gap-3 mb-8">
          <span className="text-5xl select-none">🏠</span>
          <span className="text-4xl font-extrabold text-white tracking-tight">
            Dealer<span className="text-emerald-400">Pro</span>
          </span>
        </div>

        {/* Tagline */}
        <p className="text-slate-300 text-xl font-medium mb-3">
          Premium Property Dealers CRM
        </p>
        <p className="text-slate-400 text-base mb-10 max-w-md mx-auto leading-relaxed">
          Manage listings, track leads, and close deals faster — built for real estate professionals across India.
        </p>

        {/* Feature pills */}
        <div className="flex flex-wrap justify-center gap-2 mb-10">
          {[
            '🏠 Property Inventory',
            '📍 Map View',
            '💼 Lead CRM',
            '💬 WhatsApp',
            '📊 Analytics',
            '📱 Mobile PWA',
          ].map(f => (
            <span
              key={f}
              className="text-sm text-emerald-300 px-4 py-1.5 rounded-full font-medium"
              style={{
                background: 'rgba(52,211,153,0.08)',
                border: '1px solid rgba(52,211,153,0.18)',
              }}
            >
              {f}
            </span>
          ))}
        </div>

        {/* CTA */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link
            href="/dashboard"
            className="px-8 py-3.5 bg-emerald-500 hover:bg-emerald-400 text-white font-bold rounded-2xl text-base transition-all hover:-translate-y-0.5"
            style={{ boxShadow: '0 8px 24px rgba(16,185,129,0.3)' }}
          >
            Go to Dashboard →
          </Link>
          <Link
            href="/login"
            className="px-8 py-3.5 text-white font-bold rounded-2xl text-base transition-all hover:-translate-y-0.5"
            style={{
              background: 'rgba(255,255,255,0.08)',
              border: '1px solid rgba(255,255,255,0.15)',
            }}
          >
            Sign In
          </Link>
        </div>

        <p className="text-slate-600 text-sm mt-10">
          Built for property dealers in India · DealerPro v1.0
        </p>
      </div>
    </main>
  )
}