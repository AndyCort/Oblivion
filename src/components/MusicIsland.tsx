import { useState, useEffect } from 'react'
import Music from './Music'

/**
 * MusicIsland — Wrapper that listens for the 'toggle-music' custom event
 * dispatched by SideButton, and shows/hides the Music widget.
 */
export default function MusicIsland() {
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    const handler = () => setVisible(prev => !prev)
    window.addEventListener('toggle-music', handler)
    return () => window.removeEventListener('toggle-music', handler)
  }, [])

  if (!visible) return null
  return <Music />
}
