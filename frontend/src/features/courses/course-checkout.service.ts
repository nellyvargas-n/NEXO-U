import { apiRequest } from '../../shared/api/client.ts'

export type CourseCheckoutStatus = 'pending' | 'paid' | 'failed' | 'expired' | 'cancelled'

export interface CourseCheckout {
  payment_id: string | number
  course_id: number
  amount_bob: number
  status: CourseCheckoutStatus
  checkout_url?: string | null
  qr_code_url?: string | null
  expires_at?: string | null
  learning_url?: string | null
}

export function startCourseCheckout(courseId: number, idempotencyKey: string): Promise<CourseCheckout> {
  return apiRequest<CourseCheckout>(`v1/usuario/cursos/${courseId}/checkout`, {
    method: 'POST',
    body: JSON.stringify({ idempotency_key: idempotencyKey }),
  })
}

export function getCourseCheckout(paymentId: string | number): Promise<CourseCheckout> {
  return apiRequest<CourseCheckout>(`v1/usuario/cursos/pagos/${encodeURIComponent(String(paymentId))}`)
}
