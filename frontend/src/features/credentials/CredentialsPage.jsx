import Surface from '../student-app/components/Surface.jsx'

const credentials = [
  { name: 'Python', origin: 'Declarada en el perfil', status: 'Pendiente de verificar', style: 'bg-[#fbf3de] text-[#8b713b]' },
  { name: 'Inglés B1', origin: 'Requisito de la pasantía', status: 'Falta completar', style: 'bg-[#f4f1e8] text-[#837344]' },
]

function CredentialsPage() {
  return (
    <div className="max-w-3xl">
      <Surface className="p-0">
        <div className="border-b border-[#edf1eb] px-5 py-4 sm:px-6">
          <h2 className="font-display text-lg font-semibold text-[#1c4033]">Credenciales del perfil de ejemplo</h2>
          <p className="mt-1 text-sm text-[#718075]">Una habilidad declarada se diferencia de una credencial confirmada.</p>
        </div>
        <ul className="divide-y divide-[#edf1eb]">
          {credentials.map((credential) => (
            <li className="flex flex-wrap items-center justify-between gap-3 px-5 py-4 sm:px-6" key={credential.name}>
              <div>
                <p className="font-semibold text-[#30483a]">{credential.name}</p>
                <p className="mt-1 text-sm text-[#7a887d]">{credential.origin}</p>
              </div>
              <span className={['rounded-full px-3 py-1.5 text-xs font-semibold', credential.style].join(' ')}>{credential.status}</span>
            </li>
          ))}
        </ul>
      </Surface>
    </div>
  )
}

export default CredentialsPage
