import Surface from '../student-app/components/Surface.jsx'

function WalletPage() {
  return (
    <Surface className="max-w-3xl">
      <p className="text-sm font-semibold text-[#3a7653]">Módulo opcional</p>
      <h2 className="mt-2 font-display text-xl font-semibold text-[#1c4033]">Finanzas para estudiantes adultos</h2>
      <p className="mt-3 text-sm leading-6 text-[#66776b]">La billetera financiera no es necesaria para encontrar becas, pasantías o cursos. Esta interfaz no se conecta a bancos ni muestra movimientos reales.</p>
      <p className="mt-4 rounded-xl bg-[#f7f8f3] p-4 text-sm leading-6 text-[#66776b]">La propuesta mantiene los datos financieros fuera del perfil que se comparte con organizaciones.</p>
    </Surface>
  )
}

export default WalletPage
