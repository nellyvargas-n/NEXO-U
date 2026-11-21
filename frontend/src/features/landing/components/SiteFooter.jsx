import BrandMark from '../../../shared/components/BrandMark.jsx'

function SiteFooter() {
  return (
    <footer className="border-t border-[#e5ebe2] bg-[#f7f9f4] px-5 py-7 sm:px-8">
      <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-4">
        <BrandMark size="small" href="/" />
        <p className="m-0 max-w-xl text-sm leading-6 text-[#718075]">Credenciales y oportunidades para tu camino universitario.</p>
        <span className="text-sm text-[#87948a]">Un proyecto en construcción.</span>
      </div>
    </footer>
  )
}

export default SiteFooter
