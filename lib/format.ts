/** Format a price number as Indian rupee string — e.g. ₹45 L, ₹1.2 Cr */
export function fmtPrice(price: number): string {
  if (price >= 10_000_000) return `₹${(price / 10_000_000).toFixed(1)} Cr`
  if (price >= 100_000)    return `₹${(price / 100_000).toFixed(1)} L`
  return `₹${price.toLocaleString('en-IN')}`
}

/** Compact version without ₹ symbol — used in chart labels */
export function fmtCompact(price: number): string {
  if (price >= 10_000_000) return `${(price / 10_000_000).toFixed(1)}Cr`
  if (price >= 100_000)    return `${(price / 100_000).toFixed(0)}L`
  return price.toLocaleString('en-IN')
}
