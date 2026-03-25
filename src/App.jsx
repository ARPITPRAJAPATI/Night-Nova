import { useState, useEffect } from 'react'
import AdminPanel from './AdminPanel.jsx'

// ─── API BASE URL ─────────────────────────────────────────────────────────────
const API = 'http://localhost:5000/api'

const heatColor = o => o >= 80 ? '#ff2d55' : o >= 60 ? '#ff9f0a' : '#30d158'
const heatWord  = o => o >= 80 ? 'ALMOST FULL' : o >= 60 ? 'FILLING FAST' : 'WALK IN'

function useClock() {
  const [t, setT] = useState(new Date())
  useEffect(() => { const i = setInterval(() => setT(new Date()), 1000); return () => clearInterval(i) }, [])
  return t
}

function useOsc(base, range = 3, speed = 3500) {
  const [v, setV] = useState(base)
  useEffect(() => {
    const i = setInterval(() => setV(base + Math.round((Math.random() - 0.5) * range * 2)), speed)
    return () => clearInterval(i)
  }, [base])
  return v
}

function Pulse({ color = '#30d158', size = 8 }) {
  return (
    <span style={{ position:'relative', display:'inline-flex', width:size, height:size, flexShrink:0 }}>
      <span style={{ position:'absolute', inset:0, borderRadius:'50%', background:color, opacity:0.5, animation:'ping 1.6s ease infinite' }} />
      <span style={{ position:'relative', borderRadius:'50%', width:size, height:size, background:color }} />
    </span>
  )
}

function OccBar({ occ, height = 3 }) {
  const live = useOsc(occ, 2, 3200)
  const c = heatColor(live)
  return (
    <div style={{ height, background:'rgba(255,255,255,0.1)', borderRadius:height, overflow:'hidden' }}>
      <div style={{
        height:'100%', width:`${live}%`,
        background:c, boxShadow:`0 0 6px ${c}`,
        transition:'width 1.2s ease',
        borderRadius:height,
      }} />
    </div>
  )
}

