import { getAccessToken } from './session.ts'

// Para desarrollo local, Vite envía /api/* a FastAPI (puerto 8000).
// En producción puedes configurar VITE_API_BASE_URL con una URL HTTPS absoluta.
// Aceptamos VITE_API_URL por compatibilidad con configuraciones antiguas.
const configuredApiBase = String(
  import.meta.env.VITE_API_BASE_URL || import.meta.env.VITE_API_URL || '/api/',
).trim()

function resolveApiBase(): URL {
  // new URL(path, '/api/') lanza TypeError: la base debe ser absoluta.
  // Usar window.location.origin permite valores como '/api/' y evita ese fallo.
  const base = new URL(configuredApiBase || '/api/', window.location.origin)
  let path = base.pathname.replace(/\/+$/, '')
  if (!path) path = '/api'
  if (path.endsWith('/api/v1')) path = path.slice(0, -3)
  base.pathname = `${path}/`
  return base
}

export class ApiError extends Error {
  constructor(message: string, public readonly status: number) {
    super(message)
    this.name = 'ApiError'
  }
}

export async function apiRequest<TResponse>(path: string, init: RequestInit = {}): Promise<TResponse> {
  const normalizedPath = path.replace(/^\/+/, '')
  const url = new URL(normalizedPath, resolveApiBase())
  const headers = new Headers(init.headers)
  const accessToken = getAccessToken()

  headers.set('Accept', 'application/json')
  if (accessToken && !headers.has('Authorization')) {
    headers.set('Authorization', `Bearer ${accessToken}`)
  }
  if (init.body && !headers.has('Content-Type') && !(init.body instanceof FormData)) {
    headers.set('Content-Type', 'application/json')
  }

  let response: Response
  try {
    response = await fetch(url, { ...init, headers })
  } catch (error) {
    // Nunca registrar headers, contraseñas, payloads ni tokens.
    console.error(`[NEXO U API] ${init.method || 'GET'} ${url.origin}${url.pathname}: fallo de red`, error)
    throw new ApiError('No se pudo contactar con FastAPI. Revisa que Docker esté activo y el proxy de Vite esté configurado.', 0)
  }

  if (!response.ok) {
    let message = `La solicitud falló (${response.status})`
    try {
      const body: unknown = await response.json()
      if (typeof body === 'object' && body !== null && 'detail' in body) {
        if (typeof body.detail === 'string') {
          message = body.detail
        } else if (response.status === 422) {
          message = 'Los datos no cumplen los requisitos del formulario.'
        }
      }
    } catch {
      // El servidor puede devolver un error sin JSON.
    }
    console.warn(`[NEXO U API] ${init.method || 'GET'} ${url.pathname}: HTTP ${response.status}`)
    throw new ApiError(message, response.status)
  }

  if (response.status === 204) return undefined as TResponse
  return response.json() as Promise<TResponse>
}
