/* eslint-disable react-refresh/only-export-components -- route metadata and resolver intentionally live together. */
import LandingPage from '../features/landing/LandingPage.jsx'
import RegisterPage from '../features/auth/pages/RegisterPage.jsx'
import SignInPage from '../features/auth/pages/SignInPage.jsx'
import RequestPasswordResetPage from '../features/auth/pages/RequestPasswordResetPage.jsx'
import ResetPasswordPage from '../features/auth/pages/ResetPasswordPage.jsx'
import StudentApp from '../features/student-app/StudentApp.jsx'
import CompanyCourseValidationPage from '../features/company-validation/CompanyCourseValidationPage.jsx'
import AdminApp from '../features/admin/AdminApp.jsx'
import { adminAppRoutes } from '../features/admin/adminAppRoutes.js'
import { studentAppRoutes } from './studentAppRoutes.js'

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

export const routes = [
  { path: '/', currentPage: 'landing', layout: 'public', component: LandingPage },
  { path: '/login', currentPage: 'login', layout: 'public', component: SignInPage },
  { path: '/register', currentPage: 'register', layout: 'public', component: RegisterPage },
  { path: '/recuperar-clave', currentPage: 'login', layout: 'public', component: RequestPasswordResetPage },
  { path: '/reset', currentPage: 'login', layout: 'public', component: ResetPasswordPage },
  { path: '/empresa/cursos/validar', currentPage: 'company-validation', layout: 'company', component: CompanyCourseValidationPage },
  ...adminAppRoutes.map(({ path }) => ({
    path,
    currentPage: 'admin',
    layout: 'admin',
    component: AdminApp,
  })),
  ...studentAppRoutes.map(({ path }) => ({
    path,
    currentPage: 'student',
    layout: 'student',
    component: StudentApp,
  })),
]

const notFoundRoute = {
  currentPage: 'notfound',
  layout: 'public',
  component: NotFoundPage,
}

export function resolveAppRoute(pathname) {
  const normalizedPath = pathname.replace(/\/+$/, '') || '/'
  const route = routes.find((item) => item.path === normalizedPath)

  return route
    ? { ...route, pathname: normalizedPath }
    : { ...notFoundRoute, pathname: normalizedPath }
}
