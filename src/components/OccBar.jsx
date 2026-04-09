import { useOsc } from '../hooks/useOsc'
import { heatColor } from '../utils/heat'

export default function OccBar({ occ, height = 2 }) {
  const live = useOsc(occ, 2, 3200)
  const c = heatColor(live)
  return (
    <div style={{ height, background: 'var(--border)', borderRadius: height, overflow: 'hidden' }}>
      <div style={{
        height: '100%', width: `${live}%`,
        background: c, transition: 'width 1.4s ease',
        borderRadius: height,
      }} />
    </div>
  )
}
