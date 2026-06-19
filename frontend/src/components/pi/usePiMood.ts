import { useState, useCallback } from 'react'
import type { Mood } from './PiAvatar'

export type PiEvent =
  | { type: 'CORRECT_ANSWER'; difficulty: number }
  | { type: 'WRONG_ANSWER' }
  | { type: 'CONCEPT_MASTERED' }
  | { type: 'TAB_SWITCH' }
  | { type: 'BLOCK_ABANDONED' }
  | { type: 'INACTIVITY'; seconds: number }

export function usePiMood(returnDelay = 4000) {
  const [mood, setMood] = useState<Mood>('focused')

  const dispatch = useCallback((event: PiEvent) => {
    let next: Mood

    switch (event.type) {
      case 'CORRECT_ANSWER':
        next = event.difficulty >= 0.7 ? 'celebrating' : 'focused'
        break
      case 'CONCEPT_MASTERED':
        next = 'celebrating'
        break
      case 'WRONG_ANSWER':
        next = 'worried'
        break
      case 'TAB_SWITCH':
      case 'BLOCK_ABANDONED':
        next = 'annoyed'
        break
      case 'INACTIVITY':
        next = event.seconds > 120 ? 'sleeping' : 'worried'
        break
    }

    setMood(next)
    if (next !== 'focused') {
      setTimeout(() => setMood('focused'), returnDelay)
    }
  }, [returnDelay])

  return { mood, dispatch }
}
