import { apiRequest } from './client.ts'
import { clearAccessToken, saveAccessToken } from './session.ts'

export type AuthRole = 'usuario' | 'empresa' | 'admin'

export interface AuthCredentials {
  email: string
  password: string
}

export interface AuthSession {
  access_token: string
  token_type: 'bearer'
  role: AuthRole
}

export interface RegisteredUser {
  id: number
  email: string
  role: 'usuario' | 'empresa'
  active: boolean
}

export function registerStudentAccount({ email, password }: AuthCredentials): Promise<RegisteredUser> {
  clearAccessToken()

  return apiRequest<RegisteredUser>('v1/auth/register', {
    method: 'POST',
    body: JSON.stringify({ email, password, role: 'usuario' }),
  })
}

export async function signIn({ email, password }: AuthCredentials, remember = false): Promise<AuthSession> {
  clearAccessToken()

  const session = await apiRequest<AuthSession>('v1/auth/login', {
    method: 'POST',
    body: JSON.stringify({ email, password }),
  })

  if (!session?.access_token) {
    throw new Error('El servidor no devolvió una sesión válida.')
  }

  saveAccessToken(session.access_token, remember)
  return session
}

export function getAuthErrorMessage(error: unknown): string {
  if (error instanceof TypeError) {
    return 'No pudimos conectar con el servidor. Inténtalo de nuevo en unos momentos.'
  }

  return error instanceof Error ? error.message : 'No se pudo completar la solicitud.'
}
