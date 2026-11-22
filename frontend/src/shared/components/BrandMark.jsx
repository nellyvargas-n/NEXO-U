/** Identidad única NEXO U: birrete + logotipo, sin dependencias externas. */
function BrandMark({ compact = false, compactOnNarrow = false, href = '/', inverse = false, size = 'default', className = '' }) {
  return (
    <a className={`nexo-brand ${inverse ? 'nexo-brand-inverse' : ''} ${size === 'small' ? 'nexo-brand-small' : ''} ${className}`} href={href} aria-label="NEXO U, ir al inicio">
      <span className="nexo-brand-symbol" aria-hidden="true">
        <svg viewBox="0 0 44 44" fill="none"><path d="M3 16.5 22 6 41 16.5 22 27 3 16.5Z" fill="currentColor"/><path d="M11 21.5v8c6.7 5.4 15.3 5.4 22 0v-8" stroke="currentColor" strokeWidth="3" strokeLinecap="round"/><path d="M40.5 17v14" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"/><circle cx="40.5" cy="33" r="2.5" fill="currentColor"/></svg>
      </span>
      {!compact && <span className={`nexo-brand-word ${compactOnNarrow ? 'nexo-brand-collapse' : ''}`}>NEXO <strong>U</strong></span>}
    </a>
  )
}
export default BrandMark
