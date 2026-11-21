const ACCESS_TOKEN_KEY = 'nexo-u.access-token'

export function getAccessToken() {
  if (typeof window === 'undefined') return null

  return window.sessionStorage.getItem(ACCESS_TOKEN_KEY)
    ?? window.localStorage.getItem(ACCESS_TOKEN_KEY)
}

export function saveAccessToken(token, remember = false) {
  if (typeof window === 'undefined') return

  clearAccessToken()
  const storage = remember ? window.localStorage : window.sessionStorage
  storage.setItem(ACCESS_TOKEN_KEY, token)
}

export function clearAccessToken() {
  if (typeof window === 'undefined') return

  window.sessionStorage.removeItem(ACCESS_TOKEN_KEY)
  window.localStorage.removeItem(ACCESS_TOKEN_KEY)
}
