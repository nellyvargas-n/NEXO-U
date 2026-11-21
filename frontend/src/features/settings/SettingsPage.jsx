import Surface from '../student-app/components/Surface.jsx'

function SettingsPage() {
  return (
    <Surface className="max-w-3xl">
      <h2 className="font-display text-xl font-semibold text-[#1c4033]">Preferencias de cuenta</h2>
      <p className="mt-2 text-sm leading-6 text-[#66776b]">Las preferencias no se guardan en esta versión. El perfil que aparece en la navegación pertenece a la demostración.</p>
      <a className="mt-5 inline-flex min-h-10 items-center gap-2 text-sm font-semibold text-[#246b4a] hover:underline" href="/app/perfil">Ver perfil de ejemplo <span aria-hidden="true">→</span></a>
    </Surface>
  )
}

export default SettingsPage
