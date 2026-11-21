function BrandMark({ compact = false, href = '#inicio' }) {
  return (
    <a className={`brand${compact ? ' brand--compact' : ''}`} href={href} aria-label="Nexo U, inicio">
      <span className="brand__symbol" aria-hidden="true">
        <svg viewBox="0 0 36 36" fill="none">
          <path d="M8 26.5V9.5l20 17V9.5" stroke="currentColor" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round" />
          <circle cx="28" cy="27" r="3" fill="currentColor" />
        </svg>
      </span>
      {!compact && <span className="brand__name">nexo <strong>U</strong></span>}
    </a>
  )
}

export default BrandMark
