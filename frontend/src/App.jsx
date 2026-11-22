import { useEffect, useRef, useState } from 'react'
import './design/nexo-system.css'
import './design/nexo-professional-v10.css'
import PublicNavbar from './navigation/components/PublicNavbar.jsx'
import { resolveAppRoute } from './routes/index.jsx'
import { NAVIGATION_EVENT, navigate } from './shared/navigation/navigation.js'

function readLocation(kind = 'initial', scrollY = 0) {
  return {
    pathname: window.location.pathname,
    search: window.location.search,
    hash: window.location.hash,
    kind,
    scrollY,
  }
}

function App() {
  const [location, setLocation] = useState(() => readLocation())
  const firstRender = useRef(true)
  const route = resolveAppRoute(location.pathname)
  const Page = route.component

  useEffect(() => {
    const handlePopState = (event) => {
      setLocation(readLocation('pop', event.state?.scrollY ?? 0))
    }
    const handleNavigation = (event) => {
      setLocation(readLocation(event.detail?.kind ?? 'push', event.detail?.scrollY ?? 0))
    }
    const handleDocumentClick = (event) => {
      if (event.defaultPrevented || event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return

      const anchor = event.target instanceof Element ? event.target.closest('a[href]') : null
      if (!anchor || anchor.hasAttribute('download') || anchor.target && anchor.target !== '_self' || anchor.hasAttribute('data-native-navigation')) return

      const nextUrl = new URL(anchor.href, window.location.href)
      const currentUrl = new URL(window.location.href)
      if (nextUrl.origin !== currentUrl.origin || nextUrl.href === currentUrl.href) return

      if (nextUrl.pathname === currentUrl.pathname && nextUrl.search === currentUrl.search && nextUrl.hash) return

      event.preventDefault()
      navigate(`${nextUrl.pathname}${nextUrl.search}${nextUrl.hash}`)
    }

    window.addEventListener('popstate', handlePopState)
    window.addEventListener(NAVIGATION_EVENT, handleNavigation)
    document.addEventListener('click', handleDocumentClick)

    return () => {
      window.removeEventListener('popstate', handlePopState)
      window.removeEventListener(NAVIGATION_EVENT, handleNavigation)
      document.removeEventListener('click', handleDocumentClick)
    }
  }, [])

  useEffect(() => {
    if (firstRender.current) {
      firstRender.current = false
      return
    }

    const frame = window.requestAnimationFrame(() => {
      if (location.hash) {
        document.getElementById(decodeURIComponent(location.hash.slice(1)))?.scrollIntoView({ behavior: 'smooth' })
      } else if (location.kind === 'pop') {
        window.scrollTo({ top: location.scrollY, behavior: 'auto' })
      } else {
        window.scrollTo({ top: 0, behavior: 'auto' })
      }
    })

    return () => window.cancelAnimationFrame(frame)
  }, [location])

  if (route.layout === 'explore') return <Page />
  if (['login','register','recover','reset'].includes(route.currentPage)) return <Page />

  if (route.layout === 'student') {
    return <Page pathname={route.pathname} />
  }

  if (route.layout === 'admin') return <Page pathname={route.pathname} />
  if (route.layout === 'company') return <Page pathname={route.pathname} />

  return (
    <div className="nx-public-page min-h-screen overflow-x-clip">
      <PublicNavbar currentPage={route.currentPage} />
      <div className="nx-public-body pt-[76px] max-[700px]:pt-[66px]"><Page /></div>
    </div>
  )
}

export default App
