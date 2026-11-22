import Surface from '../student-app/components/Surface.jsx'

function PrivacyPage() {
  return (
    <div className="grid max-w-4xl gap-5 md:grid-cols-2">
      <Surface>
        <h2 className="font-display text-lg font-semibold text-[#1d3557]">Cuenta y perfil</h2>
        <p className="mt-2 text-sm leading-6 text-[#7b8da5]">El registro crea una cuenta en el servicio de Nexo U. Después de iniciar sesión, puedes completar y actualizar tus datos académicos desde Mi perfil.</p>
      </Surface>
      <Surface>
        <h2 className="font-display text-lg font-semibold text-[#1d3557]">Información financiera</h2>
        <p className="mt-2 text-sm leading-6 text-[#7b8da5]">La billetera es opcional. La propuesta separa los datos financieros del perfil visible para organizaciones.</p>
      </Surface>
      <Surface className="bg-[#f8faf6] md:col-span-2">
        <p className="text-sm leading-6 text-[#7b8da5]">Antes de un piloto con estudiantes menores de edad, se requieren los consentimientos adecuados y un tratamiento de datos ajustado a la institución.</p>
      </Surface>
    </div>
  )
}

export default PrivacyPage
