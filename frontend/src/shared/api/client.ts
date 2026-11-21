import { getAccessToken } from './session.ts'

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000/api/'

export async function apiRequest<TResponse>(path: string, init: RequestInit = {}): Promise<TResponse> {
  const normalizedPath = path.replace(/^\/+/, '')
  const baseUrl = API_BASE_URL.endsWith('/') ? API_BASE_URL : `${API_BASE_URL}/`
  const url = new URL(normalizedPath, baseUrl)
  const headers = new Headers(init.headers)
  const accessToken = getAccessToken()

  headers.set('Accept', 'application/json')
  if (accessToken && !headers.has('Authorization')) {
    headers.set('Authorization', `Bearer ${accessToken}`)
  }
  if (init.body && !headers.has('Content-Type') && !(init.body instanceof FormData)) {
    headers.set('Content-Type', 'application/json')
  }

  const response = await fetch(url, { ...init, headers })

  if (!response.ok) {
    let message = `La solicitud falló (${response.status})`
    try {
      const body: unknown = await response.json()
      if (typeof body === 'object' && body !== null && 'detail' in body && typeof body.detail === 'string') {
        message = body.detail
      }
    } catch {
      // Conserva el mensaje HTTP si la respuesta no trae JSON.
    }
    throw new Error(message)
  }

  if (response.status === 204) return undefined as TResponse
  return response.json() as Promise<TResponse>
}
