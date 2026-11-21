import HowItWorks from './components/HowItWorks.jsx'
import PrivacySection from './components/PrivacySection.jsx'
import SiteFooter from './components/SiteFooter.jsx'
import Icon from '../../shared/components/Icon.jsx'

function LandingPage() {
  return (
    <>
      <main id="inicio">
        <section className="relative isolate overflow-hidden bg-[#f5f7f2]" aria-labelledby="hero-title">
          <div className="pointer-events-none absolute inset-0 z-0 overflow-hidden" aria-hidden="true">
            <img className="absolute inset-0 size-full scale-105 object-cover object-center opacity-100 blur-[1px]" src="/fondo.png" alt="" />
            <div className="absolute inset-0 bg-gradient-to-r from-[#f5f7f2]/50 via-[#f5f7f2]/28 to-[#f5f7f2]/18" />
          </div>
          <div className="mx-auto flex min-h-[calc(100vh-76px)] max-w-7xl items-center px-6 py-20 max-[700px]:min-h-[calc(100vh-66px)] max-[700px]:px-5 max-[700px]:py-16 max-[390px]:px-4">
            <div className="relative z-10 max-w-3xl">
              <span className="pointer-events-none absolute -inset-x-10 -inset-y-14 -z-10 rounded-full bg-white/65 blur-3xl" aria-hidden="true" />
              <h1 className="mt-0 max-w-[820px] font-display text-[clamp(2.75rem,5.6vw,4.75rem)] font-semibold leading-[1.02] tracking-[-0.055em] text-[#111111] max-[700px]:text-[clamp(2.7rem,11vw,4rem)]" id="hero-title">
                Becas y pasantías para tu perfil.
              </h1>
              <p className="mt-6 max-w-2xl text-base leading-7 text-[#242824] sm:text-lg sm:leading-8">
                Nexo U reúne tus credenciales y compara tus requisitos con becas y pasantías. Mira qué ya cumples y qué te falta para postular.
              </p>
              <div className="mt-8 flex flex-wrap items-center gap-3 max-[430px]:items-stretch">
                <a className="inline-flex min-h-12 items-center justify-center gap-3 rounded-xl bg-[#1c5a42] px-5 text-sm font-semibold text-white shadow-lg shadow-[#1c5a42]/15 transition hover:-translate-y-0.5 hover:bg-[#247452] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#1c5a42] active:translate-y-0 max-[430px]:w-full" href="/register">
                  Crear mi perfil <Icon name="arrow-right" className="size-5" />
                </a>
                <a className="inline-flex min-h-12 items-center justify-center gap-2 rounded-xl px-4 text-sm font-semibold text-[#466555] transition hover:bg-white/70 hover:text-[#1c5a42] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#438c61] max-[430px]:w-full" href="#como-funciona">
                  Cómo funciona
                </a>
              </div>
            </div>
          </div>
        </section>
        <HowItWorks />
        <PrivacySection />
      </main>
      <SiteFooter />
    </>
  )
}

export default LandingPage
