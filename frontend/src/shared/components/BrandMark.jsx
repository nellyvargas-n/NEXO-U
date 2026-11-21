function BrandMark({ compact = false, compactOnNarrow = false, href = '#inicio', inverse = false, size = 'default', className = '' }) {
  const symbolSize = size === 'small'
    ? 'size-[29px] rounded-[9px] [&_svg]:size-[22px]'
    : size === 'large'
      ? 'size-9 rounded-[11px] [&_svg]:size-[25px]'
      : 'size-[34px] rounded-[11px] [&_svg]:size-[25px]'

  return (
    <a className={`inline-flex items-center gap-[9px] no-underline ${inverse ? 'text-[#f7fbf7]' : 'text-[#15312f]'} ${className}`} href={href} aria-label="Nexo U, inicio">
      <span className={`grid shrink-0 place-items-center ${symbolSize} ${inverse ? 'border border-[#dcf4e3]/[0.17] bg-[#c9efd9] text-[#1b493b]' : 'bg-[#16493e] text-white'}`} aria-hidden="true">
        <svg viewBox="0 0 36 36" fill="none">
          <path d="M8 26.5V9.5l20 17V9.5" stroke="currentColor" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round" />
          <circle cx="28" cy="27" r="3" fill="currentColor" />
        </svg>
      </span>
      {!compact && <span className={`font-display font-semibold tracking-[-1.1px] ${size === 'small' ? 'text-[17px]' : 'text-xl'} ${inverse ? 'text-[#f7fbf7]' : 'text-[#15312f]'} ${compactOnNarrow ? 'max-[360px]:hidden' : ''}`}>nexo <strong className={`font-extrabold ${inverse ? 'text-[#99d6ac]' : 'text-[#247858]'}`}>U</strong></span>}
    </a>
  )
}

export default BrandMark
