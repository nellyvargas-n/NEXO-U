import { useState } from 'react'
import AuthLayout from '../components/AuthLayout.jsx'
import PasswordField from '../components/PasswordField.jsx'
import { authStyles } from '../components/authStyles.js'

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
      <form className={authStyles.form} onSubmit={handleSubmit}>
        <div className={authStyles.field}>
          <label className={authStyles.label} htmlFor="login-email">Correo electrónico</label>
          <div>
            <input className={authStyles.input} id="login-email" name="email" type="email" autoComplete="email" placeholder="tu@correo.com" required />
          </div>
        </div>

        <PasswordField id="login-password" autoComplete="current-password" />

        <div className={authStyles.formRow}>
          <label className={authStyles.checkbox}>
            <input className={authStyles.checkboxInput} type="checkbox" name="remember" />
            <span>Recordar sesión</span>
          </label>
          <button className={authStyles.textButton} type="button" onClick={handleForgotPassword}>Olvidé mi contraseña</button>
        </div>

        {notice && <p className={authStyles.feedback} role="status">{notice}</p>}

        <button className={authStyles.submit} type="submit">Iniciar sesión <span className={authStyles.submitArrow} aria-hidden="true">→</span></button>
        <p className={authStyles.demoNote}>Vista previa: este formulario todavía no se conecta a una cuenta.</p>
      </form>
    </AuthLayout>
  )
}

export default SignInPage
