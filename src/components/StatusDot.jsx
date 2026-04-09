export default function StatusDot({ color }) {
  return (
    <span style={{ position: 'relative', display: 'inline-flex', width: 7, height: 7, flexShrink: 0 }}>
      <span style={{
        position: 'absolute', inset: 0, borderRadius: '50%',
        background: color, opacity: 0.45,
        animation: 'pulse-ring 2s ease infinite',
      }} />
      <span style={{ position: 'relative', borderRadius: '50%', width: 7, height: 7, background: color }} />
    </span>
  )
}
