import Surface from '../student-app/components/Surface.jsx'

function LearningPathsPage() {
  return (
    <div className="grid max-w-4xl gap-5 md:grid-cols-[minmax(0,1.2fr)_minmax(250px,0.8fr)]">
      <Surface>
        <p className="text-sm font-semibold text-[#3a7653]">Ruta para cerrar un requisito</p>
        <h2 className="mt-2 font-display text-2xl font-semibold tracking-[-0.03em] text-[#1c4033]">Inglés B1</h2>
        <p className="mt-3 text-sm leading-6 text-[#66776b]">La oportunidad de ejemplo solicita Inglés B1. La duración y el cierre deben comprobarse antes de recomendar una ruta real.</p>
        <div className="mt-5 grid gap-3 border-t border-[#edf1eb] pt-5 text-sm text-[#596f60] sm:grid-cols-2">
          <p><span className="block text-xs font-medium text-[#87948a]">Duración de ejemplo</span><span className="mt-1 block font-semibold text-[#365340]">6 semanas</span></p>
          <p><span className="block text-xs font-medium text-[#87948a]">Resultado esperado</span><span className="mt-1 block font-semibold text-[#365340]">Credencial Inglés B1</span></p>
        </div>
        <a className="mt-6 inline-flex min-h-11 items-center justify-center gap-2 rounded-xl bg-[#1d6245] px-4 text-sm font-semibold text-white transition hover:bg-[#174f39] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#247858]" href="/app/rutas/ingles-b1">Ver detalles del curso <span aria-hidden="true">→</span></a>
      </Surface>
      <Surface className="bg-[#f8faf6]">
        <h2 className="font-display text-lg font-semibold text-[#1c4033]">Regla de recomendación</h2>
        <p className="mt-2 text-sm leading-6 text-[#66776b]">Un curso solo aparece cuando aporta una habilidad o certificado que la convocatoria acepta.</p>
      </Surface>
    </div>
  )
}

export default LearningPathsPage
