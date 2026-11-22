export type StudentType = 'school' | 'university'

export interface OnboardingDraft {
  fullName: string
  studentType: StudentType
}

const DRAFT_KEY = 'nexo-u.profile-onboarding-draft'

export function saveOnboardingDraft(draft: OnboardingDraft): void {
  if (typeof window === 'undefined') return

  try {
    window.sessionStorage.setItem(DRAFT_KEY, JSON.stringify(draft))
  } catch {
    // El perfil se puede completar manualmente si el navegador bloquea el almacenamiento.
  }
}

export function getOnboardingDraft(): OnboardingDraft | null {
  if (typeof window === 'undefined') return null

  try {
    const value = window.sessionStorage.getItem(DRAFT_KEY)
    if (!value) return null

    const draft: unknown = JSON.parse(value)
    if (
      typeof draft !== 'object'
      || draft === null
      || !('studentType' in draft)
      || (draft.studentType !== 'school' && draft.studentType !== 'university')
      || !('fullName' in draft)
      || typeof draft.fullName !== 'string'
    ) return null

    return { fullName: draft.fullName, studentType: draft.studentType }
  } catch {
    return null
  }
}

export function clearOnboardingDraft(): void {
  if (typeof window === 'undefined') return

  try {
    window.sessionStorage.removeItem(DRAFT_KEY)
  } catch {
    // No se impide el guardado del perfil si el navegador bloquea el almacenamiento.
  }
}
