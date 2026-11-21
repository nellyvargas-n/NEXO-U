import OpportunityDemo from '../landing/components/OpportunityDemo.jsx'
import Surface from '../student-app/components/Surface.jsx'

function SummaryPage() {
  return (
    <>
      <div className="mb-6 rounded-2xl border border-[#dbe9d8] bg-[#f0f6ec] px-5 py-4 sm:px-6">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <p className="text-sm font-semibold text-[#276c4d]">Pasantía recomendada</p>
            <p className="mt-1 text-sm leading-6 text-[#526b5a]">Camila cumple 4 de 5 requisitos. Inglés B1 es el paso pendiente.</p>
          </div>
          <a className="inline-flex min-h-11 items-center justify-center gap-2 rounded-xl bg-[#1d6245] px-4 text-sm font-semibold text-white transition hover:bg-[#174f39] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#247858]" href="/app/rutas/ingles-b1">
            Ver ruta de Inglés B1
            <span aria-hidden="true">→</span>
          </a>
        </div>
      </div>

      <div className="grid items-start gap-5 xl:grid-cols-[minmax(0,1.45fr)_minmax(260px,0.8fr)]">
        <div>
          <p className="mb-3 text-sm font-semibold text-[#51675a]">Oportunidad destacada</p>
          <OpportunityDemo />
        </div>
        <div className="grid gap-5">
          <Surface>
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-sm font-semibold text-[#66776b]">Siguiente paso</p>
                <h2 className="mt-2 font-display text-xl font-semibold tracking-[-0.03em] text-[#1c4033]">Completar Inglés B1</h2>
              </div>
              <span className="grid size-10 shrink-0 place-items-center rounded-xl bg-[#edf4e8] text-[#36724d]" aria-hidden="true">↗</span>
            </div>
            <p className="mt-3 text-sm leading-6 text-[#66776b]">El curso de ejemplo ofrece la credencial solicitada. En una convocatoria real también deben verificarse sus fechas y la fuente oficial.</p>
            <a className="mt-5 inline-flex min-h-10 items-center gap-2 text-sm font-semibold text-[#246b4a] underline-offset-4 hover:underline" href="/app/rutas/ingles-b1">Revisar curso <span aria-hidden="true">→</span></a>
          </Surface>

          <Surface className="bg-[#f8faf6]">
            <h2 className="font-display text-lg font-semibold tracking-[-0.02em] text-[#1c4033]">Cómo se calcula el match</h2>
            <p className="mt-2 text-sm leading-6 text-[#66776b]">Nexo U compara cada requisito obligatorio con el perfil y las credenciales. El resultado explica compatibilidad; la institución decide la postulación.</p>
          </Surface>
        </div>
      </div>
    </>
  )
}

export default SummaryPage
