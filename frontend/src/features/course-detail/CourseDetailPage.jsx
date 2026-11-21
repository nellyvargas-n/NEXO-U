import Surface from '../student-app/components/Surface.jsx'

function CourseDetailPage() {
  return (
    <div className="grid max-w-4xl gap-5 md:grid-cols-[minmax(0,1.2fr)_minmax(250px,0.8fr)]">
      <Surface>
        <p className="text-sm font-semibold text-[#3a7653]">Curso sugerido · ejemplo</p>
        <h2 className="mt-2 font-display text-2xl font-semibold tracking-[-0.03em] text-[#1c4033]">Inglés B1</h2>
        <p className="mt-3 text-sm leading-6 text-[#66776b]">Capacitación de seis semanas con una credencial vinculada al requisito pendiente de la pasantía de ejemplo.</p>
        <div className="mt-5 rounded-xl border border-[#e6ece3] bg-[#f8faf6] p-4">
          <p className="text-xs font-semibold text-[#7a897e]">ESTADO DE LA DEMO</p>
          <p className="mt-2 text-sm leading-6 text-[#596f60]">Esta pantalla no registra una inscripción. La validación del emisor se muestra en la tarjeta del resumen.</p>
        </div>
        <a className="mt-5 inline-flex min-h-10 items-center gap-2 text-sm font-semibold text-[#246b4a] hover:underline" href="/app">Volver al resumen <span aria-hidden="true">→</span></a>
      </Surface>
      <Surface className="bg-[#f8faf6]">
        <h2 className="font-display text-lg font-semibold text-[#1c4033]">Después del curso</h2>
        <p className="mt-2 text-sm leading-6 text-[#66776b]">El emisor confirma la credencial y el motor vuelve a comparar los requisitos.</p>
      </Surface>
    </div>
  )
}

export default CourseDetailPage
