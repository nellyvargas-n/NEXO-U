import { useEffect, useState } from 'react'
import { FiMenu } from 'react-icons/fi'
import { ApiError } from '../../shared/api/client.ts'
import { getCurrentUser } from '../../shared/api/modules/auth.service.ts'
import { getAccessToken } from '../../shared/api/session.ts'
import BrandMark from '../../shared/components/BrandMark.jsx'
import AdminSidebar from './AdminSidebar.jsx'
import { findAdminAppRoute } from './adminAppRoutes.js'

function AdminApp({ pathname = '/admin' }) {
  const [menuOpen, setMenuOpen] = useState(false)
  const [accessState, setAccessState] = useState('checking')
  const [currentUserId, setCurrentUserId] = useState(null)
  const page = findAdminAppRoute(pathname)
  const Page = page.component

  useEffect(() => {
    let isCurrent = true
    if (!getAccessToken()) {
      window.location.replace('/login')
      return () => { isCurrent = false }
    }

    getCurrentUser()
      .then((user) => {
        if (!isCurrent) return
        if (user.role !== 'admin') {
          window.location.replace(user.role === 'empresa' ? '/empresa/cursos/validar' : '/app')
          return
        }
        setCurrentUserId(user.id)
        setAccessState('allowed')
      })
      .catch((error) => {
        if (!isCurrent) return
        if (error instanceof ApiError && error.status === 401) {
          window.location.replace('/login')
          return
        }
        setAccessState('error')
      })

    return () => { isCurrent = false }
  }, [])

  if (accessState === 'checking') {
    return <main className="grid min-h-screen place-items-center bg-[#f6f8f4] px-6 text-center text-sm text-[#718075]" role="status">Verificando permisos administrativos…</main>
  }

  if (accessState === 'error') {
    return (
      <main className="grid min-h-screen place-items-center bg-[#f6f8f4] px-6">
        <section className="max-w-lg rounded-2xl border border-[#e4ebe1] bg-white p-6 text-center">
          <h1 className="font-display text-2xl font-semibold text-[#1c4033]">No pudimos verificar tu acceso</h1>
          <p className="mt-3 text-sm leading-6 text-[#718075]">Revisa tu conexión e inténtalo de nuevo.</p>
          <button className="mt-4 min-h-11 rounded-xl bg-[#1c5a42] px-4 text-sm font-semibold text-white" type="button" onClick={() => window.location.reload()}>Reintentar</button>
        </section>
      </main>
    )
  }

  return (
    <div className="min-h-screen bg-[#f6f8f4] text-[#173b31]">
      {menuOpen ? <button className="fixed inset-0 z-40 cursor-default bg-[#10281f]/35 lg:hidden" type="button" onClick={() => setMenuOpen(false)} aria-label="Cerrar menú de navegación" /> : null}
      <AdminSidebar pathname={page.path} isOpen={menuOpen} onClose={() => setMenuOpen(false)} />
      <div className="min-h-screen lg:pl-[278px]">
        <header className="flex min-h-[72px] items-center justify-between gap-4 border-b border-[#e5ebe3] bg-[#fbfcf8] px-4 sm:px-7 lg:px-10">
          <div className="flex min-w-0 items-center gap-3">
            <button className="grid size-10 shrink-0 place-items-center rounded-xl border border-[#e4ebe1] bg-white text-[#385647] hover:bg-[#f0f5ee] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#247858] lg:hidden" type="button" onClick={() => setMenuOpen(true)} aria-label="Abrir menú de navegación" aria-expanded={menuOpen} aria-controls="admin-sidebar">
              <FiMenu className="size-5" aria-hidden="true" />
            </button>
            <div className="lg:hidden"><BrandMark href="/admin" size="small" /></div>
            <p className="hidden truncate text-sm font-medium text-[#718075] lg:block">{page.group}<span className="mx-2 text-[#c0c9c0]">/</span><span className="text-[#30483a]">{page.title}</span></p>
          </div>
          <span className="flex min-h-10 shrink-0 items-center gap-2 rounded-xl px-2 text-sm font-semibold text-[#385647]">
            <span className="grid size-8 place-items-center rounded-full bg-[#d8eddb] text-xs font-bold text-[#215d43]" aria-hidden="true">AD</span>
            <span className="hidden sm:inline">Admin #{currentUserId}</span>
          </span>
        </header>

        <main className="mx-auto max-w-[1440px] px-4 py-7 sm:px-7 sm:py-9 lg:px-10 lg:py-10">
          <Page currentUserId={currentUserId} />
          <footer className="mt-10 border-t border-[#e5ebe3] py-5 text-xs leading-5 text-[#849187]">Nexo U · Consola de administración</footer>
        </main>
      </div>
    </div>
  )
}

export default AdminApp
