import Surface from '../student-app/components/Surface.jsx'

function ScholarshipsPage() {
  return (
    <Surface className="max-w-3xl">
      <p className="text-sm font-semibold text-[#3a7653]">Convocatorias institucionales</p>
      <h2 className="mt-2 font-display text-xl font-semibold text-[#1c4033]">Becas con reglas publicadas</h2>
      <p className="mt-3 text-sm leading-6 text-[#66776b]">La demo no contiene becas oficiales. Nexo U solo calcula una banda de beca cuando la universidad publica umbrales y condiciones verificables.</p>
      <a className="mt-5 inline-flex min-h-10 items-center gap-2 text-sm font-semibold text-[#246b4a] hover:underline" href="/app/oportunidades">Ver oportunidades de ejemplo <span aria-hidden="true">→</span></a>
    </Surface>
  )
}

export default ScholarshipsPage
