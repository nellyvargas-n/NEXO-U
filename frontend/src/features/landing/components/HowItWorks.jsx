const steps = [
  {
    number: '01',
    title: 'Arma tu perfil',
    body: 'Reúne tus habilidades, cursos y credenciales en una sola billetera estudiantil.',
    icon: '◎',
  },
  {
    number: '02',
    title: 'Encuentra tu oportunidad',
    body: 'Compara tu perfil con becas y pasantías para saber qué requisitos ya cumples.',
    icon: '⌕',
  },
  {
    number: '03',
    title: 'Da el siguiente paso',
    body: 'Descubre qué te falta y una ruta posible para completar el requisito a tiempo.',
    icon: '↗',
  },
]

function HowItWorks() {
  return (
    <section className="steps-section" id="como-funciona">
      <div className="section-heading">
        <p className="eyebrow"><span /> SIMPLE DESDE EL PRIMER DÍA</p>
        <h2>Tu perfil también puede abrir puertas.</h2>
        <p>Una ruta clara entre lo que ya sabes y la oportunidad que estás buscando.</p>
      </div>
      <div className="steps-grid">
        {steps.map((step) => (
          <article className="step-card" key={step.number}>
            <div className="step-card__top"><span className="step-card__icon" aria-hidden="true">{step.icon}</span><span>{step.number}</span></div>
            <h3>{step.title}</h3>
            <p>{step.body}</p>
          </article>
        ))}
      </div>
    </section>
  )
}

export default HowItWorks
