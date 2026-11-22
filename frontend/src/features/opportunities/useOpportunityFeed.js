import { useEffect, useState } from 'react'
import { getOpportunityFeed } from './opportunities.service.ts'

function getErrorMessage(error) {
  if (error instanceof TypeError) return 'No pudimos conectar con el servidor. Revisa la conexión e inténtalo otra vez.'
  return error instanceof Error ? error.message : 'No se pudieron cargar las oportunidades.'
}

export function useOpportunityFeed() {
  const [feed, setFeed] = useState({ opportunities: [], matchNotice: '' })
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState('')
  const [reloadKey, setReloadKey] = useState(0)

  useEffect(() => {
    let isCurrent = true
    setIsLoading(true)
    setError('')

    getOpportunityFeed()
      .then((result) => {
        if (isCurrent) setFeed(result)
      })
      .catch((requestError) => {
        if (isCurrent) setError(getErrorMessage(requestError))
      })
      .finally(() => {
        if (isCurrent) setIsLoading(false)
      })

    return () => { isCurrent = false }
  }, [reloadKey])

  return {
    ...feed,
    isLoading,
    error,
    retry: () => setReloadKey((key) => key + 1),
  }
}
