import { useEffect, useRef } from 'react'
import type { PiEvent } from './usePiMood'

const INACTIVITY_INTERVAL_MS = 30_000  // checa a cada 30s
const INACTIVITY_THRESHOLD_S  = 120    // sleeping apos 2min sem interacao

export function useDisengagementDetector(
  dispatch: (e: PiEvent) => void,
  active = true,
) {
  const idleSeconds = useRef(0)

  useEffect(() => {
    if (!active) return

    const onVisibility = () => {
      if (document.hidden) dispatch({ type: 'TAB_SWITCH' })
    }
    document.addEventListener('visibilitychange', onVisibility)

    const resetIdle = () => { idleSeconds.current = 0 }
    window.addEventListener('mousemove', resetIdle)
    window.addEventListener('keydown',   resetIdle)
    window.addEventListener('click',     resetIdle)

    const idleTimer = setInterval(() => {
      idleSeconds.current += INACTIVITY_INTERVAL_MS / 1000
      if (idleSeconds.current >= INACTIVITY_THRESHOLD_S) {
        dispatch({ type: 'INACTIVITY', seconds: idleSeconds.current })
      }
    }, INACTIVITY_INTERVAL_MS)

    return () => {
      document.removeEventListener('visibilitychange', onVisibility)
      window.removeEventListener('mousemove', resetIdle)
      window.removeEventListener('keydown',   resetIdle)
      window.removeEventListener('click',     resetIdle)
      clearInterval(idleTimer)
    }
  }, [active, dispatch])
}
