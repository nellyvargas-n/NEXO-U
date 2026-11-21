import LandingPage from './features/landing/LandingPage.jsx'
import RegisterPage from './features/auth/pages/RegisterPage.jsx'
import SignInPage from './features/auth/pages/SignInPage.jsx'

function App() {
  const path = window.location.pathname.replace(/\/+$/, '') || '/'

  if (path === '/login') return <SignInPage />
  if (path === '/register') return <RegisterPage />

  return <LandingPage />
}

export default App
