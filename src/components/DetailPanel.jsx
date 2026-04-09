import { useState, useEffect } from 'react'
import StatusDot from './StatusDot'
import OccBar from './OccBar'
import { useOsc } from '../hooks/useOsc'
import { heatColor, heatWord } from '../utils/heat'

export default function DetailPanel({ v, onClose }) {
  const live = useOsc(v.occupancy, 3, 2600)
  const c = heatColor(live)
  const [imgLoaded, setImgLoaded] = useState(false)
  const img = v.img || `https://picsum.photos/seed/${v.name}/600/400`

  useEffect(() => {
    const h = e => { if (e.key === 'Escape') onClose() }
    window.addEventListener('keydown', h)
    return () => window.removeEventListener('keydown', h)
  }, [onClose])

  return (
    <div style={{
      height: '100%', display: 'flex', flexDirection: 'column',
      background: 'var(--bg-panel)',
      borderLeft: '1px solid var(--border)',
    }}>
      {/* Hero image */}
      <div style={{ position: 'relative', height: 220, flexShrink: 0, overflow: 'hidden', background: '#0a0a0e' }}>
        {!imgLoaded && (
          <div style={{ position: 'absolute', inset: 0, background: 'var(--bg-panel)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <div className="spinner" />
          </div>
        )}
        <img
          src={img} alt={v.name}
          onLoad={() => setImgLoaded(true)}
          style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block', opacity: imgLoaded ? 1 : 0, transition: 'opacity 0.3s', filter: 'brightness(0.75) saturate(0.85)' }}
        />
        <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to bottom, rgba(0,0,0,0.05), rgba(17,17,22,0.98))' }} />

        <button onClick={onClose} className="close-btn"
          onMouseEnter={e => { e.currentTarget.style.background = 'rgba(239,68,68,0.8)'; e.currentTarget.style.color = '#fff' }}
          onMouseLeave={e => { e.currentTarget.style.background = 'rgba(9,9,11,0.8)'; e.currentTarget.style.color = 'var(--text-secondary)' }}
        >✕</button>

        <div style={{ position: 'absolute', bottom: 14, left: 16, right: 50 }}>
          <div style={{ fontSize: 22, fontWeight: 700, color: '#fff', letterSpacing: '-0.4px', lineHeight: 1.2 }}>{v.name}</div>
          <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.4)', marginTop: 4 }}>{v.address} · {v.type}</div>
        </div>
      </div>

      {/* Body */}
      <div style={{ flex: 1, overflowY: 'auto', padding: '16px', display: 'flex', flexDirection: 'column', gap: 10 }}>

        {/* Live occupancy */}
        <div style={{
          background: 'var(--bg-glass)', border: `1px solid ${c}22`,
          borderRadius: 'var(--radius-md)', padding: 14,
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
            <span style={{ fontSize: 10, letterSpacing: '2px', color: 'var(--text-muted)', fontWeight: 600, textTransform: 'uppercase' }}>Live Occupancy</span>
            <div style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
              <StatusDot color={c} />
              <span style={{ fontSize: 10, color: c, fontWeight: 600, letterSpacing: '1px', fontFamily: 'var(--font-mono)' }}>{heatWord(live)}</span>
            </div>
          </div>
          <div style={{ display: 'flex', alignItems: 'baseline', gap: 4, marginBottom: 10 }}>
            <span style={{ fontSize: 44, fontWeight: 700, color: c, lineHeight: 1, transition: 'color 0.6s', fontFamily: 'var(--font-mono)' }}>{live}</span>
            <span style={{ fontSize: 18, color: 'var(--text-muted)' }}>%</span>
          </div>
          <OccBar occ={v.occupancy} height={3} />
        </div>

        {/* Stats grid */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
          {[
            { label: 'TYPE',   val: v.type },
            { label: 'RATING', val: `${v.rating}/5` },
            { label: 'CITY',   val: v.city?.toUpperCase() },
            { label: 'STATUS', val: v.isOpen ? 'Open' : 'Closed', color: v.isOpen ? 'var(--green)' : 'var(--red)' },
          ].map(({ label, val, color }) => (
            <div key={label} style={{
              background: 'var(--bg-glass)',
              border: '1px solid var(--border)',
              borderRadius: 'var(--radius-md)', padding: '12px 14px',
            }}>
              <div style={{ fontSize: 9, letterSpacing: '2px', color: 'var(--text-muted)', marginBottom: 5, fontWeight: 600 }}>{label}</div>
              <div style={{ fontSize: 14, fontWeight: 600, color: color || 'var(--text-primary)', fontFamily: label === 'STATUS' ? 'var(--font-mono)' : undefined }}>{val}</div>
            </div>
          ))}
        </div>

        {/* Tags */}
        {v.tags?.length > 0 && (
          <div style={{
            background: 'var(--bg-glass)', border: '1px solid var(--border)',
            borderRadius: 'var(--radius-md)', padding: '12px 14px',
          }}>
            <div style={{ fontSize: 9, letterSpacing: '2px', color: 'var(--text-muted)', marginBottom: 9, fontWeight: 600 }}>TAGS</div>
            <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
              {v.tags.map(t => (
                <span key={t} style={{
                  fontSize: 10, padding: '4px 10px', borderRadius: 'var(--radius-sm)',
                  background: 'var(--bg-glass)', border: '1px solid var(--border)',
                  color: 'var(--text-secondary)', letterSpacing: '0.3px',
                }}>{t}</span>
              ))}
            </div>
          </div>
        )}

        {/* CTA */}
        <button className="cta-btn"
          onMouseEnter={e => { e.currentTarget.style.background = 'var(--accent-light)'; e.currentTarget.style.transform = 'translateY(-1px)' }}
          onMouseLeave={e => { e.currentTarget.style.background = 'var(--accent)'; e.currentTarget.style.transform = 'translateY(0)' }}
        >
          Reserve a Table →
        </button>
      </div>
    </div>
  )
}
