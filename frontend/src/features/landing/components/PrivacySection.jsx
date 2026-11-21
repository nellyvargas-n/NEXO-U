import Icon from '../../../shared/components/Icon.jsx'

function PrivacySection() {
  return (
    <section className="scroll-mt-24 px-5 pb-24 sm:px-8 lg:pb-28" id="privacidad" aria-labelledby="privacy-title">
      <div className="mx-auto grid max-w-7xl grid-cols-[auto_minmax(0,1fr)_minmax(240px,0.7fr)] items-center gap-8 rounded-3xl border border-[#dce9dd] bg-[#f0f6ed] p-8 sm:p-10 max-[900px]:grid-cols-[auto_minmax(0,1fr)] max-[700px]:gap-5 max-[700px]:p-6 max-[520px]:grid-cols-1">
        <div className="grid size-16 place-items-center rounded-2xl bg-[#e1efdc] text-[#568566] max-[700px]:size-14" aria-hidden="true">
          <svg className="size-9" viewBox="0 0 52 52" fill="none">
            <path d="M26 5 43 12v12c0 11-7.2 18.5-17 23C16.2 42.5 9 35 9 24V12l17-7Z" stroke="currentColor" strokeWidth="2.5" />
            <path d="m18.5 26 5 5 10.5-11" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </div>

        <div>
          <p className="mb-3 text-sm font-semibold text-[#347a57]">Privacidad</p>
          <h2 className="font-display text-2xl font-semibold leading-tight tracking-[-0.035em] text-[#173b31] sm:text-3xl" id="privacy-title">
            Tú decides qué información compartir.
          </h2>
          <p className="mb-0 mt-4 max-w-2xl text-base leading-7 text-[#68776d]">
            El registro de ingresos y gastos es opcional. Si priorizas apoyos, Nexo U puede considerar una señal de necesidad sin mostrar tus montos personales a las organizaciones.
          </p>
        </div>

        <p className="m-0 flex items-start gap-3 rounded-2xl border border-[#dce8db] bg-white/75 p-5 text-sm leading-6 text-[#617267] max-[900px]:col-start-2 max-[520px]:col-start-1">
          <span className="grid size-8 shrink-0 place-items-center rounded-lg bg-[#e8f2e3] text-[#4e815f]"><Icon name="lock" className="size-4" /></span>
          <span><strong className="block text-sm font-semibold text-[#45654d]">Opcional por diseño</strong>Las organizaciones no ven tus montos personales.</span>
        </p>
      </div>
    </section>
  )
}

export default PrivacySection
