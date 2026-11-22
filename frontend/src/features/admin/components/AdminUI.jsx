export function AdminPageHeading({ eyebrow, title, description }) {
  return (
    <div className="mb-7 max-w-3xl">
      <p className="mb-2 text-sm font-semibold text-[#347a57]">{eyebrow}</p>
      <h1 className="font-display text-3xl font-semibold tracking-[-0.04em] text-[#183a30] sm:text-[2.5rem]">{title}</h1>
      {description && <p className="mt-3 max-w-2xl text-base leading-7 text-[#66776b]">{description}</p>}
    </div>
  )
}

export function AdminSurface({ children, className = '' }) {
  return <section className={['rounded-2xl border border-[#e4ebe1] bg-white p-5 sm:p-6', className].join(' ')}>{children}</section>
}

export function AdminNotice({ children, tone = 'error' }) {
  const styles = tone === 'success'
    ? 'border-[#d5e8d3] bg-[#f1f8ec] text-[#365f43]'
    : tone === 'warning'
      ? 'border-[#e8dfbd] bg-[#fff9e9] text-[#75633b]'
      : 'border-[#f1c3c0] bg-[#fff4f2] text-[#9b302a]'

  return <p className={`m-0 rounded-xl border px-4 py-3 text-sm leading-5 ${styles}`} role={tone === 'error' ? 'alert' : 'status'}>{children}</p>
}

export function AdminLoading({ children = 'Cargando información administrativa…' }) {
  return <AdminSurface><p className="m-0 py-4 text-sm text-[#718075]" role="status">{children}</p></AdminSurface>
}

export function AdminEmpty({ children }) {
  return <div className="rounded-xl border border-dashed border-[#d8e2d7] bg-[#fbfcf8] px-5 py-8 text-center text-sm leading-6 text-[#718075]">{children}</div>
}

export function AdminStatus({ active, yes = 'Activo', no = 'Pendiente' }) {
  return (
    <span className={[
      'inline-flex items-center rounded-full px-3 py-1 text-xs font-semibold',
      active ? 'bg-[#e8f2e6] text-[#286345]' : 'bg-[#fff5de] text-[#84662b]',
    ].join(' ')}>
      {active ? yes : no}
    </span>
  )
}

export const adminPrimaryButton = 'inline-flex min-h-10 items-center justify-center rounded-xl bg-[#1c5a42] px-4 text-sm font-semibold text-white focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#1c5a42] disabled:cursor-wait disabled:opacity-60'
export const adminSecondaryButton = 'inline-flex min-h-10 items-center justify-center rounded-xl border border-[#d8e2d7] bg-white px-4 text-sm font-semibold text-[#315c46] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#438c61] disabled:cursor-wait disabled:opacity-60'
