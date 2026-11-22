import { useEffect, useState } from 'react'
import { ApiError } from '../../shared/api/client.ts'
import Icon from '../../shared/components/Icon.jsx'
import Surface from '../student-app/components/Surface.jsx'
import { addCredential, getMyCredentials } from './credentials.service.ts'

const credentialKinds = [
  { value: 'skill', label: 'Habilidad' },
  { value: 'language', label: 'Idioma' },
  { value: 'certificate', label: 'Certificado' },
]

const languageLevels = ['A1', 'A2', 'B1', 'B2', 'C1', 'C2']
const inputClass = 'mt-2 min-h-12 w-full rounded-xl border border-[#dfe8f5] bg-white px-4 text-base text-[#253b30] outline-none focus:border-[#438c61] focus:ring-4 focus:ring-[#438c61]/15'

function kindLabel(kind) {
  return credentialKinds.find((item) => item.value === kind)?.label ?? kind
}

function getLoadError(error) {
  if (error instanceof ApiError && error.status === 401) {
    return { message: 'Inicia sesión con tu cuenta de estudiante para ver tus credenciales.', action: 'login' }
  }
  if (error instanceof ApiError && error.status === 404) {
    return { message: 'Primero debes completar un perfil de colegio o universidad antes de agregar tus habilidades.', action: 'profile' }
  }
  if (error instanceof TypeError) return { message: 'No pudimos conectar con el servidor. Revisa la conexión e inténtalo otra vez.', action: 'retry' }
  return { message: error instanceof Error ? error.message : 'No se pudieron cargar tus credenciales.', action: 'retry' }
}

