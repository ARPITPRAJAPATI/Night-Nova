import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { ArrowLeft, Phone, Globe, Instagram, Clock, Users, Ticket, Shirt, Banknote } from 'lucide-react'
import { API } from '../config'
import StatusDot from '../components/StatusDot'
import OccBar from '../components/OccBar'
import { useOsc } from '../hooks/useOsc'
import { heatColor } from '../utils/heat'
import BookingModal from '../components/BookingModal'
import { AnimatePresence } from 'framer-motion'

export default function VenueDetail() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [venue, setVenue] = useState(null)
  const [showBooking, setShowBooking] = useState(false)
  
  const live = useOsc(venue?.occupancy || 0, 3, 2600)
  const c = heatColor(live)

  useEffect(() => {
    fetch(`${API}/venues`)
      .then(res => res.json())
      .then(data => {
        const found = data.find(v => String(v._id) === String(id))
        setVenue(found)
      })
  }, [id])

  if (!venue) {
    return (
      <div className="min-h-screen bg-brand-dark flex items-center justify-center">
        <div className="w-12 h-12 border-4 border-white/10 border-t-brand-accent rounded-full animate-spin shadow-[0_0_30px_rgba(124,58,237,0.5)]" />
      </div>
    )
  }

  const img = venue.img || `https://picsum.photos/seed/${venue.name}/1200/600`

  const infoItems = [
    { icon: <Clock size={16} />, label: 'Hours', val: `${venue.openTime || '9PM'} - ${venue.closeTime || '4AM'}` },
    { icon: <Users size={16} />, label: 'Capacity', val: venue.capacity || '500+' },
    { icon: <Ticket size={16} />, label: 'Entry', val: venue.entryFee ? `₹${venue.entryFee}` : 'Free' },
    { icon: <Shirt size={16} />, label: 'Dress Code', val: venue.dressCode || 'Smart Casual' },
    { icon: <Banknote size={16} />, label: 'Pricing', val: venue.priceRange || '₹₹' },
  ]

  return (
    <div className="bg-brand-dark min-h-screen pb-24">
      <div className="relative h-[65vh] w-full bg-black overflow-hidden border-b border-white/20">
        <video 
          autoPlay 
          loop 
          muted 
          playsInline
          className="w-full h-full object-cover opacity-50 grayscale scale-105"
        >
          <source src="/venue.mp4" type="video/mp4" />
        </video>
        <div className="absolute inset-0 bg-gradient-to-t from-black via-black/40 to-transparent" />
        
        <button 
          onClick={() => navigate(-1)}
          className="absolute top-24 left-6 sm:left-10 w-12 h-12 rounded-full glass hover:bg-white/10 transition-all flex items-center justify-center z-20 border border-white/10"
        >
          <ArrowLeft className="text-white" size={20} />
        </button>

        <motion.div 
          initial={{ y: 50, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          className="absolute bottom-0 left-0 right-0 px-6 sm:px-10 pb-12 max-w-7xl mx-auto"
        >
          <div className="flex flex-wrap items-end justify-between gap-6">
            <div>
              <div className="flex gap-3 mb-5">
                <span className="px-3 py-1.5 rounded-full text-[10px] font-bold uppercase tracking-widest bg-white/10 backdrop-blur-md border border-white/10 text-white">
                  {venue.type}
                </span>
                <span className={`px-3 py-1.5 rounded-full text-[10px] font-bold uppercase tracking-widest border glass ${venue.isOpen ? 'text-brand-neon border-brand-neon/30' : 'text-red-500 border-red-500/30'}`}>
                  {venue.isOpen ? '● OPEN NOW' : '○ CLOSED'}
                </span>
              </div>
              <h1 className="text-4xl sm:text-6xl md:text-8xl font-bold tracking-tighter text-white mb-2">{venue.name}</h1>
              <p className="text-sm md:text-xl text-white/50 font-medium">{venue.address}</p>
            </div>
            
            <div className="flex gap-4 mb-2">
              {[
                { icon: <Phone size={20} />, href: venue.phone ? `tel:${venue.phone}` : null },
                { icon: <Globe size={20} />, href: venue.website },
                { icon: <Instagram size={20} />, href: venue.instagram },
              ].map((item, i) => item.href && (
                <a 
                  key={i}
                  href={item.href}
                  target="_blank"
                  rel="noreferrer"
                  className="w-14 h-14 rounded-2xl glass flex items-center justify-center text-white/60 hover:text-brand-accent hover:border-brand-accent/50 transition-all active:scale-95 border border-white/5"
                >
                  {item.icon}
                </a>
              ))}
            </div>
          </div>
        </motion.div>
      </div>

      <div className="max-w-7xl mx-auto px-6 sm:px-10 mt-12 grid lg:grid-cols-3 gap-10">
        
        <div className="lg:col-span-2 flex flex-col gap-10">
          {/* Live Status Card */}
          <div className="glass p-8 md:p-12 rounded-[2.5rem] border border-white/5 relative overflow-hidden group">
            <div className="absolute -inset-20 opacity-10 pointer-events-none blur-[100px] rounded-full group-hover:opacity-20 transition-opacity duration-1000" style={{ background: c }} />
            
            <div className="flex justify-between items-start mb-12 relative z-10">
              <div>
                <h3 className="text-[10px] uppercase tracking-[0.25em] font-bold text-white/40 mb-2">Current Energy Pulse</h3>
                <div className="flex items-end gap-3">
                  <span className="text-6xl sm:text-8xl md:text-9xl font-mono font-bold leading-none tracking-tighter" style={{ color: c }}>{live}</span>
                  <span className="text-lg sm:text-2xl text-white/20 font-mono mb-4 uppercase tracking-tighter font-bold">% cap</span>
                </div>
              </div>
              <div className="flex flex-col items-end gap-2">
                <div className="flex items-center gap-3 bg-white/5 border border-white/5 px-4 py-2 rounded-full">
                  <StatusDot color={c} />
                  <span className="text-[10px] font-bold text-white/60 tracking-widest uppercase">Live Scan</span>
                </div>
              </div>
            </div>
            
            <div className="relative z-10 space-y-4">
               <OccBar occ={venue.occupancy} height={8} />
               <div className="flex justify-between items-center text-[10px] font-bold tracking-widest text-white/20 uppercase">
                 <span>Entrance</span>
                 <span>Peak Energy</span>
               </div>
            </div>
          </div>

          {/* Info Grid */}
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
            {infoItems.map((item, i) => (
              <div key={i} className="glass p-6 rounded-3xl border border-white/5 flex flex-col items-center text-center gap-3 group hover:border-white/10 transition-colors">
                <div className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center text-white/30 group-hover:text-brand-accent transition-colors">
                  {item.icon}
                </div>
                <div>
                  <div className="text-[9px] font-bold text-white/30 uppercase tracking-widest mb-1">{item.label}</div>
                  <div className="text-xs text-white/80 font-bold tracking-tight">{item.val}</div>
                </div>
              </div>
            ))}
          </div>

          {/* Atmosphere */}
          <div className="glass p-8 md:p-12 rounded-[2.5rem] border border-white/5">
             <h3 className="text-[10px] uppercase tracking-[0.25em] font-bold text-white/40 mb-8">Atmosphere & Vibe</h3>
             <div className="flex flex-wrap gap-3">
               {venue.tags?.map(t => (
                 <span key={t} className="px-6 py-3 rounded-2xl bg-white/5 border border-white/5 text-sm text-white/80 font-bold hover:bg-white/10 hover:border-white/20 transition-all cursor-default">
                   {t}
                 </span>
               ))}
             </div>
          </div>
        </div>

        {/* Sidebar */}
        <div className="lg:col-span-1">
          <div className="glass p-10 rounded-[2.5rem] border border-white/5 sticky top-32 shadow-2xl">
            <div className="mb-10 text-center">
              <h3 className="text-3xl font-bold text-white tracking-tight mb-2">Book VIP</h3>
              <p className="text-sm text-white/40 font-medium leading-relaxed px-4">Guaranteed entry, dedicated host, and the best tables in the house.</p>
            </div>

            <div className="space-y-4">
              <button 
                onClick={() => setShowBooking(true)}
                className="w-full bg-white text-black hover:bg-white/80 transition-all font-bold uppercase tracking-[0.2em] text-[10px] py-6 rounded-none border border-white"
              >
                Request Table
              </button>
              
              <button className="w-full bg-black hover:bg-white hover:text-black transition-all text-white font-bold uppercase tracking-[0.2em] text-[10px] py-6 rounded-none border border-white/20">
                Join Guestlist
              </button>
            </div>

            <div className="mt-10 pt-10 border-t border-white/20 space-y-3">
              <div className="flex justify-between items-center text-[10px] font-bold tracking-widest text-white/50 uppercase font-mono">
                <span>Min. Spend</span>
                <span className="text-white">₹15k - ₹50k</span>
              </div>
              <div className="flex justify-between items-center text-[10px] font-bold tracking-widest text-white/50 uppercase font-mono">
                <span>Entry Scan</span>
                <span className="text-white">Fast-Track included</span>
              </div>
            </div>
          </div>
        </div>

      </div>

      <AnimatePresence>
        {showBooking && (
          <BookingModal venue={venue} onClose={() => setShowBooking(false)} />
        )}
      </AnimatePresence>
    </div>
  )
}
