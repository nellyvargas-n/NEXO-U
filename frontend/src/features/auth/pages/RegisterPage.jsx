import { useState } from 'react'
import AuthLayout from '../components/AuthLayout.jsx'
import PasswordField from '../components/PasswordField.jsx'

function RegisterPage() {
  const [notice, setNotice] = useState('')

  function handleSubmit(event) {
    event.preventDefault()
    const formData = new FormData(event.currentTarget)
    const password = formData.get('password')
    const passwordConfirmation = formData.get('passwordConfirmation')

    if (password !== passwordConfirmation) {
      setNotice('Las contraseñas no coinciden. Revísalas e inténtalo de nuevo.')
      return
    }

    setNotice('La interfaz está lista. No enviamos ni guardamos tus datos todavía.')
  }

  return (
    <AuthLayout
      pageType="register"
      eyebrow="EMPIEZA CON TU PERFIL"
      title="Lo que ya sabes puede abrir una puerta."
      description="Reúne tus habilidades, cursos y credenciales para descubrir oportunidades pensadas para tu etapa de estudio."
      switchText="¿Ya tienes una cuenta?"
      switchLabel="Inicia sesión"
      switchHref="/login"
    >
      <form className="auth-form auth-form--register" onSubmit={handleSubmit}>
        <fieldset className="role-fieldset">
          <legend>¿Dónde estudias actualmente?</legend>
          <div className="role-options">
            <label className="role-option">
              <input type="radio" name="studentType" value="school" required />
              <span className="role-option__content"><span aria-hidden="true">◌</span><strong>En el colegio</strong></span>
            </label>
            <label className="role-option">
              <input type="radio" name="studentType" value="university" required />
              <span className="role-option__content"><span aria-hidden="true">◎</span><strong>En la universidad</strong></span>
            </label>
          </div>
        </fieldset>

        <div className="auth-field">
          <label htmlFor="register-name">Nombre completo</label>
          <div className="auth-input-wrap">
            <input id="register-name" name="fullName" type="text" autoComplete="name" placeholder="Tu nombre y apellido" required />
          </div>
        </div>

        <div className="auth-field">
          <label htmlFor="register-email">Correo electrónico</label>
          <div className="auth-input-wrap">
            <input id="register-email" name="email" type="email" autoComplete="email" placeholder="tu@correo.com" required />
          </div>
        </div>

        <PasswordField id="register-password" label="Crea una contraseña" autoComplete="new-password" minLength={8} hint="Mínimo 8 caracteres" />
        <PasswordField id="register-password-confirmation" label="Confirma tu contraseña" name="passwordConfirmation" autoComplete="new-password" minLength={8} />

        {notice && <p className="auth-feedback" role="status">{notice}</p>}

        <button className="auth-submit" type="submit">Crear mi cuenta <span aria-hidden="true">→</span></button>
        <p className="auth-demo-note">Vista previa: este formulario todavía no crea una cuenta.</p>
      </form>
    </AuthLayout>
  )
}

export default RegisterPage
