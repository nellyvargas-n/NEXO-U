import { useState } from 'react'

function PasswordField({ id, label = 'Contraseña', name = 'password', autoComplete, minLength, hint }) {
  const [visible, setVisible] = useState(false)

  return (
    <div className="auth-field">
      <label htmlFor={id}>{label}</label>
      <div className="auth-input-wrap auth-input-wrap--password">
        <input
          id={id}
          name={name}
          type={visible ? 'text' : 'password'}
          autoComplete={autoComplete}
          minLength={minLength}
          placeholder={hint || 'Ingresa tu contraseña'}
          required
        />
        <button
          className="password-toggle"
          type="button"
          aria-label={visible ? 'Ocultar contraseña' : 'Mostrar contraseña'}
          aria-pressed={visible}
          onClick={() => setVisible((value) => !value)}
        >
          {visible ? 'Ocultar' : 'Mostrar'}
        </button>
      </div>
      {hint && <span className="auth-field__hint">{hint}</span>}
    </div>
  )
}

export default PasswordField
