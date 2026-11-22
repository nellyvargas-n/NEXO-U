import { useEffect, useState } from 'react'
import { getOpportunityFeed } from './opportunities.service.ts'
import { useAutoRefresh } from '../../shared/hooks/useAutoRefresh.js'

function getErrorMessage(error) {
  if (error instanceof TypeError) return 'No pudimos conectar con el servidor. Revisa la conexión e inténtalo otra vez.'
  return error instanceof Error ? error.message : 'No se pudieron cargar las oportunidades.'
}

export function useOpportunityFeed() {
  const [feed, setFeed] = useState({ opportunities: [], matchNotice: '' })
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState('')
  const refreshKey = useAutoRefresh()

  useEffect(() => {
    let isCurrent = true

    getOpportunityFeed()
      .then((result) => {
        if (isCurrent) {
          setFeed(result)
          setError('')
        }
      })
      .catch((requestError) => {
        if (isCurrent) setError(getErrorMessage(requestError))
      })
      .finally(() => {
        if (isCurrent) setIsLoading(false)
      })

    return () => { isCurrent = false }
  }, [refreshKey])

  return {
    ...feed,
    isLoading,
    error,
    refreshKey,
  }
}