function CredentialStatus({ credential }) {
  const verified = credential.verified
  return (
    <span className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-semibold ${verified ? 'bg-[#e4f2e5] text-[#39704d]' : 'bg-[#fbf3de] text-[#8b713b]'}`}>
      <Icon name={verified ? 'check' : 'lock'} className="size-3.5" />
      {verified ? 'Verificada' : 'Declarada · pendiente de verificar'}
    </span>
  )
}

function CredentialsPage() {
  const [credentials, setCredentials] = useState([])
  const [form, setForm] = useState({ kind: 'skill', value: '', level: '' })
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  const [loadError, setLoadError] = useState(null)
  const [saveError, setSaveError] = useState('')
  const [successMessage, setSuccessMessage] = useState('')
  const [reloadKey, setReloadKey] = useState(0)

  useEffect(() => {
    let isCurrent = true
    setIsLoading(true)
    setLoadError(null)

    getMyCredentials()
      .then((result) => {
        if (isCurrent) setCredentials(result)
      })
      .catch((error) => {
        if (isCurrent) setLoadError(getLoadError(error))
      })
      .finally(() => {
        if (isCurrent) setIsLoading(false)
      })

    return () => { isCurrent = false }
  }, [reloadKey])

  async function handleSubmit(event) {
    event.preventDefault()
    setSaveError('')
    setSuccessMessage('')
    setIsSaving(true)

    const payload = {
      kind: form.kind,
      value: form.value.trim(),
      ...(form.level ? { level: form.level.trim() } : {}),
    }

    try {
      const created = await addCredential(payload)
      setCredentials((current) => [created, ...current])
      setForm((current) => ({ ...current, value: '', level: '' }))
      setSuccessMessage('Credencial agregada. Aparecerá como declarada hasta que un emisor autorizado la verifique.')
    } catch (error) {
      if (error instanceof ApiError && error.status === 404) {
        setSaveError('Completa primero tu perfil académico (colegio o universidad) para registrar credenciales.')
      } else if (error instanceof TypeError) {
        setSaveError('No pudimos conectar con el servidor. Inténtalo otra vez.')
      } else {
        setSaveError(error instanceof Error ? error.message : 'No se pudo registrar la credencial.')
      }
    } finally {
      setIsSaving(false)
    }
  }

  if (isLoading) {
    return <Surface className="max-w-4xl"><p className="m-0 py-4 text-sm text-[#8595a9]" role="status">Cargando tus credenciales…</p></Surface>
  }

  if (loadError) {
    return (
      <Surface className="max-w-3xl">
        <p className="m-0 rounded-xl border border-[#f1c3c0] bg-[#fff4f2] px-4 py-3 text-sm leading-5 text-[#9b302a]" role="alert">{loadError.message}</p>
        {loadError.action === 'profile' && <a className="mt-4 inline-flex min-h-11 items-center justify-center rounded-xl bg-[#2475e2] px-4 text-sm font-semibold text-white" href="/app/perfil">Ir a mi perfil</a>}
        {loadError.action === 'login' && <a className="mt-4 inline-flex min-h-11 items-center justify-center rounded-xl bg-[#2475e2] px-4 text-sm font-semibold text-white" href="/login">Iniciar sesión</a>}
        {loadError.action === 'retry' && <button className="mt-4 min-h-11 rounded-xl border border-[#dfe8f5] px-4 text-sm font-semibold text-[#2475e2]" type="button" onClick={() => setReloadKey((key) => key + 1)}>Reintentar</button>}
      </Surface>
    )
  }

  return (
    <div className="grid max-w-5xl items-start gap-5 xl:grid-cols-[minmax(0,0.9fr)_minmax(0,1.1fr)]">
      <Surface>
        <p className="m-0 text-xs font-bold tracking-[0.12em] text-[#2876d7]">AGREGA UNA HABILIDAD O LOGRO</p>
        <h2 className="mt-2 font-display text-xl font-semibold text-[#1d3557]">Registrar credencial</h2>
        <p className="mt-2 text-sm leading-6 text-[#8595a9]">Puedes declarar habilidades, idiomas y certificados. El emisor correspondiente debe verificar una credencial antes de que cuente como validada.</p>
        <div className="nex-credential-help">
          <strong>¿Qué puedo registrar aquí?</strong>
          <span><b>Habilidad:</b> Python, Excel, diseño gráfico, atención al cliente.</span>
          <span><b>Idioma:</b> Inglés, portugués u otro, indicando tu nivel A1–C2.</span>
          <span><b>Certificado:</b> escribe el nombre de la constancia o curso.</span>
          <small>Por ahora registras el nombre: este formulario no permite subir archivos PDF. Una institución autorizada puede verificar las credenciales.</small>
          <a href="/app/perfil">← Volver a mi perfil académico</a>
        </div>

        <form className="mt-5 grid gap-4" onSubmit={handleSubmit} aria-busy={isSaving}>
          <label className="block text-sm font-semibold text-[#344b3c}" htmlFor="credential-kind">
            Tipo de credencial
            <select className={inputClass} id="credential-kind" value={form.kind} onChange={(event) => setForm((current) => ({ ...current, kind: event.target.value, level: '' }))}>
              {credentialKinds.map((kind) => <option key={kind.value} value={kind.value}>{kind.label}</option>)}
            </select>
          </label>

          <label className="block text-sm font-semibold text-[#344b3c]" htmlFor="credential-value">
            {form.kind === 'language' ? 'Idioma' : form.kind === 'certificate' ? 'Nombre del certificado' : 'Habilidad'}
            <input className={inputClass} id="credential-value" type="text" maxLength="120" value={form.value} onChange={(event) => setForm((current) => ({ ...current, value: event.target.value }))} placeholder={form.kind === 'language' ? 'Ej. Inglés' : form.kind === 'certificate' ? 'Ej. Fundamentos de Python' : 'Ej. Python'} required />
          </label>

          {form.kind === 'language' ? (
            <label className="block text-sm font-semibold text-[#344b3c]" htmlFor="credential-level">
              Nivel de idioma
              <select className={inputClass} id="credential-level" value={form.level} onChange={(event) => setForm((current) => ({ ...current, level: event.target.value }))} required>
                <option value="">Selecciona tu nivel</option>
                {languageLevels.map((level) => <option key={level} value={level}>{level}</option>)}
              </select>
            </label>
          ) : form.kind === 'certificate' ? (
            <label className="block text-sm font-semibold text-[#344b3c]" htmlFor="credential-level">
              Nivel (opcional)
              <input className={inputClass} id="credential-level" type="text" maxLength="20" value={form.level} onChange={(event) => setForm((current) => ({ ...current, level: event.target.value }))} placeholder="Ej. Intermedio" />
            </label>
          ) : null}

          {saveError && <p className="m-0 rounded-xl border border-[#f1c3c0] bg-[#fff4f2] px-4 py-3 text-sm leading-5 text-[#9b302a]" role="alert">{saveError}</p>}
          {successMessage && <p className="m-0 rounded-xl border border-[#d5e8d3] bg-[#f1f8ec] px-4 py-3 text-sm leading-5 text-[#365f43]" role="status">{successMessage}</p>}

          <button className="mt-1 inline-flex min-h-12 items-center justify-center gap-2 rounded-xl bg-[#2475e2] px-5 text-sm font-semibold text-white focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#2475e2] disabled:cursor-wait disabled:opacity-70" type="submit" disabled={isSaving}>
            {isSaving ? 'Guardando…' : 'Agregar credencial'} {!isSaving && <Icon name="arrow-right" className="size-4" />}
          </button>
        </form>
      </Surface>

      <Surface className="p-0">
        <div className="border-b border-[#edf1eb] px-5 py-5 sm:px-6">
          <div className="flex items-start justify-between gap-4">
            <div>
              <h2 className="font-display text-lg font-semibold text-[#1d3557]">Mis credenciales</h2>
              <p className="mt-1 text-sm text-[#8595a9]">{credentials.length} {credentials.length === 1 ? 'registro' : 'registros'} en tu perfil</p>
            </div>
            <button className="min-h-10 rounded-lg px-3 text-sm font-semibold text-[#2876d7] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#2876d7]" type="button" onClick={() => setReloadKey((key) => key + 1)}>Actualizar</button>
          </div>
        </div>

        {credentials.length > 0 ? (
          <ul className="divide-y divide-[#edf1eb]">
            {credentials.map((credential) => (
              <li className="flex flex-col gap-3 px-5 py-4 sm:flex-row sm:items-center sm:justify-between sm:px-6" key={credential.id}>
                <div className="min-w-0">
                  <p className="m-0 font-semibold text-[#30483a]">{credential.value}{credential.level && <span className="ml-2 text-sm font-medium text-[#8595a9]">{credential.level}</span>}</p>
                  <p className="m-0 mt-1 text-sm text-[#7a887d]">{kindLabel(credential.kind)} · {credential.verified ? `Verificada por ${credential.issuer || 'un emisor autorizado'}` : 'Declarada por ti'}</p>
                </div>
                <CredentialStatus credential={credential} />
              </li>
            ))}
          </ul>
        ) : (
          <div className="px-5 py-10 text-center sm:px-6">
            <span className="mx-auto grid size-12 place-items-center rounded-2xl bg-[#eaf3ff] text-[#2876d7]" aria-hidden="true"><Icon name="check" /></span>
            <h3 className="mt-4 font-display text-lg font-semibold text-[#1d3557]">Aún no registraste credenciales</h3>
            <p className="mx-auto mt-2 max-w-sm text-sm leading-6 text-[#8595a9]">Agrega una habilidad o idioma para que el sistema pueda compararlo con los requisitos de las oportunidades.</p>
          </div>
        )}
      </Surface>
    </div>
  )
}

export default CredentialsPage
