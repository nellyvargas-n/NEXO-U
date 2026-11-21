import LandingPage from './features/landing/LandingPage.jsx'
import RegisterPage from './features/auth/pages/RegisterPage.jsx'
import SignInPage from './features/auth/pages/SignInPage.jsx'

function App() {
  const path = window.location.pathname.replace(/\/+$/, '') || '/'

  return (
    <div className="min-h-screen overflow-hidden pt-[76px] max-[700px]:pt-[66px]">
      {path === '/login' ? <SignInPage /> : path === '/register' ? <RegisterPage /> : <LandingPage />}
    </div>
  )
}

export default App
