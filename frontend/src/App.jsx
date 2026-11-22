import './design/nexo-system.css'
import './design/nexo-professional-v10.css'
import PublicNavbar from './navigation/components/PublicNavbar.jsx'
import { resolveAppRoute } from './routes/index.jsx'

function App() {
  const route = resolveAppRoute(window.location.pathname)
  const Page = route.component

  if (route.layout === 'explore') return <Page />
  if (['login','register','recover','reset'].includes(route.currentPage)) return <Page />

  if (route.layout === 'student') {
    return <Page pathname={route.pathname} />
  }

  if (route.layout === 'company' || route.layout === 'admin') {
    return <Page />
  }

  return (
    <div className="nx-public-page min-h-screen overflow-x-clip">
      <PublicNavbar currentPage={route.currentPage} />
      <div className="nx-public-body pt-[76px] max-[700px]:pt-[66px]"><Page /></div>
    </div>
  )
}

export default App
