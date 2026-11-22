const ACCESS_TOKEN_KEY = 'nexo-u.access-token'
const ACCESS_ROLE_KEY = 'nexo-u.access-role'

export type AccessRole = 'usuario' | 'empresa' | 'admin'

export function getAccessToken(): string | null {
  if (typeof window === 'undefined') return null

  return window.sessionStorage.getItem(ACCESS_TOKEN_KEY)
    ?? window.localStorage.getItem(ACCESS_TOKEN_KEY)
}

export function getAccessRole(): AccessRole | null {
  if (typeof window === 'undefined') return null

  const role = window.sessionStorage.getItem(ACCESS_ROLE_KEY)
    ?? window.localStorage.getItem(ACCESS_ROLE_KEY)

  return role === 'usuario' || role === 'empresa' || role === 'admin' ? role : null
}

export function saveAccessToken(token: string, remember = false, role?: AccessRole): void {
  if (typeof window === 'undefined') return

  clearAccessToken()
  const storage = remember ? window.localStorage : window.sessionStorage
  storage.setItem(ACCESS_TOKEN_KEY, token)
  if (role) storage.setItem(ACCESS_ROLE_KEY, role)
}

export function clearAccessToken(): void {
  if (typeof window === 'undefined') return

  window.sessionStorage.removeItem(ACCESS_TOKEN_KEY)
  window.localStorage.removeItem(ACCESS_TOKEN_KEY)
  window.sessionStorage.removeItem(ACCESS_ROLE_KEY)
  window.localStorage.removeItem(ACCESS_ROLE_KEY)
}
