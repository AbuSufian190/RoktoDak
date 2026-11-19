export default function Logo({ size = 34 }) {
  return (
    <span className="flex items-center gap-2">
      <svg width={size} height={size} viewBox="0 0 32 32" aria-hidden="true">
        <path d="M16 3C16 3 6 14 6 20a10 10 0 0 0 20 0C26 14 16 3 16 3z" fill="#B91C1C" />
        <path d="M8 20h5l2-4 3 7 2-3h4" fill="none" stroke="#fff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
      <span className="leading-tight">
        <span className="block font-bn text-lg font-bold text-brand">রক্তডাক</span>
        <span className="block text-xs font-semibold tracking-wide text-ink">RoktoDak</span>
      </span>
    </span>
  )
}
