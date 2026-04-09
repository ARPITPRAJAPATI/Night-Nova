import { useState, useEffect } from 'react'

export function useOsc(base, range = 3, speed = 3500) {
  const [v, setV] = useState(base)
  useEffect(() => {
    const i = setInterval(
      () => setV(base + Math.round((Math.random() - 0.5) * range * 2)),
      speed
    )
    return () => clearInterval(i)
  }, [base, range, speed])
  return v
}
