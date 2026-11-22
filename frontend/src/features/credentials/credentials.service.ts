import { apiRequest } from '../../shared/api/client.ts'

export type CredentialKind = 'skill' | 'language' | 'certificate'

export interface Credential {
  id: number
  kind: CredentialKind
  value: string
  level: string | null
  verified: boolean
  issuer: string | null
}

export interface NewCredential {
  kind: CredentialKind
  value: string
  level?: string | null
}

export function getMyCredentials(): Promise<Credential[]> {
  return apiRequest<Credential[]>('v1/usuario/credenciales')
}

export function addCredential(credential: NewCredential): Promise<Credential> {
  return apiRequest<Credential>('v1/usuario/credenciales', {
    method: 'POST',
    body: JSON.stringify(credential),
  })
}
