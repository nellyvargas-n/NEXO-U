import Icon from '../../../shared/components/Icon.jsx'

const steps = [
  {
    number: '01',
    title: 'Arma tu perfil',
    body: 'Reúne tus habilidades, cursos y credenciales en una sola billetera estudiantil.',
    icon: 'user',
  },
  {
    number: '02',
    title: 'Compara requisitos',
    body: 'Revisa cómo tu perfil coincide con los requisitos de becas y pasantías.',
    icon: 'list',
  },
  {
    number: '03',
    title: 'Completa lo que falta',
    body: 'Encuentra un siguiente paso posible para acercarte a una oportunidad.',
    icon: 'arrow-up-right',
  },
]

function HowItWorks() {
  return (
    <section className="nx-how-section scroll-mt-24 bg-white px-5 py-24 sm:px-8 lg:py-28" id="como-funciona" aria-labelledby="how-title">
      <div className="mx-auto max-w-7xl">
        <div className="mb-12 max-w-2xl sm:mb-14">
          <p className="mb-3 text-sm font-semibold text-[#347a57]">Cómo funciona</p>
          <h2 className="font-display text-3xl font-semibold leading-tight tracking-[-0.04em] text-[#173b31] sm:text-4xl" id="how-title">
            De tus credenciales a tu próxima oportunidad.
          </h2>
          <p className="mt-4 text-base leading-7 text-[#68776d]">
            Nexo U organiza tu información y te ayuda a identificar los requisitos que puedes completar.
          </p>
        </div>

        <div className="grid grid-cols-3 gap-4 max-[800px]:grid-cols-1 max-[800px]:gap-3">
          {steps.map((step) => (
            <article className="rounded-2xl border border-[#e4ebe2] bg-white p-6 sm:p-7" key={step.number}>
              <div className="flex items-center justify-between">
                <span className="grid size-12 place-items-center rounded-xl bg-[#eaf3e7] text-[#3d8058]">
                  <Icon name={step.icon} className="size-5" />
                </span>
                <span className="text-sm font-semibold tabular-nums text-[#9aa79d]">{step.number}</span>
              </div>
              <h3 className="mt-7 font-display text-xl font-semibold tracking-[-0.02em] text-[#234538]">{step.title}</h3>
              <p className="mb-0 mt-3 max-w-sm text-base leading-7 text-[#718075]">{step.body}</p>
            </article>
          ))}
        </div>
      </div>
    </section>
  )
}

export default HowItWorks
