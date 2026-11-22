import { useEffect, useState } from 'react'

const DEFAULT_REFRESH_INTERVAL = 30_000

export function useAutoRefresh(intervalMs = DEFAULT_REFRESH_INTERVAL) {
  const [refreshKey, setRefreshKey] = useState(0)

  useEffect(() => {
    let lastRefresh = 0
    const refreshIfVisible = () => {
      if (document.visibilityState !== 'visible') return

      const now = Date.now()
      if (now - lastRefresh < 1_000) return

      lastRefresh = now
      setRefreshKey((key) => key + 1)
    }

    const interval = window.setInterval(refreshIfVisible, intervalMs)
    window.addEventListener('focus', refreshIfVisible)
    window.addEventListener('online', refreshIfVisible)
    document.addEventListener('visibilitychange', refreshIfVisible)

    return () => {
      window.clearInterval(interval)
      window.removeEventListener('focus', refreshIfVisible)
      window.removeEventListener('online', refreshIfVisible)
      document.removeEventListener('visibilitychange', refreshIfVisible)
    }
  }, [intervalMs])

  return refreshKey
}
