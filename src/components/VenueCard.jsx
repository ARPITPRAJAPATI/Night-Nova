import { useState } from 'react'
import StatusDot from './StatusDot'
import OccBar from './OccBar'
import { useOsc } from '../hooks/useOsc'
import { heatColor } from '../utils/heat'

export default function VenueCard({ v, onClick, active, onDelete }) {
  const [hov, setHov] = useState(false)
  const [imgLoaded, setImgLoaded] = useState(false)
  const live = useOsc(v.occupancy, 2, 3000)
  const c = heatColor(live)
  const img = v.img || `https://picsum.photos/seed/${v.name}/600/400`

  return (
    <div
      onClick={() => onClick(v)}
      onMouseEnter={() => setHov(true)}
      onMouseLeave={() => setHov(false)}
      style={{
        borderRadius: 'var(--radius-lg)',
        overflow: 'hidden',
        cursor: 'pointer',
        border: active
          ? '1px solid rgba(124,58,237,0.5)'
          : hov ? '1px solid var(--border-hover)' : '1px solid var(--border)',
        background: 'var(--bg-elevated)',
        transform: hov ? 'translateY(-2px)' : 'translateY(0)',
        transition: 'all 0.2s ease',
        boxShadow: active
          ? '0 0 0 1px rgba(124,58,237,0.2), 0 8px 32px rgba(0,0,0,0.4)'
          : hov ? '0 8px 32px rgba(0,0,0,0.4)' : '0 2px 8px rgba(0,0,0,0.3)',
        position: 'relative',
      }}
    >
      {/* Delete */}
      <button
        onClick={e => { e.stopPropagation(); onDelete(v._id) }}
        style={{
          position: 'absolute', top: 10, left: 10, zIndex: 10,
          width: 26, height: 26, borderRadius: '50%',
          background: 'rgba(239,68,68,0.85)', backdropFilter: 'blur(8px)',
          border: '1px solid rgba(239,68,68,0.3)', color: '#fff', fontSize: 11,
          cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center',
          opacity: hov ? 1 : 0, transition: 'opacity 0.15s',
        }}
      >✕</button>

      {/* Image */}
      <div style={{ position: 'relative', height: 180, overflow: 'hidden', background: '#0a0a0e' }}>
        {!imgLoaded && (
          <div style={{
            position: 'absolute', inset: 0, background: 'var(--bg-panel)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>
            <div className="spinner" />
          </div>
        )}
        <img
          src={img} alt={v.name}
          onLoad={() => setImgLoaded(true)}
          style={{
            width: '100%', height: '100%', objectFit: 'cover', display: 'block',
            opacity: imgLoaded ? 1 : 0,
            transform: hov ? 'scale(1.04)' : 'scale(1)',
            transition: 'transform 0.5s ease, opacity 0.3s ease',
            filter: 'brightness(0.82) saturate(0.9)',
          }}
        />
        <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to bottom, rgba(0,0,0,0.1) 40%, rgba(9,9,11,0.9) 100%)' }} />

        {/* Type badge */}
        <div style={{
          position: 'absolute', top: 10, left: hov ? 46 : 10,
          transition: 'left 0.15s',
          background: 'rgba(9,9,11,0.7)', backdropFilter: 'blur(12px)',
          border: '1px solid var(--border-hover)',
          borderRadius: 'var(--radius-sm)', padding: '3px 9px',
          fontSize: 10, fontWeight: 600, color: 'var(--text-secondary)',
          letterSpacing: '0.8px', textTransform: 'uppercase',
        }}>
          {v.type}
        </div>

        {/* Live occ badge */}
        <div style={{
          position: 'absolute', top: 10, right: 10,
          background: 'rgba(9,9,11,0.7)', backdropFilter: 'blur(12px)',
          border: `1px solid ${c}44`,
          borderRadius: 'var(--radius-sm)', padding: '3px 9px',
          fontSize: 10, fontWeight: 600, color: c,
          display: 'flex', alignItems: 'center', gap: 5,
        }}>
          <StatusDot color={c} />
          {live}%
        </div>

        {/* Name overlay */}
        <div style={{ position: 'absolute', bottom: 12, left: 12, right: 12 }}>
          <div style={{ fontSize: 17, fontWeight: 600, color: '#fff', letterSpacing: '-0.3px', lineHeight: 1.2 }}>
            {v.name}
          </div>
          <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.45)', marginTop: 2 }}>{v.address}</div>
        </div>
      </div>

      {/* Card body */}
      <div style={{ padding: '12px 14px 14px' }}>
        <OccBar occ={v.occupancy} height={2} />
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 10 }}>
          <div style={{ fontSize: 11, color: 'var(--text-muted)', letterSpacing: '0.3px' }}>
            {v.tags?.[0] || v.city}
          </div>
          <div style={{
            fontSize: 11, fontWeight: 600, letterSpacing: '0.5px',
            color: v.isOpen ? 'var(--green)' : 'var(--red)',
            fontFamily: 'var(--font-mono)',
          }}>
            {v.isOpen ? '● OPEN' : '○ CLOSED'}
          </div>
        </div>
      </div>
    </div>
  )
}
