import { useState } from 'react'

function PasswordField({
  id,
  label = 'Contraseña',
  name = 'password',
  autoComplete,
  minLength,
  maxLength = 128,
  hint,
  error,
  onChange,
}) {
  const [visible, setVisible] = useState(false)
  const hintId = hint ? `${id}-hint` : undefined
  const errorId = error ? `${id}-error` : undefined
  const describedBy = [hintId, errorId].filter(Boolean).join(' ') || undefined

  return (
    <div className="grid gap-2">
      <label className="text-sm font-semibold text-[#344b3c]" htmlFor={id}>{label}</label>
      <div className="relative">
        <input
          className="h-12 w-full rounded-xl border border-[#d8e2d7] bg-white px-4 pr-20 text-base text-[#253b30] outline-none transition focus:border-[#438c61] focus:ring-4 focus:ring-[#438c61]/15 aria-invalid:border-red-600 aria-invalid:focus:ring-red-600/15"
          id={id}
          name={name}
          type={visible ? 'text' : 'password'}
          autoComplete={autoComplete}
          minLength={minLength}
          maxLength={maxLength}
          placeholder="Ingresa tu contraseña"
          aria-invalid={error ? 'true' : undefined}
          aria-describedby={describedBy}
          onChange={onChange}
          required
        />
        <button
          className="absolute inset-y-0 right-1 my-auto inline-flex min-h-11 min-w-16 items-center justify-center rounded-lg px-2 text-sm font-semibold text-[#347a57] transition hover:bg-[#eff6ed] hover:text-[#174d38] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#347a57]"
          type="button"
          aria-label={visible ? 'Ocultar contraseña' : 'Mostrar contraseña'}
          aria-pressed={visible}
          onClick={() => setVisible((value) => !value)}
        >
          {visible ? 'Ocultar' : 'Mostrar'}
        </button>
      </div>
      {hint && <span className="text-sm text-[#718075]" id={hintId}>{hint}</span>}
      {error && <span className="text-sm font-medium text-red-700" id={errorId}>{error}</span>}
    </div>
  )
}

export default PasswordField
