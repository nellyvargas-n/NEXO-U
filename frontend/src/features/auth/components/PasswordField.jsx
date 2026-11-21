import { useState } from 'react'
import { authStyles } from './authStyles.js'

function PasswordField({ id, label = 'Contraseña', name = 'password', autoComplete, minLength, hint }) {
  const [visible, setVisible] = useState(false)

  return (
    <div className={authStyles.field}>
      <label className={authStyles.label} htmlFor={id}>{label}</label>
      <div className="relative">
        <input
          className={`${authStyles.input} ${authStyles.passwordInput}`}
          id={id}
          name={name}
          type={visible ? 'text' : 'password'}
          autoComplete={autoComplete}
          minLength={minLength}
          placeholder={hint || 'Ingresa tu contraseña'}
          required
        />
        <button
          className={authStyles.passwordToggle}
          type="button"
          aria-label={visible ? 'Ocultar contraseña' : 'Mostrar contraseña'}
          aria-pressed={visible}
          onClick={() => setVisible((value) => !value)}
        >
          {visible ? 'Ocultar' : 'Mostrar'}
        </button>
      </div>
      {hint && <span className={authStyles.fieldHint}>{hint}</span>}
    </div>
  )
}

export default PasswordField
