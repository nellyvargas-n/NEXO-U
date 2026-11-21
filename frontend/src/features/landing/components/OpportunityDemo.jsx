import { useState } from 'react'
import { demoOpportunity } from '../data/demoOpportunity.js'
import Icon from '../../../shared/components/Icon.jsx'

function OpportunityDemo() {
  const [verified, setVerified] = useState(false)
  const requirements = demoOpportunity.requirements
  const requirementToVerify = requirements.find((requirement) => !requirement.met && requirement.label === demoOpportunity.suggestedCourse)
    ?? requirements.find((requirement) => !requirement.met)
  const completedCount = requirements.filter((requirement) => requirement.met || (verified && requirement === requirementToVerify)).length
  const totalRequirements = requirements.length

  return (
    <article className="overflow-hidden rounded-3xl border border-[#d9e5d8] bg-white shadow-[0_28px_80px_rgba(26,72,55,0.14)]" id="demo" aria-label="Demostración de coincidencia con una oportunidad">
      <div className="flex items-center gap-3 border-b border-[#e8eee6] bg-[#f8faf6] px-5 py-4 sm:px-6">
        <span className="text-sm font-semibold text-[#566e5e]">Vista de oportunidades</span>
        <span className="ml-auto rounded-full bg-[#e8f3e6] px-2.5 py-1 text-xs font-semibold text-[#3e7651]">Demo</span>
      </div>

      <div className="p-5 sm:p-7">
        <div className="flex flex-wrap items-center gap-2 text-sm font-medium text-[#6c8173]">
          <span className="grid size-8 place-items-center rounded-lg bg-[#edf5e9] text-[#398253]"><Icon name="briefcase" className="size-4" /></span>
          <span>{demoOpportunity.category}</span>
        </div>

        <div className="mt-5 flex flex-wrap items-end justify-between gap-3">
          <div>
            <p className="mb-1 text-sm font-medium text-[#748278]">Convocatoria de ejemplo</p>
            <h2 className="font-display text-2xl font-semibold leading-tight tracking-[-0.03em] text-[#193a31]">{demoOpportunity.title}</h2>
          </div>
          <p className="m-0 rounded-lg bg-[#f4f7f2] px-3 py-2 text-sm text-[#687a6d]">
            <Icon name="calendar" className="mr-1 inline size-4 align-[-3px]" />Cierra {demoOpportunity.deadline}
          </p>
        </div>

        <div className="mt-6 rounded-2xl bg-[#f4f8f3] p-4 sm:p-5">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <p className="m-0 font-display text-3xl font-bold tracking-tight text-[#247858]">
                {completedCount}<span className="text-lg font-medium text-[#839186]">/{totalRequirements}</span>
              </p>
              <p className="m-0 text-sm text-[#687b70]">requisitos cumplidos</p>
            </div>
            <span className={`rounded-full px-3 py-1.5 text-sm font-semibold ${verified ? 'bg-[#e6f0d4] text-[#315d43]' : 'bg-[#e4f2e5] text-[#4b795c]'}`}>
              {verified ? '5/5 requisitos' : 'Buen match'}
            </span>
          </div>
          <div
            className="mt-4 flex h-2 gap-1 overflow-hidden rounded-full bg-[#dfe8df]"
            role="progressbar"
            aria-label="Requisitos cumplidos"
            aria-valuemin={0}
            aria-valuemax={totalRequirements}
            aria-valuenow={completedCount}
          >
            {requirements.map((requirement) => {
              const met = requirement.met || (verified && requirement === requirementToVerify)
              return <span className={`h-full flex-1 rounded-full transition-colors duration-300 ${met ? 'bg-[#67ad7e]' : 'bg-transparent'}`} key={requirement.label} aria-hidden="true" />
            })}
          </div>
        </div>

        <div className="mt-6">
          <h3 className="text-sm font-semibold text-[#52685a]">Requisitos de la oportunidad</h3>
          <ul className="mt-2 divide-y divide-[#edf1eb]">
            {requirements.map((requirement) => {
              const met = requirement.met || (verified && requirement === requirementToVerify)
              return (
                <li className="flex min-h-12 items-center gap-3 py-2 text-sm text-[#56685c]" key={requirement.label}>
                  <span className={`grid size-6 shrink-0 place-items-center rounded-full ${met ? 'bg-[#e4f2e5] text-[#328052]' : 'bg-[#fbf2dd] text-[#947333]'}`}>
                    <Icon name={met ? 'check' : 'plus'} className="size-3.5" />
                  </span>
                  <span className={met ? '' : 'font-medium text-[#344f40]'}>{requirement.label}</span>
                  {!met && <span className="ml-auto text-xs font-semibold text-[#927d49]">Te falta</span>}
                  {met && verified && requirement === requirementToVerify && <span className="ml-auto text-xs font-semibold text-[#548164]">Verificada</span>}
                </li>
              )
            })}
          </ul>
        </div>

        {verified ? (
          <p className="mt-5 flex items-start gap-3 rounded-xl border border-[#dbe9d4] bg-[#f3f8e9] p-4 text-sm leading-6 text-[#426d4f]" role="status">
            <span className="grid size-6 shrink-0 place-items-center rounded-full bg-[#76a86d] text-white"><Icon name="check" className="size-4" /></span>
            Validación simulada. Ya cumples los {totalRequirements} requisitos de esta oportunidad.
          </p>
        ) : (
          <div className="mt-5 flex items-center gap-3 rounded-xl border border-[#e7eee5] bg-[#fbfcf8] p-4">
            <span className="grid size-10 shrink-0 place-items-center rounded-xl bg-[#edf4e6] text-[#648b6a]"><Icon name="book-open" className="size-5" /></span>
            <div className="min-w-0">
              <p className="m-0 text-sm font-medium text-[#748278]">Siguiente paso posible</p>
              <p className="m-0 mt-1 font-semibold text-[#385e4a]">{demoOpportunity.suggestedCourse}</p>
              <p className="m-0 mt-1 text-sm text-[#7b897f]">{demoOpportunity.courseProvider}</p>
            </div>
          </div>
        )}

        <button
          className={`mt-4 inline-flex min-h-12 w-full items-center justify-between rounded-xl px-4 text-sm font-semibold transition focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#1c5a42] active:translate-y-0 ${verified ? 'bg-[#eaf3df] text-[#38644a] hover:bg-[#e1edcf]' : 'bg-[#1e5a45] text-white hover:-translate-y-0.5 hover:bg-[#277354]'}`}
          type="button"
          aria-pressed={verified}
          onClick={() => setVerified((current) => !current)}
        >
          {verified ? 'Restablecer demostración' : 'Simular validación del curso'}
          <Icon name={verified ? 'rotate-ccw' : 'arrow-right'} className="size-5" />
        </button>
        <p className="mb-0 mt-3 text-center text-xs text-[#8a978d]">Los datos y la validación de esta tarjeta son de ejemplo.</p>
      </div>
    </article>
  )
}

export default OpportunityDemo
