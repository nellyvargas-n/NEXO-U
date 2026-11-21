import Surface from '../student-app/components/Surface.jsx'

function OpportunitiesPage() {
  return (
    <div className="grid max-w-4xl gap-5">
      <Surface className="p-0">
        <div className="flex flex-wrap items-start justify-between gap-4 p-5 sm:p-6">
          <div>
            <p className="text-sm font-medium text-[#758579]">Pasantía · Tecnología</p>
            <h2 className="mt-2 font-display text-xl font-semibold text-[#1c4033]">Pasantía de desarrollo</h2>
            <p className="mt-2 max-w-xl text-sm leading-6 text-[#66776b]">Convocatoria ficticia para mostrar cómo Nexo U explica requisitos cumplidos y pendientes.</p>
          </div>
          <span className="rounded-full bg-[#edf4e8] px-3 py-1.5 text-xs font-semibold text-[#39704d]">4 de 5 requisitos</span>
        </div>
        <div className="flex flex-wrap items-center justify-between gap-3 border-t border-[#edf1eb] px-5 py-4 sm:px-6">
          <span className="text-sm text-[#78867b]">Requisito pendiente: Inglés B1</span>
          <a className="inline-flex min-h-10 items-center gap-2 text-sm font-semibold text-[#246b4a] hover:underline" href="/app/oportunidades/pasantias">Ver requisitos <span aria-hidden="true">→</span></a>
        </div>
      </Surface>
      <Surface className="bg-[#f8faf6]">
        <p className="text-sm font-semibold text-[#435e4b]">Fuente de ejemplo</p>
        <p className="mt-2 text-sm leading-6 text-[#66776b]">Esta convocatoria no es oficial. En un piloto, cada oportunidad debe incluir un enlace vigente a la institución que la publica.</p>
      </Surface>
    </div>
  )
}

export default OpportunitiesPage
