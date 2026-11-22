import { apiRequest, ApiError } from '../../shared/api/client.ts'

export interface AdminDashboard {
  users: number
  organizations: number
  pending_verification: number
  opportunities: number
  courses: number
}

export interface AdminOrganization {
  id: number
  name: string
  owner_user_id: number
  verified: boolean
}

export interface AdminUser {
  id: number
  email: string
  role: 'usuario' | 'empresa' | 'admin'
  active: boolean
}

export interface PendingScholarshipBand {
  id: number
  opportunity_id: number
  percent_discount: number
  official_url: string
  min_average?: string
  min_math?: string
  official_published?: boolean
  opportunity_title?: string
  organization_name?: string
}

export interface AuditRecord {
  id: number
  actor_user_id: number
  action: string
  target_type: string
  target_id: string
  created_at: string
}

export function getAdminDashboard(): Promise<AdminDashboard> {
  return apiRequest<AdminDashboard>('v1/admin/dashboard')
}

export function getAdminOrganizations(): Promise<AdminOrganization[]> {
  return apiRequest<AdminOrganization[]>('v1/admin/organizaciones')
}

export function setOrganizationVerification(id: number, verified: boolean): Promise<{ id: number; verified: boolean }> {
  return apiRequest<{ id: number; verified: boolean }>(`v1/admin/organizaciones/${id}/verificacion`, {
    method: 'PATCH',
    body: JSON.stringify({ verified }),
  })
}

export function getAdminUsers(): Promise<AdminUser[]> {
  return apiRequest<AdminUser[]>('v1/admin/usuarios')
}

export function setUserActive(id: number, active: boolean): Promise<AdminUser> {
  return apiRequest<AdminUser>(`v1/admin/usuarios/${id}`, {
    method: 'PATCH',
    body: JSON.stringify({ active }),
  })
}

export function getPendingScholarshipBands(): Promise<PendingScholarshipBand[]> {
  return apiRequest<PendingScholarshipBand[]>('v1/admin/becas/bandas/pendientes')
}

export function reviewScholarshipBand(id: number, approved: boolean): Promise<{ id: number; approved_by_admin: boolean }> {
  return apiRequest<{ id: number; approved_by_admin: boolean }>(`v1/admin/becas/bandas/${id}/revisar`, {
    method: 'PATCH',
    body: JSON.stringify({ approved }),
  })
}

export function getAdminAudit(): Promise<AuditRecord[]> {
  return apiRequest<AuditRecord[]>('v1/admin/auditoria?limit=100')
}

export function getAdminErrorMessage(error: unknown): string {
  if (error instanceof ApiError && error.status === 401) return 'Tu sesión expiró. Inicia sesión otra vez.'
  if (error instanceof ApiError && error.status === 403) return 'Esta sección solo está disponible para cuentas administradoras.'
  if (error instanceof TypeError) return 'No pudimos conectar con el servidor. Revisa la conexión e inténtalo otra vez.'
  return error instanceof Error ? error.message : 'No se pudo cargar la información administrativa.'
}
