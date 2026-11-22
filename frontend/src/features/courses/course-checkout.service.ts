import { apiRequest } from '../../shared/api/client.ts'

export type CourseCheckoutStatus = 'pending' | 'proof_uploaded' | 'confirmed'

export interface CourseCheckout {
  payment_id: string | number
  course_id: number
  amount_bob: number
  status: CourseCheckoutStatus
  proof_uploaded?: boolean
  learning_url?: string | null
}

export interface CourseProof {
  filename: string
  content_type: string
  data_base64: string
}

export function startCourseCheckout(courseId: number, idempotencyKey: string): Promise<CourseCheckout> {
  return apiRequest<CourseCheckout>(`v1/usuario/cursos/${courseId}/checkout`, {
    method: 'POST',
    body: JSON.stringify({ idempotency_key: idempotencyKey }),
  })
}

export function uploadCourseProof(paymentId: string | number, proof: CourseProof): Promise<CourseCheckout> {
  return apiRequest<CourseCheckout>(`v1/usuario/cursos/pagos/${encodeURIComponent(String(paymentId))}/comprobante`, {
    method: 'POST',
    body: JSON.stringify({ filename: proof.filename, content_type: proof.content_type, data_base64: proof.data_base64 }),
  })
}

export function finalizeCourseCheckout(paymentId: string | number): Promise<CourseCheckout> {
  return apiRequest<CourseCheckout>(`v1/usuario/cursos/pagos/${encodeURIComponent(String(paymentId))}/finalizar`, {
    method: 'POST',
  })
}