// ─── VENUE CARD ─────────────────────────────────────────────────────────────
function VenueCard({ v, onClick, active, onDelete }) {
  const [hov, setHov] = useState(false)
  const [imgLoaded, setImgLoaded] = useState(false)
  const live = useOsc(v.occupancy, 2, 3000)
  const c = heatColor(live)

  const grad = v.grad || 'linear-gradient(135deg,#a855f7,#6366f1)'
  const img  = v.img  || `https://picsum.photos/seed/${v.name}/600/400`
  const tag  = v.tag  || `🎵 ${v.type?.toUpperCase() || 'VENUE'}`

  return (
    <div
      onClick={() => onClick(v)}
      onMouseEnter={() => setHov(true)}
      onMouseLeave={() => setHov(false)}
      style={{
        borderRadius: 20,
        overflow: 'hidden',
        cursor: 'pointer',
        border: active ? '2px solid rgba(255,255,255,0.4)' : '2px solid transparent',
        transform: hov ? 'scale(1.025) translateY(-3px)' : 'scale(1)',
        transition: 'all 0.25s cubic-bezier(0.34,1.56,0.64,1)',
        boxShadow: hov
          ? `0 24px 64px rgba(0,0,0,0.7), 0 0 0 1px rgba(255,255,255,0.06)`
          : '0 4px 24px rgba(0,0,0,0.5)',
        background: '#0e0b1e',
        position: 'relative',
      }}
    >
      {/* ── DELETE BUTTON ── */}
      <button
        onClick={e => { e.stopPropagation(); onDelete(v._id) }}
        style={{
          position:'absolute', top:12, left:12, zIndex:10,
          width:28, height:28, borderRadius:'50%',
          background:'rgba(255,45,85,0.85)', backdropFilter:'blur(8px)',
          border:'none', color:'#fff', fontSize:12,
          cursor:'pointer', display:'flex', alignItems:'center', justifyContent:'center',
          opacity: hov ? 1 : 0, transition:'opacity 0.2s',
        }}
      >🗑</button>

      {/* ── IMAGE SECTION ── */}
      <div style={{ position:'relative', height:190, overflow:'hidden', background:'#1a1030' }}>
        {!imgLoaded && (
          <div style={{
            position:'absolute', inset:0,
            background:'linear-gradient(135deg,#1a1030,#0e0820)',
            display:'flex', alignItems:'center', justifyContent:'center',
          }}>
            <div style={{ fontSize:32, opacity:0.3 }}>🌃</div>
          </div>
        )}
        <img
          src={img}
          alt={v.name}
          onLoad={() => setImgLoaded(true)}
          style={{
            width:'100%', height:'100%',
            objectFit:'cover', display:'block',
            opacity: imgLoaded ? 1 : 0,
            transform: hov ? 'scale(1.1)' : 'scale(1)',
            transition: 'transform 0.5s ease, opacity 0.3s ease',
          }}
        />
        <div style={{
          position:'absolute', inset:0,
          background:'linear-gradient(to bottom, rgba(0,0,0,0.15) 0%, rgba(14,11,30,0.95) 100%)',
        }} />
        <div style={{
          position:'absolute', inset:0,
          background: grad.replace('linear-gradient(135deg,','linear-gradient(to bottom right,').replace(')',',transparent)'),
          opacity:0.25, mixBlendMode:'screen',
        }} />
        <div style={{
          position:'absolute', top:12, left:48,
          background:'rgba(0,0,0,0.55)', backdropFilter:'blur(12px)',
          WebkitBackdropFilter:'blur(12px)',
          border:'1px solid rgba(255,255,255,0.12)',
          borderRadius:30, padding:'5px 11px',
          fontSize:10, fontWeight:700, color:'#fff', letterSpacing:'0.3px',
        }}>
          {tag}
        </div>
        <div style={{
          position:'absolute', top:12, right:12,
          background:`${c}20`, backdropFilter:'blur(12px)',
          WebkitBackdropFilter:'blur(12px)',
          border:`1px solid ${c}55`,
          borderRadius:30, padding:'5px 11px',
          fontSize:10, fontWeight:800, color:c,
          display:'flex', alignItems:'center', gap:5,
        }}>
          <Pulse color={c} size={6} />
          {live}%
        </div>
        <div style={{ position:'absolute', bottom:14, left:14, right:14 }}>
          <div style={{
            fontSize:22, fontWeight:800, color:'#fff',
            letterSpacing:'-0.5px', lineHeight:1.1,
            textShadow:'0 2px 12px rgba(0,0,0,0.8)',
          }}>
            {v.name}
          </div>
          <div style={{ fontSize:11, color:'rgba(255,255,255,0.55)', marginTop:3 }}>
            {v.address}
          </div>
        </div>
      </div>

      {/* ── CARD BODY ── */}
      <div style={{
        padding:'14px 16px 16px',
        background: active ? 'rgba(168,85,247,0.08)' : '#0e0b1e',
      }}>
        <div style={{ marginBottom:12 }}>
          <span style={{
            fontSize:9, letterSpacing:'1.5px', fontWeight:700,
            padding:'4px 12px', borderRadius:30,
            background:grad, color:'#fff',
          }}>
            {v.type?.toUpperCase() || 'VENUE'}
          </span>
        </div>
        <OccBar occ={v.occupancy} height={3} />
        <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginTop:12 }}>
          <div style={{ display:'flex', alignItems:'center', gap:8 }}>
            <div style={{
              width:28, height:28, borderRadius:'50%', background:grad,
              display:'flex', alignItems:'center', justifyContent:'center',
              fontSize:9, fontWeight:900, color:'#fff', flexShrink:0,
            }}>🎵</div>
            <div>
              <div style={{ fontSize:12, fontWeight:600, color:'#e8e0ff', lineHeight:1 }}>
                {v.tags?.[0] || v.type}
              </div>
              <div style={{ fontSize:9, color:'rgba(255,255,255,0.3)', marginTop:2, letterSpacing:'0.5px' }}>LIVE NOW</div>
            </div>
          </div>
          <div style={{ textAlign:'right' }}>
            <div style={{
              fontSize:15, fontWeight:800,
              color: v.isOpen ? '#30d158' : '#ff2d55',
              fontFamily:'Space Mono, monospace',
            }}>
              {v.isOpen ? 'OPEN' : 'CLOSED'}
            </div>
            <div style={{ fontSize:8, color:'rgba(255,255,255,0.25)', letterSpacing:'1px', marginTop:1 }}>STATUS</div>
          </div>
        </div>
      </div>
    </div>
  )
}

