import LandingPage from './features/landing/LandingPage.jsx'
import RegisterPage from './features/auth/pages/RegisterPage.jsx'
import SignInPage from './features/auth/pages/SignInPage.jsx'
import PublicNavbar from './features/navigation/components/PublicNavbar.jsx'

function NotFoundPage() {
  return (
    <main className="grid min-h-[calc(100vh-76px)] place-items-center px-6 py-16 text-center max-[700px]:min-h-[calc(100vh-66px)]">
      <div className="max-w-lg">
        <p className="text-sm font-semibold text-[#347a57]">404 · Página no encontrada</p>
        <h1 className="mt-3 font-display text-4xl font-semibold tracking-tight text-[#173b31]">No encontramos esa página.</h1>
        <p className="mt-4 text-base leading-7 text-[#68776d]">Vuelve al inicio para ver la demo de Nexo U.</p>
        <a className="mt-7 inline-flex min-h-12 items-center rounded-xl bg-[#1c5a42] px-5 text-sm font-semibold text-white transition hover:bg-[#247452] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#1c5a42]" href="/">Volver al inicio</a>
      </div>
    </main>
  )
}

function App() {
  const path = window.location.pathname.replace(/\/+$/, '') || '/'
  const currentPage = path === '/' ? 'landing' : path === '/register' ? 'register' : path === '/login' ? 'login' : 'notfound'

  let page
  if (path === '/login') page = <SignInPage />
  else if (path === '/register') page = <RegisterPage />
  else if (path === '/') page = <LandingPage />
  else page = <NotFoundPage />

  return (
    <div className="min-h-screen overflow-x-clip bg-[#fbfcf8]">
      <PublicNavbar currentPage={currentPage} />
      <div className="pt-[76px] max-[700px]:pt-[66px]">{page}</div>
    </div>
  )
}

export default App
