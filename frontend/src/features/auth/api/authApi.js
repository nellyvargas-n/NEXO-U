import { apiRequest } from '../../../shared/api/client.ts'
import { clearAccessToken, saveAccessToken } from '../../../shared/api/session.js'

export function registerStudentAccount({ email, password }) {
  clearAccessToken()

  return apiRequest('v1/auth/register', {
    method: 'POST',
    body: JSON.stringify({ email, password, role: 'usuario' }),
  })
}

export async function signIn({ email, password }, remember = false) {
  clearAccessToken()

  const session = await apiRequest('v1/auth/login', {
    method: 'POST',
    body: JSON.stringify({ email, password }),
  })

  if (!session?.access_token) {
    throw new Error('El servidor no devolvió una sesión válida.')
  }

  saveAccessToken(session.access_token, remember)
  return session
}

export function getAuthErrorMessage(error) {
  if (error instanceof TypeError) {
    return 'No pudimos conectar con el servidor. Inténtalo de nuevo en unos momentos.'
  }

  return error instanceof Error ? error.message : 'No se pudo completar la solicitud.'
}
