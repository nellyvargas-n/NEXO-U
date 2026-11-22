import { useEffect, useRef, useState } from 'react'
import { ApiError } from '../../shared/api/client.ts'
import { getAccessToken } from '../../shared/api/session.ts'
import { getStudentProfiles } from '../profile/profile.service.ts'
import Surface from '../student-app/components/Surface.jsx'
import {
  createFinanceMovement,
  createFinanceObligation,
  deleteFinanceMovement,
  getFinanceBudgets,
  getFinanceMovements,
  getFinanceObligations,
  getFinanceSummary,
  markFinanceObligationPaid,
  saveFinanceBudget,
} from './wallet.service.ts'
import { useAutoRefresh } from '../../shared/hooks/useAutoRefresh.js'

const inputClass = 'mt-2 min-h-11 w-full rounded-xl border border-[#dfe8f5] bg-white px-3 text-sm text-[#253b30] outline-none focus:border-[#438c61] focus:ring-4 focus:ring-[#438c61]/15'
const primaryButtonClass = 'inline-flex min-h-11 items-center justify-center rounded-xl bg-[#2475e2] px-4 text-sm font-semibold text-white focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#2876d7] disabled:cursor-wait disabled:opacity-60'
const secondaryButtonClass = 'inline-flex min-h-10 items-center justify-center rounded-xl border border-[#dfe8f5] px-3 text-sm font-semibold text-[#2475e2] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#2876d7] disabled:cursor-wait disabled:opacity-60'

const movementCategories = ['Alimentación', 'Transporte', 'Vivienda', 'Educación', 'Salud', 'Beca', 'Trabajo', 'Otros']

function todayLocal() {
  const today = new Date()
  return `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`
}

function currentMonth() {
  const today = new Date()
  return `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}`
}

