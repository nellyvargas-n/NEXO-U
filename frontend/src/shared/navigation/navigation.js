export const NAVIGATION_EVENT = 'nexo:navigate'

export function navigate(to, { replace = false } = {}) {
  const nextUrl = new URL(to, window.location.href)

  if (nextUrl.origin !== window.location.origin) {
    window.location.assign(nextUrl.href)
    return
  }

  const currentUrl = new URL(window.location.href)
  if (nextUrl.href === currentUrl.href) return

  if (!replace) {
    window.history.replaceState(
      { ...window.history.state, scrollY: window.scrollY },
      '',
      currentUrl.href,
    )
  }

  window.history[replace ? 'replaceState' : 'pushState'](
    { ...window.history.state, scrollY: 0 },
    '',
    `${nextUrl.pathname}${nextUrl.search}${nextUrl.hash}`,
  )
  const navigationEvent = new CustomEvent(NAVIGATION_EVENT, {
    detail: { kind: replace ? 'replace' : 'push', scrollY: 0 },
  })
  queueMicrotask(() => window.dispatchEvent(navigationEvent))
}
