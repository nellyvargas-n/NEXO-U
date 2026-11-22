import { ApiError, apiRequest } from '../../shared/api/client.ts'

export interface UniversityProfile {
  id?: number
  name: string
  career: string
  semester: number
  age: number
  city: string
}

export interface SchoolProfile {
  user_id?: number
  full_name: string
  city: string
  graduation_year: number
  average_grade: string | number
  math_grade: string | number
}

async function getOptionalProfile<TProfile>(path: string): Promise<TProfile | null> {
  try {
    return await apiRequest<TProfile>(path)
  } catch (error) {
    if (error instanceof ApiError && error.status === 404) return null
    throw error
  }
}

export async function getStudentProfiles() {
  const [university, school] = await Promise.all([
    getOptionalProfile<UniversityProfile>('v1/usuario/perfil'),
    getOptionalProfile<SchoolProfile>('v1/usuario/escolar/perfil'),
  ])

  if (university && school) {
    throw new Error('La cuenta tiene dos perfiles académicos. Contacta al equipo de Nexo U para revisarla.')
  }

  return { university, school }
}

export function saveUniversityProfile(profile: UniversityProfile): Promise<UniversityProfile> {
  return apiRequest<UniversityProfile>('v1/usuario/perfil', {
    method: 'PUT',
    body: JSON.stringify(profile),
  })
}

export function saveSchoolProfile(profile: SchoolProfile): Promise<SchoolProfile> {
  return apiRequest<SchoolProfile>('v1/usuario/escolar/perfil', {
    method: 'PUT',
    body: JSON.stringify(profile),
  })
}
