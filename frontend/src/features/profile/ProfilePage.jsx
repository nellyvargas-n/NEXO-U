import Surface from '../student-app/components/Surface.jsx'

const profile = [
  ['Nombre', 'Camila R.'],
  ['Carrera', 'Ingeniería de Sistemas'],
  ['Semestre', '6'],
  ['Ciudad', 'La Paz'],
]

function ProfilePage() {
  return (
    <div className="max-w-3xl">
      <Surface className="p-0">
        <div className="border-b border-[#edf1eb] px-5 py-4 sm:px-6">
          <h2 className="font-display text-lg font-semibold text-[#1c4033]">Perfil universitario</h2>
          <p className="mt-1 text-sm text-[#718075]">Datos ficticios usados para recorrer la demo.</p>
        </div>
        <dl className="divide-y divide-[#edf1eb]">
          {profile.map(([label, value]) => (
            <div className="grid gap-1 px-5 py-4 sm:grid-cols-[180px_1fr] sm:px-6" key={label}>
              <dt className="text-sm text-[#7b897e]">{label}</dt>
              <dd className="m-0 text-sm font-semibold text-[#344d3c]">{value}</dd>
            </div>
          ))}
        </dl>
      </Surface>
    </div>
  )
}

export default ProfilePage
