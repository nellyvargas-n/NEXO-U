import { useEffect, useState } from 'react'
import BrandMark from '../../shared/components/BrandMark.jsx'
import StudentSidebar from '../../navigation/components/StudentSidebar.jsx'
import StudentPageHeading from './components/StudentPageHeading.jsx'
import { findStudentAppRoute } from '../../routes/studentAppRoutes.js'
import { getAccessRole, getAccessToken } from '../../shared/api/session.ts'
import { getCurrentUser } from '../../shared/api/modules/auth.service.ts'
import { getStudentProfiles } from '../profile/profile.service.ts'

function StudentApp({ pathname = '/app' }) {
  const [menuOpen, setMenuOpen] = useState(false)
  const [isCheckingRole, setIsCheckingRole] = useState(() => Boolean(getAccessToken() && getAccessRole() !== 'usuario'))
  const page = findStudentAppRoute(pathname)
  const Page = page.component

  useEffect(() => {
    if (!getAccessToken()) return undefined

    let isCurrent = true
    const redirectForRole = (role) => {
      if (role === 'admin') {
        window.location.replace('/admin')
        return true
      }
      if (role === 'empresa') {
        window.location.replace('/empresa/cursos/validar')
        return true
      }
      return false
    }

    const savedRole = getAccessRole()
    if (savedRole) {
      redirectForRole(savedRole)
      return undefined
    }

    getCurrentUser()
      .then((user) => {
        if (isCurrent && !redirectForRole(user.role)) setIsCheckingRole(false)
      })
      .catch(() => {
        if (isCurrent) setIsCheckingRole(false)
      })

    return () => { isCurrent = false }
  }, [])

  useEffect(() => {
    if (pathname !== '/app' || !getAccessToken()) return undefined

    let isCurrent = true
    getStudentProfiles()
      .then(({ university, school }) => {
        if (isCurrent && !university && !school) window.location.replace('/app/perfil')
      })
      .catch(() => undefined)

    return () => { isCurrent = false }
  }, [pathname])

  if (isCheckingRole) {
    return <main className="grid min-h-screen place-items-center bg-[#f6f8f4] px-6 text-center text-sm text-[#718075]" role="status">Verificando el tipo de cuenta…</main>
  }

  return (
    <div className="min-h-screen bg-[#f6f8f4] text-[#173b31]">
      {menuOpen && (
        <button
          className="fixed inset-0 z-40 cursor-default bg-[#10281f]/35 lg:hidden"
          type="button"
          onClick={() => setMenuOpen(false)}
          aria-label="Cerrar menú de navegación"
        />
      )}
      <StudentSidebar pathname={page.activePath} isOpen={menuOpen} onClose={() => setMenuOpen(false)} />

      <div className="min-h-screen lg:pl-[278px]">
        <header className="flex min-h-[72px] items-center justify-between gap-4 border-b border-[#e5ebe3] bg-[#fbfcf8] px-4 sm:px-7 lg:px-10">
          <div className="flex min-w-0 items-center gap-3">
            <button
              className="grid size-10 shrink-0 place-items-center rounded-xl border border-[#e4ebe1] bg-white text-[#385647] transition hover:bg-[#f0f5ee] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#247858] lg:hidden"
              type="button"
              onClick={() => setMenuOpen(true)}
              aria-label="Abrir menú de navegación"
              aria-expanded={menuOpen}
              aria-controls="student-sidebar"
            >
              <svg className="size-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" aria-hidden="true"><path d="M4 7h16M4 12h16M4 17h16" /></svg>
            </button>
            <div className="lg:hidden"><BrandMark href="/app" size="small" /></div>
            <p className="hidden truncate text-sm font-medium text-[#718075] lg:block">{page.group}<span className="mx-2 text-[#c0c9c0]">/</span><span className="text-[#30483a]">{page.title}</span></p>
          </div>
          <a className="flex min-h-11 shrink-0 items-center gap-2 rounded-xl px-2 text-sm font-semibold text-[#385647] transition hover:bg-[#eef4ec] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#247858]" href="/app/perfil">
            <span className="grid size-8 place-items-center rounded-full bg-[#d8eddb] text-xs font-bold text-[#215d43]" aria-hidden="true">NU</span>
            <span className="hidden sm:inline">Mi perfil</span>
          </a>
        </header>

        <main className="mx-auto max-w-[1440px] px-4 py-7 sm:px-7 sm:py-9 lg:px-10 lg:py-10">
          <StudentPageHeading page={page} />
          <Page />
          <footer className="mt-10 border-t border-[#e5ebe3] py-5 text-xs leading-5 text-[#849187]">
            Nexo U · Prototipo de Abstracthon 2026 · Los datos de esta experiencia son de demostración.
          </footer>
        </main>
      </div>
    </div>
  )
}

export default StudentApp