// ─── DETAIL PANEL ───────────────────────────────────────────────────────────
function DetailPanel({ v, onClose, CITIES }) {
  const live = useOsc(v.occupancy, 3, 2600)
  const c = heatColor(live)
  const [imgLoaded, setImgLoaded] = useState(false)

  const grad = v.grad || 'linear-gradient(135deg,#a855f7,#6366f1)'
  const img  = v.img  || `https://picsum.photos/seed/${v.name}/600/400`

  useEffect(() => {
    const h = e => { if (e.key === 'Escape') onClose() }
    window.addEventListener('keydown', h)
    return () => window.removeEventListener('keydown', h)
  }, [onClose])

  return (
    <div style={{
      height:'100%', display:'flex', flexDirection:'column',
      background:'#0a0814',
      borderLeft:'1px solid rgba(255,255,255,0.07)',
    }}>
      <div style={{ position:'relative', height:230, flexShrink:0, overflow:'hidden', background:'#1a1030' }}>
        {!imgLoaded && (
          <div style={{
            position:'absolute', inset:0, background:'linear-gradient(135deg,#1a1030,#0e0820)',
            display:'flex', alignItems:'center', justifyContent:'center',
          }}>
            <div style={{ fontSize:48, opacity:0.3 }}>🌃</div>
          </div>
        )}
        <img
          src={img} alt={v.name}
          onLoad={() => setImgLoaded(true)}
          style={{ width:'100%', height:'100%', objectFit:'cover', display:'block', opacity:imgLoaded?1:0, transition:'opacity 0.3s' }}
        />
        <div style={{ position:'absolute', inset:0, background:grad, opacity:0.3, mixBlendMode:'screen' }} />
        <div style={{ position:'absolute', inset:0, background:'linear-gradient(to bottom, rgba(0,0,0,0.1), rgba(10,8,20,1))' }} />
        <button onClick={onClose} style={{
          position:'absolute', top:14, right:14,
          width:34, height:34, borderRadius:'50%',
          background:'rgba(0,0,0,0.6)', backdropFilter:'blur(8px)',
          border:'1px solid rgba(255,255,255,0.15)',
          color:'#fff', fontSize:14, cursor:'pointer',
          display:'flex', alignItems:'center', justifyContent:'center',
          transition:'all 0.15s',
        }}
          onMouseEnter={e => e.currentTarget.style.background='rgba(255,45,85,0.8)'}
          onMouseLeave={e => e.currentTarget.style.background='rgba(0,0,0,0.6)'}
        >✕</button>
        <div style={{ position:'absolute', bottom:16, left:18, right:56 }}>
          <div style={{ fontSize:26, fontWeight:800, color:'#fff', letterSpacing:'-0.5px', lineHeight:1.1, textShadow:'0 2px 12px rgba(0,0,0,0.9)' }}>
            {v.name}
          </div>
          <div style={{ fontSize:11, color:'rgba(255,255,255,0.5)', marginTop:4 }}>{v.address} · {v.type}</div>
        </div>
      </div>

      <div style={{ flex:1, overflowY:'auto', padding:18, display:'flex', flexDirection:'column', gap:12 }}>
        <div style={{
          background:'rgba(255,255,255,0.04)',
          border:`1px solid ${c}30`,
          borderRadius:16, padding:16,
        }}>
          <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:8 }}>
            <span style={{ fontSize:9, letterSpacing:'3px', color:'rgba(255,255,255,0.3)', fontWeight:700 }}>LIVE OCCUPANCY</span>
            <div style={{ display:'flex', alignItems:'center', gap:6 }}>
              <Pulse color={c} size={7} />
              <span style={{ fontSize:9, color:c, fontWeight:700, letterSpacing:'1px' }}>{heatWord(live)}</span>
            </div>
          </div>
          <div style={{ display:'flex', alignItems:'baseline', gap:6, marginBottom:10 }}>
            <span style={{ fontSize:52, fontWeight:900, color:c, lineHeight:1, transition:'color 0.6s', fontFamily:'Space Mono, monospace' }}>{live}</span>
            <span style={{ fontSize:20, color:'rgba(255,255,255,0.25)' }}>%</span>
          </div>
          <OccBar occ={v.occupancy} height={5} />
        </div>

        <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:10 }}>
          {[
            { icon:'🎵', label:'TYPE',      val:v.type,    sub:'● LIVE NOW', subColor:'#ff2d55' },
            { icon:'📍', label:'ADDRESS',   val:v.address?.split(',')[0], sub:v.city?.toUpperCase(), subColor:'rgba(255,255,255,0.4)' },
            { icon:'⭐', label:'RATING',    val:`${v.rating}/5`, sub:'USER RATING', subColor:'#ff9f0a' },
            { icon:'🚦', label:'STATUS',    val:v.isOpen ? 'OPEN' : 'CLOSED', sub:v.isOpen ? 'WELCOMING' : 'SEE YOU TMRW', subColor:v.isOpen?'#30d158':'#ff2d55' },
          ].map(({ icon, label, val, sub, subColor }) => (
            <div key={label} style={{
              background:'rgba(255,255,255,0.03)',
              border:'1px solid rgba(255,255,255,0.07)',
              borderRadius:14, padding:14,
            }}>
              <div style={{ fontSize:20, marginBottom:6 }}>{icon}</div>
              <div style={{ fontSize:8, letterSpacing:'2px', color:'rgba(255,255,255,0.25)', marginBottom:5, fontWeight:600 }}>{label}</div>
              <div style={{ fontSize:14, fontWeight:700, color:'#fff', lineHeight:1.2 }}>{val}</div>
              <div style={{ fontSize:9, color:subColor, marginTop:3, letterSpacing:'0.5px' }}>{sub}</div>
            </div>
          ))}
        </div>

        {v.tags?.length > 0 && (
          <div style={{
            background:'rgba(255,255,255,0.03)',
            border:'1px solid rgba(255,255,255,0.07)',
            borderRadius:14, padding:14,
          }}>
            <div style={{ fontSize:9, letterSpacing:'2px', color:'rgba(255,255,255,0.25)', marginBottom:10, fontWeight:600 }}>🏷️ TAGS</div>
            <div style={{ display:'flex', gap:7, flexWrap:'wrap' }}>
              {v.tags.map(t => (
                <span key={t} style={{
                  fontSize:10, padding:'5px 11px', borderRadius:30,
                  background:'rgba(255,255,255,0.06)',
                  border:'1px solid rgba(255,255,255,0.1)',
                  color:'rgba(255,255,255,0.65)',
                }}>{t}</span>
              ))}
            </div>
          </div>
        )}

        <button style={{
          width:'100%', padding:15, borderRadius:14, border:'none',
          background:grad, color:'#fff',
          fontSize:14, fontWeight:800, letterSpacing:'1px', cursor:'pointer',
          boxShadow:'0 8px 24px rgba(0,0,0,0.4)',
          transition:'opacity 0.15s, transform 0.15s',
        }}
          onMouseEnter={e => { e.currentTarget.style.opacity='0.88'; e.currentTarget.style.transform='translateY(-1px)' }}
          onMouseLeave={e => { e.currentTarget.style.opacity='1'; e.currentTarget.style.transform='translateY(0)' }}
        >
          🎟️ RESERVE TABLE
        </button>
      </div>
    </div>
  )
}

