import { useState, useEffect, useCallback } from 'react'
import InitialLoader from './InitialLoader'

/**
 * LoaderIsland — Handles the initial loading animation with sessionStorage check.
 * Self-removes once loading is complete.
 */
export default function LoaderIsland() {
  const [isInitialLoad, setIsInitialLoad] = useState(() => {
    if (typeof sessionStorage === 'undefined') return false
    return !sessionStorage.getItem('hasLoaded')
  })

  const handleLoadingComplete = useCallback(() => {
    sessionStorage.setItem('hasLoaded', 'true')
    setIsInitialLoad(false)
  }, [])

  if (!isInitialLoad) return null
  return <InitialLoader onLoadingComplete={handleLoadingComplete} />
}
