import { useEffect, useRef, useState } from 'react'

/**
 * Returns `true` for a brief window whenever `value` changes.
 *
 * This is what makes the "broadcast" visible: every panel that reads the
 * same store value can flash in sync the instant a dispatch resolves,
 * without any panel knowing the others exist. Skips the flash on first
 * mount so panels don't all pulse when the page loads.
 */
export function usePulse(value, duration = 480) {
  const [pulsing, setPulsing] = useState(false)
  const mounted = useRef(false)

  useEffect(() => {
    if (!mounted.current) {
      mounted.current = true
      return
    }
    setPulsing(true)
    const timer = setTimeout(() => setPulsing(false), duration)
    return () => clearTimeout(timer)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [value])

  return pulsing
}
