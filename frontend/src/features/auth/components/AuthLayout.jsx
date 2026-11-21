import Icon from '../../../shared/components/Icon.jsx'

function AuthLayout({
  pageType,
  eyebrow,
  switchText,
  switchLabel,
  switchHref,
  children,
}) {
  const isRegister = pageType === 'register'

  return (
    <main className="grid min-h-[calc(100vh-76px)] bg-[#f5f7f2] text-[#173b31] max-[700px]:min-h-[calc(100vh-66px)] lg:grid-cols-[minmax(0,0.9fr)_minmax(0,1.1fr)]">
      <aside className="relative hidden min-h-[calc(100vh-76px)] overflow-hidden bg-[#153c32] px-10 py-9 text-white lg:flex lg:flex-col xl:px-16">
        <div className="relative z-10 mt-[clamp(56px,10vh,112px)] max-w-xl">
          <p className="mb-4 inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/5 px-3 py-2 text-xs font-semibold text-[#c8e6d2]">
            <span className="size-2 rounded-full bg-[#8ed3a5]" />
            Nexo U para estudiantes
          </p>
          <h2 className="max-w-lg font-display text-[clamp(2.25rem,4.1vw,3.75rem)] font-semibold leading-[1.04] tracking-[-0.045em] text-white">
            Tu experiencia y tus cursos cuentan.
          </h2>
          <p className="mt-5 max-w-md text-base leading-7 text-[#c2d5ca]">
            Organiza tus credenciales y encuentra becas y pasantías que se ajusten a tu perfil.
          </p>
        </div>

        <div className="relative z-10 mt-auto w-full max-w-xl rounded-2xl border border-white/15 bg-white/[0.08] p-5 shadow-2xl shadow-black/10 backdrop-blur-sm">
          <div className="flex items-center justify-between gap-4">
            <div>
              <p className="text-sm font-semibold text-[#b7d8c2]">Billetera estudiantil</p>
              <p className="mt-2 font-display text-xl font-semibold text-white">Habilidades, cursos y credenciales</p>
            </div>
            <span className="grid size-12 shrink-0 place-items-center rounded-xl bg-[#c9efd9] text-[#174a39]"><Icon name="check" className="size-6" /></span>
          </div>
          <div className="mt-5 flex flex-wrap gap-2">
            {['Habilidades', 'Cursos', 'Credenciales'].map((item) => (
              <span className="rounded-full border border-white/15 bg-white/5 px-3 py-1.5 text-sm text-[#d6e8dc]" key={item}>{item}</span>
            ))}
          </div>
        </div>
      </aside>

      <section className="flex min-h-[calc(100vh-76px)] items-start justify-center px-4 py-6 sm:px-8 sm:py-8 lg:items-center lg:px-10 xl:px-12 max-[700px]:min-h-[calc(100vh-66px)]">
        <div className={['w-full', isRegister ? 'max-w-[640px]' : 'max-w-[560px]'].join(' ')}>
          <div className="rounded-3xl border border-[#e1e9df] bg-white p-6 shadow-[0_20px_60px_rgba(24,58,43,0.08)] sm:p-9">
            <div className={`mt-8 ${isRegister ? 'mb-6' : 'mb-8'}`}>
              <p className="mb-2 text-sm font-semibold text-[#347a57]">{eyebrow}</p>
              <h1 className="font-display text-3xl font-semibold leading-tight tracking-[-0.04em] text-[#173b31] sm:text-4xl" id="auth-form-title">
                {isRegister ? 'Crea tu cuenta' : 'Inicia sesión'}
              </h1>
              <p className="mt-3 text-base leading-6 text-[#68776d]">
                {isRegister ? 'Un perfil para tus próximos pasos.' : 'Ingresa tus datos para continuar.'}
              </p>
            </div>

            {children}

            <div className="mt-5 flex flex-wrap items-center justify-center gap-1.5 text-sm text-[#6e7e73]">
              <span>{switchText}</span>
              <a className="rounded-sm font-semibold text-[#236b4d] underline-offset-4 hover:underline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#236b4d]" href={switchHref}>
                {switchLabel}
              </a>
            </div>

            <p className="mt-7 flex items-center justify-center gap-2 text-center text-sm text-[#748278]">
              <span className="text-lg text-[#4d8c64]" aria-hidden="true">⌁</span>
              Tu información es tuya. Tú decides qué compartir.
            </p>
          </div>

          <p className="mt-5 text-center text-xs text-[#87948a]">© Nexo U · Tu camino, tus oportunidades.</p>
        </div>
      </section>
    </main>
  )
}

export default AuthLayout
