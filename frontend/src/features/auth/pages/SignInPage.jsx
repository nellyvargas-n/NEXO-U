import { useState } from 'react'
import AuthLayout from '../components/AuthLayout.jsx'
import PasswordField from '../components/PasswordField.jsx'

function SignInPage() {
  const [notice, setNotice] = useState('')

  function handleSubmit(event) {
    event.preventDefault()
    setNotice('La interfaz está lista. No enviamos ni guardamos tus datos todavía.')
  }

  function handleForgotPassword() {
    setNotice('La recuperación de contraseña estará disponible al conectar el servicio de acceso.')
  }

  return (
    <AuthLayout
      pageType="login"
      eyebrow="QUÉ BUENO VERTE DE NUEVO"
      title="Tus próximos pasos empiezan aquí."
      description="Vuelve a tu perfil para revisar tus credenciales y las oportunidades que podrían encajar contigo."
      switchText="¿Aún no tienes cuenta?"
      switchLabel="Regístrate"
      switchHref="/register"
    >
      <form className="auth-form" onSubmit={handleSubmit}>
        <div className="auth-field">
          <label htmlFor="login-email">Correo electrónico</label>
          <div className="auth-input-wrap">
            <input id="login-email" name="email" type="email" autoComplete="email" placeholder="tu@correo.com" required />
          </div>
        </div>

        <PasswordField id="login-password" autoComplete="current-password" />

        <div className="auth-form-row">
          <label className="auth-checkbox">
            <input type="checkbox" name="remember" />
            <span>Recordar sesión</span>
          </label>
          <button className="auth-text-button" type="button" onClick={handleForgotPassword}>Olvidé mi contraseña</button>
        </div>

        {notice && <p className="auth-feedback" role="status">{notice}</p>}

        <button className="auth-submit" type="submit">Iniciar sesión <span aria-hidden="true">→</span></button>
        <p className="auth-demo-note">Vista previa: este formulario todavía no se conecta a una cuenta.</p>
      </form>
    </AuthLayout>
  )
}

export default SignInPage
