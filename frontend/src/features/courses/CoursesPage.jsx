import Surface from '../student-app/components/Surface.jsx'

function CoursesPage() {
  return (
    <div className="grid max-w-4xl gap-5">
      <Surface className="p-0">
        <div className="flex flex-wrap items-start justify-between gap-4 p-5 sm:p-6">
          <div>
            <p className="text-sm font-medium text-[#758579]">Credencial vinculada · Inglés B1</p>
            <h2 className="mt-2 font-display text-xl font-semibold text-[#1c4033]">Curso de Inglés B1</h2>
            <p className="mt-2 max-w-xl text-sm leading-6 text-[#66776b]">Curso ficticio de seis semanas, sugerido porque aporta la credencial que falta en la oportunidad de ejemplo.</p>
          </div>
          <span className="rounded-full bg-[#edf4e8] px-3 py-1.5 text-xs font-semibold text-[#39704d]">Ejemplo</span>
        </div>
        <div className="flex flex-wrap items-center justify-between gap-3 border-t border-[#edf1eb] px-5 py-4 sm:px-6">
          <span className="text-sm text-[#78867b]">Emisor y fechas por verificar</span>
          <a className="inline-flex min-h-10 items-center gap-2 text-sm font-semibold text-[#246b4a] hover:underline" href="/app/rutas/ingles-b1">Ver detalle <span aria-hidden="true">→</span></a>
        </div>
      </Surface>
    </div>
  )
}

export default CoursesPage
