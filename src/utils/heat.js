// Shared helpers used across multiple components
export const heatColor = o =>
  o >= 80 ? 'var(--red)' : o >= 60 ? 'var(--yellow)' : 'var(--green)'

export const heatWord = o =>
  o >= 80 ? 'ALMOST FULL' : o >= 60 ? 'FILLING FAST' : 'WALK IN'