// ─── APP ─────────────────────────────────────────────────────────────────────
export default function App() {
  const clock               = useClock()
  const [city, setCity]     = useState('')
  const [sel,  setSel]      = useState(null)
  const [q,    setQ]        = useState('')
  const [tab,  setTab]      = useState('all')
  const [CITIES, setCities] = useState([])
  const [VENUES, setVenues] = useState([])
  const [loading, setLoading] = useState(true)
  const [showAdmin, setShowAdmin] = useState(false)

  // Fetch cities on mount
  useEffect(() => {
    fetch(`${API}/cities`)
      .then(res => res.json())
      .then(data => {
        setCities(data)
        if (data.length > 0) setCity(data[0].slug)
      })
      .catch(err => console.error('Cities error:', err))
  }, [])

  // Fetch venues when city changes
  useEffect(() => {
    if (!city) return
    setLoading(true)
    fetch(`${API}/venues?city=${city}`)
      .then(res => res.json())
      .then(data => {
        setVenues(data)
        setLoading(false)
      })
      .catch(err => {
        console.error('Venues error:', err)
        setLoading(false)
      })
  }, [city])

  // Add new venue to state instantly
  const handleVenueAdded = (newVenue) => {
    if (newVenue.city === city) {
      setVenues(prev => [...prev, newVenue])
    }
  }

  // Delete venue
  const handleDelete = async (id) => {
    if (!window.confirm('Delete this venue?')) return
    try {
      await fetch(`${API}/venues/${id}`, { method: 'DELETE' })
      setVenues(prev => prev.filter(v => v._id !== id))
      if (sel?._id === id) setSel(null)
    } catch (err) {
      console.error('Delete error:', err)
    }
  }

  const list = VENUES.filter(v => {
    if (tab === 'busy') return v.occupancy >= 60
    if (tab === 'open') return v.isOpen
    return true
  }).filter(v =>
    !q ||
    v.name.toLowerCase().includes(q.toLowerCase()) ||
    v.type?.toLowerCase().includes(q.toLowerCase()) ||
    v.tags?.some(t => t.toLowerCase().includes(q.toLowerCase()))
  )

  const cityObj = CITIES.find(c => c.slug === city)
  const avgOcc  = list.length ? Math.round(list.reduce((a, v) => a + v.occupancy, 0) / list.length) : 0
  const panelOpen = !!sel

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@300;400;500;600;700;800&family=Space+Mono:wght@400;700&display=swap');

        *, *::before, *::after { margin:0; padding:0; box-sizing:border-box; }
        html, body, #root { height:100%; }
        body {
          background:#080612;
          color:#fff;
          font-family:'Plus Jakarta Sans', sans-serif;
          -webkit-font-smoothing:antialiased;
          overflow:hidden;
        }
        ::selection { background:#a855f7; color:#fff; }
        ::-webkit-scrollbar { width:4px; }
        ::-webkit-scrollbar-thumb { background:rgba(168,85,247,0.4); border-radius:2px; }
        button, input { font-family:inherit; }
        input { border:none; outline:none; background:none; color:#fff; }
        input::placeholder { color:rgba(255,255,255,0.2); }

        @keyframes ping {
          75%, 100% { transform:scale(2.2); opacity:0; }
        }
        @keyframes fadeUp {
          from { opacity:0; transform:translateY(20px) scale(0.97); }
          to   { opacity:1; transform:translateY(0)    scale(1);    }
        }
        @keyframes slideIn {
          from { opacity:0; transform:translateX(24px); }
          to   { opacity:1; transform:translateX(0);    }
        }
        @keyframes spin {
          to { transform:rotate(360deg); }
        }

        .card-in  { animation:fadeUp  0.38s cubic-bezier(0.34,1.2,0.64,1) both; }
        .panel-in { animation:slideIn 0.28s ease both; }

        .layout {
          display:grid;
          grid-template-columns:1fr ${panelOpen ? '380px' : '0px'};
          height:100vh;
          overflow:hidden;
          transition:grid-template-columns 0.3s cubic-bezier(0.4,0,0.2,1);
        }
        .main   { display:flex; flex-direction:column; overflow:hidden; min-width:0; }
        .scroller { flex:1; overflow-y:auto; overflow-x:hidden; }

        .topbar {
          height:54px; display:flex; align-items:center; gap:14px;
          padding:0 18px;
          border-bottom:1px solid rgba(255,255,255,0.07);
          background:rgba(8,6,18,0.92);
          backdrop-filter:blur(20px);
          flex-shrink:0; position:relative; z-index:20;
        }
        .logo-text {
          font-size:20px; font-weight:800; letter-spacing:'-0.3px'; flex-shrink:0;
          background:linear-gradient(135deg,#a855f7,#ec4899,#f97316);
          -webkit-background-clip:text; -webkit-text-fill-color:transparent;
          background-clip:text;
        }
        .searchbox {
          flex:1; max-width:300px;
          display:flex; align-items:center; gap:8px;
          background:rgba(255,255,255,0.05);
          border:1px solid rgba(255,255,255,0.09);
          border-radius:10px; padding:7px 13px;
          transition:border-color 0.15s;
        }
        .searchbox:focus-within { border-color:rgba(168,85,247,0.5); }
        .searchbox input { font-size:12px; flex:1; }

        .city-strip {
          display:flex; overflow-x:auto;
          border-bottom:1px solid rgba(255,255,255,0.07);
          flex-shrink:0; scrollbar-width:none;
        }
        .city-strip::-webkit-scrollbar { display:none; }
        .city-btn {
          padding:10px 18px; background:none; border:none;
          border-bottom:2px solid transparent;
          cursor:pointer; display:flex; flex-direction:column;
          align-items:flex-start; gap:2px;
          transition:all 0.15s; flex-shrink:0;
        }
        .city-btn.on { border-bottom-color:#a855f7; }
        .city-btn .cn {
          font-size:14px; font-weight:400; color:rgba(255,255,255,0.28);
          transition:all 0.15s;
        }
        .city-btn.on .cn { font-weight:700; color:#fff; }
        .city-btn .cc {
          font-size:8px; letter-spacing:2px;
          color:rgba(255,255,255,0.12);
          font-family:'Space Mono', monospace;
          transition:color 0.15s;
        }
        .city-btn.on .cc { color:rgba(168,85,247,0.7); }

        .hero-section {
          padding:22px 18px 16px;
          background:linear-gradient(180deg,rgba(168,85,247,0.07) 0%,transparent 100%);
          border-bottom:1px solid rgba(255,255,255,0.06);
          flex-shrink:0;
        }

        .filter-bar {
          display:flex; gap:8px; padding:10px 18px;
          border-bottom:1px solid rgba(255,255,255,0.06);
          flex-shrink:0; background:#080612;
        }
        .ftab {
          padding:6px 14px; border-radius:30px; border:none;
          font-size:11px; font-weight:600; cursor:pointer;
          color:rgba(255,255,255,0.35);
          border:1px solid rgba(255,255,255,0.08);
          background:none; transition:all 0.15s;
        }
        .ftab.on {
          background:rgba(168,85,247,0.14);
          border-color:rgba(168,85,247,0.4);
          color:#a855f7;
        }

        .grid {
          display:grid;
          grid-template-columns:repeat(auto-fill,minmax(255px,1fr));
          gap:16px; padding:18px;
        }

        @media(max-width:900px) {
          .layout { grid-template-columns:1fr !important; }
          .side   { display:none !important; }
        }
        @media(max-width:580px) {
          .grid { grid-template-columns:1fr 1fr; gap:12px; padding:12px; }
          .topbar { padding:0 12px; gap:10px; }
          .hero-section { padding:16px 14px 12px; }
        }
        @media(max-width:380px) {
          .grid { grid-template-columns:1fr; }
        }
      `}</style>

      <div className="layout">

        {/* ══ MAIN ══ */}
        <main className="main">

          {/* topbar */}
          <div className="topbar">
            <div className="logo-text">NightNova</div>

            <div className="searchbox">
              <span style={{ fontSize:13, color:'rgba(255,255,255,0.22)' }}>🔍</span>
              <input
                value={q}
                onChange={e => setQ(e.target.value)}
                placeholder="search venue, type, tag..."
              />
              {q && (
                <button onClick={() => setQ('')} style={{ background:'none', border:'none', cursor:'pointer', color:'rgba(255,255,255,0.3)', fontSize:11 }}>✕</button>
              )}
            </div>

            <div style={{ marginLeft:'auto', display:'flex', alignItems:'center', gap:10, flexShrink:0 }}>
              <button onClick={() => setShowAdmin(true)} style={{
                padding:'7px 14px', borderRadius:10, border:'none',
                background:'linear-gradient(135deg,#a855f7,#ec4899)',
                color:'#fff', fontSize:11, fontWeight:700,
                cursor:'pointer', flexShrink:0,
                boxShadow:'0 4px 12px rgba(168,85,247,0.4)',
              }}>
                + Add Venue
              </button>
              <Pulse color="#30d158" size={7} />
              <span style={{ fontSize:11, color:'rgba(255,255,255,0.35)', fontFamily:'Space Mono, monospace', letterSpacing:'0.5px' }}>
                {clock.toLocaleTimeString('en-IN', { hour:'2-digit', minute:'2-digit', hour12:true })}
              </span>
            </div>
          </div>

          {/* city strip */}
          <div className="city-strip">
            {CITIES.map(c => (
              <button
                key={c._id}
                className={`city-btn${city === c.slug ? ' on' : ''}`}
                onClick={() => { setCity(c.slug); setSel(null) }}
              >
                <span className="cn">{c.name}</span>
                <span className="cc">{c.slug?.toUpperCase()} · INDIA</span>
              </button>
            ))}
          </div>

          {/* hero */}
          <div className="hero-section">
            <div style={{ display:'flex', alignItems:'flex-end', justifyContent:'space-between', gap:12, flexWrap:'wrap' }}>
              <div>
                <div style={{ fontSize:10, letterSpacing:'4px', color:'rgba(168,85,247,0.7)', marginBottom:7, fontFamily:'Space Mono, monospace', fontWeight:700 }}>
                  TONIGHT IN
                </div>
                <h1 style={{ fontSize:'clamp(26px,4vw,42px)', fontWeight:800, letterSpacing:'-1px', lineHeight:1, color:'#fff' }}>
                  {cityObj?.name || '...'}
                </h1>
                <p style={{ fontSize:10, color:'rgba(255,255,255,0.3)', marginTop:7, fontFamily:'Space Mono, monospace', letterSpacing:'0.5px' }}>
                  {list.length} venues · {list.filter(v => v.isOpen).length} open now
                </p>
              </div>

              <div style={{ display:'flex', gap:8, flexWrap:'wrap' }}>
                {[
                  { label:'AVG OCC',    val:`${avgOcc}%`, bg:'rgba(168,85,247,0.1)', border:'rgba(168,85,247,0.25)', valColor:heatColor(avgOcc) },
                  { label:'OPEN NOW',   val:`${list.filter(v=>v.isOpen).length}`,    bg:'rgba(48,209,88,0.08)',  border:'rgba(48,209,88,0.2)',  valColor:'#30d158' },
                  { label:'ALMOST FULL',val:`${list.filter(v=>v.occupancy>=80).length}`, bg:'rgba(255,45,85,0.08)', border:'rgba(255,45,85,0.2)', valColor:'#ff2d55' },
                ].map(({ label, val, bg, border, valColor }) => (
                  <div key={label} style={{ padding:'8px 13px', borderRadius:12, background:bg, border:`1px solid ${border}` }}>
                    <div style={{ fontSize:8, letterSpacing:'2px', color:'rgba(255,255,255,0.3)', marginBottom:3, fontFamily:'Space Mono, monospace' }}>{label}</div>
                    <div style={{ fontSize:18, fontWeight:800, color:valColor }}>{val}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* filters */}
          <div className="filter-bar">
            {[['all','✦ All'],['open','✅ Open'],['busy','🔥 Busy']].map(([val, label]) => (
              <button key={val} className={`ftab${tab === val ? ' on' : ''}`} onClick={() => setTab(val)}>
                {label}
              </button>
            ))}
          </div>

          {/* grid */}
          <div className="scroller">
            {loading ? (
              <div style={{ padding:'64px 20px', textAlign:'center' }}>
                <div style={{
                  width:32, height:32, borderRadius:'50%',
                  border:'3px solid rgba(168,85,247,0.2)',
                  borderTopColor:'#a855f7',
                  animation:'spin 0.8s linear infinite',
                  margin:'0 auto 16px',
                }} />
                <div style={{ fontSize:13, color:'rgba(255,255,255,0.3)' }}>Loading venues...</div>
              </div>
            ) : list.length === 0 ? (
              <div style={{ padding:'64px 20px', textAlign:'center' }}>
                <div style={{ fontSize:40, marginBottom:14, opacity:0.4 }}>🔍</div>
                <div style={{ fontSize:14, color:'rgba(255,255,255,0.3)', fontWeight:600 }}>Nothing here tonight</div>
                <div style={{ fontSize:11, color:'rgba(255,255,255,0.15)', marginTop:6 }}>Try a different city or filter</div>
              </div>
            ) : (
              <div className="grid">
                {list.map((v, i) => (
                  <div key={v._id} className="card-in" style={{ animationDelay:`${i * 0.055}s` }}>
                    <VenueCard
                      v={v}
                      onClick={venue => setSel(sel?._id === venue._id ? null : venue)}
                      active={sel?._id === v._id}
                      onDelete={handleDelete}
                    />
                  </div>
                ))}
              </div>
            )}

            <div style={{ padding:'14px 18px', borderTop:'1px solid rgba(255,255,255,0.05)', display:'flex', justifyContent:'space-between', alignItems:'center' }}>
              <span style={{
                fontSize:15, fontWeight:800,
                background:'linear-gradient(135deg,#a855f7,#ec4899)',
                WebkitBackgroundClip:'text', WebkitTextFillColor:'transparent',
              }}>NightNova</span>
              <span style={{ fontSize:8, letterSpacing:'3px', color:'rgba(255,255,255,0.1)', fontFamily:'Space Mono, monospace' }}>
                DAY 04/30 · DELHI NCR
              </span>
            </div>
          </div>

        </main>

        {/* ══ SIDE PANEL ══ */}
        {sel && (
          <div className="side panel-in" style={{ overflow:'hidden', minWidth:0 }}>
            <DetailPanel v={sel} onClose={() => setSel(null)} CITIES={CITIES} />
          </div>
        )}

      </div>

      {/* ══ ADMIN PANEL ══ */}
      {showAdmin && (
        <AdminPanel
          onVenueAdded={handleVenueAdded}
          onClose={() => setShowAdmin(false)}
        />
      )}
    </>
  )
}
