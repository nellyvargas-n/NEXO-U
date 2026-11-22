import PublicNavbar from './navigation/components/PublicNavbar.jsx'
import { resolveAppRoute } from './routes/index.jsx'

function App() {
  const route = resolveAppRoute(window.location.pathname)
  const Page = route.component

  if (route.layout === 'student') {
    return <Page pathname={route.pathname} />
  }

  if (route.layout === 'company') {
    return <Page />
  }

  if (route.layout === 'admin') {
    return <Page pathname={route.pathname} />
  }

  return (
    <div className="min-h-screen overflow-x-clip bg-[#fbfcf8]">
      <PublicNavbar currentPage={route.currentPage} />
      <div className="pt-[76px] max-[700px]:pt-[66px]"><Page /></div>
    </div>
  )
}

export default App
