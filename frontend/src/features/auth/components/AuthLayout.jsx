import BrandMark from '../../../shared/components/BrandMark.jsx'
import { authStyles } from './authStyles.js'

function AuthLayout({
  pageType,
  eyebrow,
  title,
  description,
  switchText,
  switchLabel,
  switchHref,
  children,
}) {
  const isRegister = pageType === 'register'

  return (
    <div className={authStyles.page}>
      <aside className={authStyles.story} aria-label="Acerca de Nexo U">
        <div className="relative z-10">
          <BrandMark href="/" inverse size="large" />
        </div>

        <div className={authStyles.storyCopy}>
          <p className={authStyles.eyebrow}><span className="size-1.5 rounded-full bg-[#8dd1a4] shadow-[0_0_0_4px_rgba(141,209,164,0.12)]" /> TU RUTA, A TU RITMO</p>
          <h1 className={authStyles.storyTitle}>{title}</h1>
          <p className={authStyles.storyDescription}>{description}</p>
        </div>

        <div className={authStyles.showcase} aria-label="Vista ilustrativa de Nexo U">
          <div className={authStyles.showcaseGlow} />
          <div className={authStyles.showcaseProfile}>
            <span className={authStyles.showcaseLabel}>BILLETERA ESTUDIANTIL</span>
            <strong className={authStyles.showcaseTitle}>Lo que sabes<br />también cuenta.</strong>
            <div className={authStyles.showcaseChips}>
              <span className={authStyles.showcaseChip}>Habilidades</span><span className={authStyles.showcaseChip}>Cursos</span><span className={authStyles.showcaseChip}>Credenciales</span>
            </div>
          </div>
          <div className={authStyles.showcaseOpportunity}>
            <span className={authStyles.showcaseOpportunityIcon} aria-hidden="true">↗</span>
            <span className={authStyles.showcaseOpportunityCopy}><small className={authStyles.showcaseOpportunityEyebrow}>OPORTUNIDADES</small><strong className={authStyles.showcaseOpportunityTitle}>Un siguiente paso claro</strong></span>
          </div>
          <span className={authStyles.showcaseCaption}>Vista ilustrativa</span>
        </div>

        <p className={authStyles.storyFooter}>Credenciales, oportunidades y apoyo para tu camino.</p>
      </aside>

      <main className={authStyles.main}>
        <div className={authStyles.mobileBrand}><BrandMark href="/" /></div>
        <section className={`${authStyles.content} ${isRegister ? authStyles.contentRegister : ''}`} aria-labelledby="auth-form-title">
          <div className={authStyles.switch}>
            <span>{switchText}</span>
            <a className={authStyles.switchLink} href={switchHref}>{switchLabel}</a>
          </div>
          <div className={`${authStyles.formHeading} ${isRegister ? authStyles.formHeadingRegister : ''}`}>
            <p className={authStyles.formEyebrow}>{eyebrow}</p>
            <h2 className={`${authStyles.formTitle} ${isRegister ? authStyles.formTitleRegister : ''}`} id="auth-form-title">{isRegister ? 'Crea tu cuenta' : 'Inicia sesión'}</h2>
            <p className={authStyles.formDescription}>{isRegister ? 'Un perfil para tus próximos pasos.' : 'Ingresa tus datos para continuar.'}</p>
          </div>
          {children}
          <p className={authStyles.privacy}><span className={authStyles.privacyIcon} aria-hidden="true">⌁</span> Tu información es tuya. Tú decides qué compartir.</p>
        </section>
        <footer className={authStyles.footer}>© Nexo U · Tu camino, tus oportunidades.</footer>
      </main>
    </div>
  )
}

export default AuthLayout
