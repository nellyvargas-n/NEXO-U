import OpportunityDemo from '../landing/components/OpportunityDemo.jsx'
import Surface from '../student-app/components/Surface.jsx'

function InternshipsPage() {
  return (
    <div className="grid max-w-3xl gap-5">
      <OpportunityDemo />
      <Surface className="bg-[#f8faf6]">
        <h2 className="font-display text-lg font-semibold text-[#1c4033]">Sobre esta convocatoria</h2>
        <p className="mt-2 text-sm leading-6 text-[#66776b]">Los datos de esta pasantía son ficticios. El matching sirve para mostrar el flujo y no representa una postulación ni una selección real.</p>
      </Surface>
    </div>
  )
}

export default InternshipsPage
