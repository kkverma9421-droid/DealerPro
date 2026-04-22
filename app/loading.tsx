export default function GlobalLoading() {
  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center">
      <div className="flex flex-col items-center gap-4">
        <div className="flex items-center gap-2.5">
          <span className="text-3xl select-none">🏠</span>
          <span className="text-2xl font-extrabold text-slate-800">
            Dealer<span className="text-emerald-500">Pro</span>
          </span>
        </div>
        <div className="flex gap-1.5">
          {[0, 1, 2].map(i => (
            <span
              key={i}
              className="w-2 h-2 bg-emerald-400 rounded-full animate-bounce"
              style={{ animationDelay: `${i * 0.15}s` }}
            />
          ))}
        </div>
      </div>
    </div>
  )
}
