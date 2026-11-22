import { apiRequest } from '../../shared/api/client.ts'

export interface FinanceSummary {
  balance_bob: string
  income_bob: string
  expense_bob: string
  pending_obligations_bob: string
  estimated_days: number | null
  estimated_until: string | null
  note: string
}

export interface FinanceMovement {
  id: number
  direction: 'income' | 'expense'
  amount_bob: string
  category: string
  happened_on: string
}

export interface FinanceBudget {
  id: number
  category: string
  month: string
  limit_bob: string
}

export interface FinanceObligation {
  id: number
  title: string
  amount_bob: string
  due_on: string
  paid: boolean
}

export interface FinanceMovementInput {
  direction: 'income' | 'expense'
  amount_bob: number
  category: string
  happened_on: string
}

export interface FinanceBudgetInput {
  category: string
  month: string
  limit_bob: number
}

export interface FinanceObligationInput {
  title: string
  amount_bob: number
  due_on: string
}

export function getFinanceSummary(dailyExpense: number, reserve: number): Promise<FinanceSummary> {
  const query = new URLSearchParams({ daily_expense: String(dailyExpense), reserve: String(reserve) })
  return apiRequest<FinanceSummary>(`v1/usuario/finanzas/resumen?${query.toString()}`)
}

export function getFinanceMovements(): Promise<FinanceMovement[]> {
  return apiRequest<FinanceMovement[]>('v1/usuario/finanzas/movimientos?limit=50&offset=0')
}

export function createFinanceMovement(input: FinanceMovementInput): Promise<FinanceMovement> {
  return apiRequest<FinanceMovement>('v1/usuario/finanzas/movimientos', {
    method: 'POST',
    body: JSON.stringify(input),
  })
}

export function deleteFinanceMovement(id: number): Promise<{ deleted: boolean }> {
  return apiRequest<{ deleted: boolean }>(`v1/usuario/finanzas/movimientos/${id}`, { method: 'DELETE' })
}

export function getFinanceBudgets(): Promise<FinanceBudget[]> {
  return apiRequest<FinanceBudget[]>('v1/usuario/finanzas/presupuestos')
}

export function saveFinanceBudget(input: FinanceBudgetInput): Promise<FinanceBudget> {
  return apiRequest<FinanceBudget>('v1/usuario/finanzas/presupuestos', {
    method: 'PUT',
    body: JSON.stringify(input),
  })
}

export function getFinanceObligations(): Promise<FinanceObligation[]> {
  return apiRequest<FinanceObligation[]>('v1/usuario/finanzas/obligaciones')
}

export function createFinanceObligation(input: FinanceObligationInput): Promise<FinanceObligation> {
  return apiRequest<FinanceObligation>('v1/usuario/finanzas/obligaciones', {
    method: 'POST',
    body: JSON.stringify(input),
  })
}

export function markFinanceObligationPaid(id: number): Promise<{ id: number; paid: boolean }> {
  return apiRequest<{ id: number; paid: boolean }>(`v1/usuario/finanzas/obligaciones/${id}/pagada`, { method: 'PATCH' })
}
