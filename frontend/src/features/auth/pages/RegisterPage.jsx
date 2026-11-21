import { useState } from 'react'
import AuthLayout from '../components/AuthLayout.jsx'
import PasswordField from '../components/PasswordField.jsx'
import { authStyles } from '../components/authStyles.js'

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
      <form className={authStyles.registerForm} onSubmit={handleSubmit}>
        <fieldset className={authStyles.roleFieldset}>
          <legend className={authStyles.roleLegend}>¿Dónde estudias actualmente?</legend>
          <div className={authStyles.roleOptions}>
            <label className={authStyles.roleOption}>
              <input className={authStyles.roleInput} type="radio" name="studentType" value="school" required />
              <span className={authStyles.roleContent}><span className={authStyles.roleIcon} aria-hidden="true">◌</span><strong className={authStyles.roleText}>En el colegio</strong></span>
            </label>
            <label className={authStyles.roleOption}>
              <input className={authStyles.roleInput} type="radio" name="studentType" value="university" required />
              <span className={authStyles.roleContent}><span className={authStyles.roleIcon} aria-hidden="true">◎</span><strong className={authStyles.roleText}>En la universidad</strong></span>
            </label>
          </div>
        </fieldset>

        <div className={authStyles.field}>
          <label className={authStyles.label} htmlFor="register-name">Nombre completo</label>
          <div>
            <input className={authStyles.input} id="register-name" name="fullName" type="text" autoComplete="name" placeholder="Tu nombre y apellido" required />
          </div>
        </div>

        <div className={authStyles.field}>
          <label className={authStyles.label} htmlFor="register-email">Correo electrónico</label>
          <div>
            <input className={authStyles.input} id="register-email" name="email" type="email" autoComplete="email" placeholder="tu@correo.com" required />
          </div>
        </div>

        <PasswordField id="register-password" label="Crea una contraseña" autoComplete="new-password" minLength={8} hint="Mínimo 8 caracteres" />
        <PasswordField id="register-password-confirmation" label="Confirma tu contraseña" name="passwordConfirmation" autoComplete="new-password" minLength={8} />

        {notice && <p className={authStyles.feedback} role="status">{notice}</p>}

        <button className={authStyles.submit} type="submit">Crear mi cuenta <span className={authStyles.submitArrow} aria-hidden="true">→</span></button>
        <p className={authStyles.demoNote}>Vista previa: este formulario todavía no crea una cuenta.</p>
      </form>
    </AuthLayout>
  )
}

export default RegisterPage