function formatBob(value) {
  const amount = Number(value)
  if (!Number.isFinite(amount)) return '—'
  return new Intl.NumberFormat('es-BO', { style: 'currency', currency: 'BOB', minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(amount)
}

function formatDate(value) {
  if (!value) return 'Fecha pendiente'
  const date = new Date(`${value}T12:00:00`)
  if (Number.isNaN(date.getTime())) return 'Fecha pendiente'
  return new Intl.DateTimeFormat('es-BO', { dateStyle: 'medium' }).format(date)
}

function getProfileError(error) {
  if (error instanceof ApiError && error.status === 401) return 'Inicia sesión con tu cuenta de estudiante para acceder a la billetera.'
  if (error instanceof ApiError && error.status === 403) return 'La billetera está disponible únicamente para cuentas de estudiantes.'
  if (error instanceof TypeError) return 'No pudimos conectar con el servidor para revisar tu perfil.'
  return error instanceof Error ? error.message : 'No pudimos revisar tu perfil académico.'
}

function getFinanceError(error) {
  if (error instanceof ApiError && error.status === 401) return 'Tu sesión venció. Inicia sesión nuevamente para consultar tus finanzas.'
  if (error instanceof ApiError && error.status === 403) return 'El servicio financiero requiere un perfil universitario de una persona mayor de 18 años.'
  if (error instanceof ApiError && error.status === 404) return 'Completa primero tu perfil universitario para usar la billetera.'
  if (error instanceof TypeError) return 'No pudimos conectar con el servicio financiero. Revisa tu conexión e inténtalo de nuevo.'
  return error instanceof Error ? error.message : 'No se pudieron cargar tus datos financieros.'
}

function Metric({ label, value, tone = 'green' }) {
  const toneClasses = tone === 'red'
    ? 'bg-[#fff4f2] text-[#9b302a]'
    : tone === 'gold'
      ? 'bg-[#fff9e9] text-[#806b35]'
      : 'bg-[#f3f7f1] text-[#2475e2]'

  return (
    <div className={`rounded-2xl p-4 ${toneClasses}`}>
      <p className="m-0 text-xs font-semibold text-[#8595a9]">{label}</p>
      <p className="mb-0 mt-2 font-display text-xl font-semibold">{value}</p>
    </div>
  )
}

function SectionTitle({ eyebrow, title, description }) {
  return (
    <div className="border-b border-[#edf1eb] px-5 py-5 sm:px-6">
      {eyebrow && <p className="m-0 text-xs font-bold tracking-[0.12em] text-[#2876d7]">{eyebrow}</p>}
      <h2 className="mt-1 font-display text-lg font-semibold text-[#1d3557]">{title}</h2>
      {description && <p className="mb-0 mt-1 text-sm leading-5 text-[#8595a9]">{description}</p>}
    </div>
  )
}

function WalletPage() {
  const [accessState, setAccessState] = useState('loading')
  const [isLoading, setIsLoading] = useState(true)
  const [loadError, setLoadError] = useState('')
  const [walletData, setWalletData] = useState(null)
  const [reloadKey, setReloadKey] = useState(0)
  const refreshKey = useAutoRefresh()
  const isInitialLoad = useRef(true)
  const [projection, setProjection] = useState({ dailyExpense: 30, reserve: 0 })
  const [projectionForm, setProjectionForm] = useState({ dailyExpense: '30', reserve: '0' })
  const [movementForm, setMovementForm] = useState({ direction: 'expense', amount: '', category: 'Alimentación', happenedOn: todayLocal() })
  const [budgetForm, setBudgetForm] = useState({ category: '', month: currentMonth(), limit: '' })
  const [obligationForm, setObligationForm] = useState({ title: '', amount: '', dueOn: todayLocal() })
  const [mutating, setMutating] = useState('')
  const [actionError, setActionError] = useState('')
  const [actionSuccess, setActionSuccess] = useState('')

  useEffect(() => {
    let isCurrent = true

    async function loadWallet() {
      if (isInitialLoad.current) {
        setIsLoading(true)
        setAccessState('checking')
      }
      setLoadError('')
      let isEligible = false

      if (!getAccessToken()) {
        setAccessState('unauthenticated')
        setIsLoading(false)
        return
      }

      try {
        const profiles = await getStudentProfiles()
        if (!isCurrent) return

        if (profiles.school) {
          setAccessState('school')
          setIsLoading(false)
          return
        }

        if (!profiles.university) {
          setAccessState('no-profile')
          setIsLoading(false)
          return
        }

        const age = Number(profiles.university.age)
        if (!Number.isFinite(age)) {
          setAccessState('incomplete-profile')
          setIsLoading(false)
          return
        }
        if (age < 18) {
          setAccessState('minor')
          setIsLoading(false)
          return
        }

        isEligible = true
        setAccessState('eligible')
        const [summary, movements, budgets, obligations] = await Promise.all([
          getFinanceSummary(projection.dailyExpense, projection.reserve),
          getFinanceMovements(),
          getFinanceBudgets(),
          getFinanceObligations(),
        ])
        if (!isCurrent) return
        setWalletData({ summary, movements, budgets, obligations })
      } catch (error) {
        if (!isCurrent) return
        setLoadError(isEligible ? getFinanceError(error) : getProfileError(error))
        if (!isEligible) setAccessState('profile-error')
      } finally {
        if (isCurrent) {
          isInitialLoad.current = false
          setIsLoading(false)
        }
      }
    }

    loadWallet()
    return () => { isCurrent = false }
  }, [reloadKey, projection, refreshKey])

  async function handleMovementSubmit(event) {
    event.preventDefault()
    setActionError('')
    setActionSuccess('')
    setMutating('movement')
    try {
      await createFinanceMovement({
        direction: movementForm.direction,
        amount_bob: Number(movementForm.amount),
        category: movementForm.category,
        happened_on: movementForm.happenedOn,
      })
      setMovementForm((current) => ({ ...current, amount: '', happenedOn: todayLocal() }))
      setActionSuccess('Movimiento registrado.')
      setReloadKey((key) => key + 1)
    } catch (error) {
      setActionError(getFinanceError(error))
    } finally {
      setMutating('')
    }
  }

  async function handleBudgetSubmit(event) {
    event.preventDefault()
    setActionError('')
    setActionSuccess('')
    setMutating('budget')
    try {
      await saveFinanceBudget({
        category: budgetForm.category.trim(),
        month: budgetForm.month,
        limit_bob: Number(budgetForm.limit),
      })
      setBudgetForm((current) => ({ ...current, category: '', limit: '' }))
      setActionSuccess('Presupuesto guardado. Si ya existía para esa categoría y mes, se actualizó el límite.')
      setReloadKey((key) => key + 1)
    } catch (error) {
      setActionError(getFinanceError(error))
    } finally {
      setMutating('')
    }
  }

  async function handleObligationSubmit(event) {
    event.preventDefault()
    setActionError('')
    setActionSuccess('')
    setMutating('obligation')
    try {
      await createFinanceObligation({
        title: obligationForm.title.trim(),
        amount_bob: Number(obligationForm.amount),
        due_on: obligationForm.dueOn,
      })
      setObligationForm({ title: '', amount: '', dueOn: todayLocal() })
      setActionSuccess('Pago previsto agregado.')
      setReloadKey((key) => key + 1)
    } catch (error) {
      setActionError(getFinanceError(error))
    } finally {
      setMutating('')
    }
  }

  async function handleDeleteMovement(movement) {
    if (!window.confirm(`¿Eliminar el movimiento “${movement.category}” por ${formatBob(movement.amount_bob)}? Esta acción no se puede deshacer.`)) return
    setActionError('')
    setActionSuccess('')
    setMutating(`delete-${movement.id}`)
    try {
      await deleteFinanceMovement(movement.id)
      setActionSuccess('Movimiento eliminado.')
      setReloadKey((key) => key + 1)
    } catch (error) {
      setActionError(getFinanceError(error))
    } finally {
      setMutating('')
    }
  }

  async function handleMarkPaid(obligation) {
    setActionError('')
    setActionSuccess('')
    setMutating(`paid-${obligation.id}`)
    try {
      await markFinanceObligationPaid(obligation.id)
      setActionSuccess('Pago previsto marcado como pagado.')
      setReloadKey((key) => key + 1)
    } catch (error) {
      setActionError(getFinanceError(error))
    } finally {
      setMutating('')
    }
  }

  function handleProjectionSubmit(event) {
    event.preventDefault()
    setLoadError('')
    setProjection({ dailyExpense: Number(projectionForm.dailyExpense), reserve: Number(projectionForm.reserve) })
  }

  if (isLoading) {
    return <Surface className="max-w-4xl"><p className="m-0 py-4 text-sm text-[#8595a9]" role="status">Revisando acceso y cargando billetera…</p></Surface>
  }

  if (accessState !== 'eligible') {
    const accessMessages = {
      unauthenticated: 'Inicia sesión con una cuenta de estudiante para acceder a la billetera.',
      school: 'La billetera financiera está habilitada únicamente para estudiantes universitarios adultos. Las cuentas con perfil escolar no pueden registrar estos datos.',
      'no-profile': 'Completa tu perfil universitario y confirma que tienes al menos 18 años para usar la billetera.',
      'incomplete-profile': 'Completa tu edad en el perfil universitario para verificar si puedes usar la billetera.',
      minor: 'La billetera financiera está disponible para estudiantes universitarios de 18 años o más.',
      'profile-error': loadError || 'No pudimos verificar tu perfil académico.',
    }

    return (
      <Surface className="max-w-3xl">
        <p className="m-0 text-xs font-bold tracking-[0.12em] text-[#2876d7]">MÓDULO FINANCIERO PRIVADO</p>
        <h2 className="mt-2 font-display text-xl font-semibold text-[#1d3557]">Billetera para estudiantes adultos</h2>
        <p className="mt-3 rounded-xl border border-[#e8dfbd] bg-[#fff9e9] px-4 py-3 text-sm leading-6 text-[#756b4d]" role={accessState === 'profile-error' ? 'alert' : 'status'}>{accessMessages[accessState]}</p>
        {accessState === 'no-profile' || accessState === 'incomplete-profile' ? <a className={`${primaryButtonClass} mt-4`} href="/app/perfil">Completar perfil</a> : null}
        {accessState === 'unauthenticated' && <a className={`${primaryButtonClass} mt-4`} href="/login">Iniciar sesión</a>}
      </Surface>
    )
  }

  if (!walletData) {
    return (
      <Surface className="max-w-3xl">
        <h2 className="font-display text-xl font-semibold text-[#1d3557]">No se pudo cargar la billetera</h2>
        <p className="mt-3 rounded-xl border border-[#f1c3c0] bg-[#fff4f2] px-4 py-3 text-sm leading-6 text-[#9b302a]" role="alert">{loadError || 'Inténtalo de nuevo en unos momentos.'}</p>
      </Surface>
    )
  }

  const { summary, movements, budgets, obligations } = walletData

  return (
    <div className="grid max-w-5xl gap-5">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <p className="m-0 text-xs font-bold tracking-[0.12em] text-[#2876d7]">MÓDULO FINANCIERO PRIVADO</p>
          <h2 className="mt-1 font-display text-xl font-semibold text-[#1d3557]">Mi billetera</h2>
          <p className="mb-0 mt-2 max-w-2xl text-sm leading-6 text-[#7b8da5]">Movimientos, presupuestos y pagos previstos. No conecta con bancos.</p>
        </div>
      </div>

      {actionError && <p className="m-0 rounded-xl border border-[#f1c3c0] bg-[#fff4f2] px-4 py-3 text-sm leading-5 text-[#9b302a]" role="alert">{actionError}</p>}
      {loadError && <p className="m-0 rounded-xl border border-[#f1c3c0] bg-[#fff4f2] px-4 py-3 text-sm leading-5 text-[#9b302a]" role="alert">{loadError} Mostramos tus últimos datos disponibles.</p>}
      {actionSuccess && <p className="m-0 rounded-xl border border-[#d5e8d3] bg-[#f1f8ec] px-4 py-3 text-sm leading-5 text-[#365f43]" role="status">{actionSuccess}</p>}

      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        <Metric label="Balance registrado" value={formatBob(summary.balance_bob)} tone={Number(summary.balance_bob) < 0 ? 'red' : 'green'} />
        <Metric label="Ingresos registrados" value={formatBob(summary.income_bob)} />
        <Metric label="Gastos registrados" value={formatBob(summary.expense_bob)} tone="gold" />
        <Metric label="Pagos pendientes" value={formatBob(summary.pending_obligations_bob)} tone="gold" />
      </div>

      <Surface className="p-0">
        <SectionTitle eyebrow="PROYECCIÓN PERSONAL" title="¿Cuántos días alcanza tu balance?" description="La estimación combina tu balance actual, los pagos pendientes y el gasto diario que indiques." />
        <div className="grid gap-5 p-5 sm:p-6 lg:grid-cols-[minmax(0,1fr)_auto] lg:items-end">
          <form className="grid gap-4 sm:grid-cols-2" onSubmit={handleProjectionSubmit}>
            <label className="block text-sm font-semibold text-[#344b3c]" htmlFor="wallet-daily-expense">Gasto diario estimado (Bs)
              <input className={inputClass} id="wallet-daily-expense" type="number" min="0" max="100000" step="0.01" value={projectionForm.dailyExpense} onChange={(event) => setProjectionForm((current) => ({ ...current, dailyExpense: event.target.value }))} required />
            </label>
            <label className="block text-sm font-semibold text-[#344b3c]" htmlFor="wallet-reserve">Reserva que quieres mantener (Bs)
              <input className={inputClass} id="wallet-reserve" type="number" min="0" max="100000000" step="0.01" value={projectionForm.reserve} onChange={(event) => setProjectionForm((current) => ({ ...current, reserve: event.target.value }))} required />
            </label>
            <button className={`${primaryButtonClass} sm:col-span-2 sm:justify-self-start`} type="submit">Actualizar proyección</button>
          </form>
          <div className="rounded-2xl bg-[#f3f7f1] p-5 lg:min-w-52">
            <p className="m-0 text-xs font-semibold text-[#8595a9]">Días estimados</p>
            <p className="mb-0 mt-1 font-display text-3xl font-semibold text-[#2475e2]">{summary.estimated_days ?? '—'}</p>
            <p className="mb-0 mt-2 text-sm text-[#7b8da5]">{summary.estimated_until ? `Hasta el ${formatDate(summary.estimated_until)}` : 'Con los valores indicados'}</p>
          </div>
        </div>
        <p className="m-0 border-t border-[#edf1eb] px-5 py-3 text-xs leading-5 text-[#8595a9] sm:px-6">{summary.note} La proyección es orientativa y no constituye asesoramiento financiero.</p>
      </Surface>

      <div className="grid items-start gap-5 xl:grid-cols-2">
        <Surface className="p-0">
          <SectionTitle eyebrow="MOVIMIENTOS" title="Registrar un ingreso o gasto" description="Los movimientos se guardan únicamente en tu cuenta." />
          <form className="grid gap-4 p-5 sm:p-6" onSubmit={handleMovementSubmit} aria-busy={mutating === 'movement'}>
            <label className="block text-sm font-semibold text-[#344b3c]" htmlFor="movement-direction">Tipo de movimiento
              <select className={inputClass} id="movement-direction" value={movementForm.direction} onChange={(event) => setMovementForm((current) => ({ ...current, direction: event.target.value }))}>
                <option value="expense">Gasto</option>
                <option value="income">Ingreso</option>
              </select>
            </label>
            <div className="grid gap-4 sm:grid-cols-2">
              <label className="block text-sm font-semibold text-[#344b3c]" htmlFor="movement-amount">Monto (Bs)
                <input className={inputClass} id="movement-amount" type="number" min="0.01" max="100000000" step="0.01" value={movementForm.amount} onChange={(event) => setMovementForm((current) => ({ ...current, amount: event.target.value }))} required />
              </label>
              <label className="block text-sm font-semibold text-[#344b3c]" htmlFor="movement-category">Categoría
                <select className={inputClass} id="movement-category" value={movementForm.category} onChange={(event) => setMovementForm((current) => ({ ...current, category: event.target.value }))}>
                  {movementCategories.map((category) => <option key={category} value={category}>{category}</option>)}
                </select>
              </label>
            </div>
            <label className="block text-sm font-semibold text-[#344b3c]" htmlFor="movement-date">Fecha
              <input className={inputClass} id="movement-date" type="date" value={movementForm.happenedOn} onChange={(event) => setMovementForm((current) => ({ ...current, happenedOn: event.target.value }))} required />
            </label>
            <button className={primaryButtonClass} type="submit" disabled={mutating === 'movement'}>{mutating === 'movement' ? 'Guardando…' : 'Guardar movimiento'}</button>
          </form>
        </Surface>

        <Surface className="p-0">
          <SectionTitle eyebrow="HISTORIAL PRIVADO" title="Movimientos recientes" description={`Mostrando hasta ${movements.length > 0 ? movements.length : '50'} movimientos.`} />
          {movements.length > 0 ? (
            <ul className="divide-y divide-[#edf1eb]">
              {movements.map((movement) => (
                <li className="flex flex-wrap items-center justify-between gap-3 px-5 py-4 sm:px-6" key={movement.id}>
                  <div>
                    <p className="m-0 text-sm font-semibold text-[#30483a]">{movement.category}</p>
                    <p className="m-0 mt-1 text-xs text-[#7a887d]">{movement.direction === 'income' ? 'Ingreso' : 'Gasto'} · {formatDate(movement.happened_on)}</p>
                  </div>
                  <div className="flex items-center gap-3">
                    <strong className={`text-sm ${movement.direction === 'income' ? 'text-[#39704d]' : 'text-[#8b493c]'}`}>
                      {movement.direction === 'income' ? '+' : '−'}{formatBob(movement.amount_bob)}
                    </strong>
                    <button className="min-h-9 rounded-lg px-2 text-xs font-semibold text-[#8b493c] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#a85e4e] disabled:opacity-50" type="button" disabled={mutating === `delete-${movement.id}`} onClick={() => handleDeleteMovement(movement)} aria-label={`Eliminar movimiento ${movement.category}`}>
                      {mutating === `delete-${movement.id}` ? 'Eliminando…' : 'Eliminar'}
                    </button>
                  </div>
                </li>
              ))}
            </ul>
          ) : <p className="m-0 px-5 py-8 text-center text-sm leading-6 text-[#8595a9] sm:px-6">Aún no tienes movimientos. Registra tu primer ingreso o gasto.</p>}
        </Surface>
      </div>

      <div className="grid items-start gap-5 xl:grid-cols-2">
        <Surface className="p-0">
          <SectionTitle eyebrow="PRESUPUESTOS" title="Límite mensual por categoría" description="Guarda o actualiza un límite para una categoría y un mes." />
          <form className="grid gap-4 p-5 sm:p-6" onSubmit={handleBudgetSubmit} aria-busy={mutating === 'budget'}>
            <label className="block text-sm font-semibold text-[#344b3c]" htmlFor="budget-category">Categoría
              <input className={inputClass} id="budget-category" type="text" minLength="1" maxLength="80" value={budgetForm.category} onChange={(event) => setBudgetForm((current) => ({ ...current, category: event.target.value }))} placeholder="Ej. Alimentación" required />
            </label>
            <div className="grid gap-4 sm:grid-cols-2">
              <label className="block text-sm font-semibold text-[#344b3c]" htmlFor="budget-month">Mes
                <input className={inputClass} id="budget-month" type="month" value={budgetForm.month} onChange={(event) => setBudgetForm((current) => ({ ...current, month: event.target.value }))} required />
              </label>
              <label className="block text-sm font-semibold text-[#344b3c]" htmlFor="budget-limit">Límite (Bs)
                <input className={inputClass} id="budget-limit" type="number" min="0" max="100000000" step="0.01" value={budgetForm.limit} onChange={(event) => setBudgetForm((current) => ({ ...current, limit: event.target.value }))} required />
              </label>
            </div>
            <button className={primaryButtonClass} type="submit" disabled={mutating === 'budget'}>{mutating === 'budget' ? 'Guardando…' : 'Guardar presupuesto'}</button>
          </form>
          {budgets.length > 0 ? (
            <ul className="divide-y divide-[#edf1eb] border-t border-[#edf1eb]">
              {budgets.map((budget) => (
                <li className="flex items-center justify-between gap-4 px-5 py-4 sm:px-6" key={budget.id}>
                  <div><p className="m-0 text-sm font-semibold text-[#30483a]">{budget.category}</p><p className="m-0 mt-1 text-xs text-[#7a887d]">{budget.month}</p></div>
                  <strong className="text-sm text-[#2475e2]">{formatBob(budget.limit_bob)}</strong>
                </li>
              ))}
            </ul>
          ) : <p className="m-0 border-t border-[#edf1eb] px-5 py-6 text-sm text-[#8595a9] sm:px-6">Aún no configuraste presupuestos mensuales.</p>}
        </Surface>

        <Surface className="p-0">
          <SectionTitle eyebrow="PAGOS PREVISTOS" title="Registrar una obligación" description="Añade pagos que quieras considerar en tu proyección." />
          <form className="grid gap-4 p-5 sm:p-6" onSubmit={handleObligationSubmit} aria-busy={mutating === 'obligation'}>
            <label className="block text-sm font-semibold text-[#344b3c]" htmlFor="obligation-title">Descripción del pago
              <input className={inputClass} id="obligation-title" type="text" minLength="2" maxLength="120" value={obligationForm.title} onChange={(event) => setObligationForm((current) => ({ ...current, title: event.target.value }))} placeholder="Ej. Mensualidad universitaria" required />
            </label>
            <div className="grid gap-4 sm:grid-cols-2">
              <label className="block text-sm font-semibold text-[#344b3c]" htmlFor="obligation-amount">Monto (Bs)
                <input className={inputClass} id="obligation-amount" type="number" min="0" max="100000000" step="0.01" value={obligationForm.amount} onChange={(event) => setObligationForm((current) => ({ ...current, amount: event.target.value }))} required />
              </label>
              <label className="block text-sm font-semibold text-[#344b3c]" htmlFor="obligation-date">Fecha de vencimiento
                <input className={inputClass} id="obligation-date" type="date" value={obligationForm.dueOn} onChange={(event) => setObligationForm((current) => ({ ...current, dueOn: event.target.value }))} required />
              </label>
            </div>
            <button className={primaryButtonClass} type="submit" disabled={mutating === 'obligation'}>{mutating === 'obligation' ? 'Guardando…' : 'Agregar pago previsto'}</button>
          </form>
          {obligations.length > 0 ? (
            <ul className="divide-y divide-[#edf1eb] border-t border-[#edf1eb]">
              {obligations.map((obligation) => (
                <li className="flex flex-wrap items-center justify-between gap-3 px-5 py-4 sm:px-6" key={obligation.id}>
                  <div><p className="m-0 text-sm font-semibold text-[#30483a]">{obligation.title}</p><p className="m-0 mt-1 text-xs text-[#7a887d]">Vence {formatDate(obligation.due_on)} · {formatBob(obligation.amount_bob)}</p></div>
                  {obligation.paid ? (
                    <span className="rounded-full bg-[#e4f2e5] px-3 py-1.5 text-xs font-semibold text-[#39704d]">Pagada</span>
                  ) : (
                    <button className={secondaryButtonClass} type="button" disabled={mutating === `paid-${obligation.id}`} onClick={() => handleMarkPaid(obligation)}>{mutating === `paid-${obligation.id}` ? 'Actualizando…' : 'Marcar pagada'}</button>
                  )}
                </li>
              ))}
            </ul>
          ) : <p className="m-0 border-t border-[#edf1eb] px-5 py-6 text-sm text-[#8595a9] sm:px-6">No tienes pagos previstos.</p>}
        </Surface>
      </div>

      <Surface className="bg-[#f8faf6]">
        <h2 className="font-display text-lg font-semibold text-[#1d3557]">Privacidad de tus datos</h2>
        <p className="mb-0 mt-2 text-sm leading-6 text-[#7b8da5]">Tus datos financieros no se comparten con organizaciones.</p>
      </Surface>
    </div>
  )
}

export default WalletPage
