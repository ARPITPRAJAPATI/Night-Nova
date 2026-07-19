import { useState, useEffect } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { ArrowLeft, MapPin, Calendar, Clock, ShieldAlert, Award, Star, Compass, Flame, Info } from 'lucide-react'
import { API } from '../config'
import { useAuth } from '../hooks/useAuth'
import BookingModal from '../components/BookingModal'

export default function EventDetail() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { user } = useAuth()
  const [event, setEvent] = useState(null)
  const [loading, setLoading] = useState(true)
  const [showBooking, setShowBooking] = useState(false)
  const [liked, setLiked] = useState(false)
  const [likesCount, setLikesCount] = useState(0)
  const [timeRemaining, setTimeRemaining] = useState('')

  // 1. Fetch Event Details
  useEffect(() => {
    setLoading(true)
    fetch(`${API}/events/${id}`)
      .then(res => {
        if (!res.ok) throw new Error('Event not found')
        return res.json()
      })
      .then(data => {
        setEvent(data)
        setLikesCount(data.likes?.length || 0)
        if (user && data.likes?.includes(user.id || user._id)) {
          setLiked(true)
        }
        setLoading(false)
      })
      .catch(err => {
        console.error(err)
        setLoading(false)
      })
  }, [id, user])

  // 2. Countdown logic
  useEffect(() => {
    if (!event) return
    const interval = setInterval(() => {
      const start = new Date(event.startDate).getTime()
      const now = new Date().getTime()
      const diff = start - now

      if (diff <= 0) {
        setTimeRemaining('Live Now / Concluded')
        clearInterval(interval)
        return
      }

      const days = Math.floor(diff / (1000 * 60 * 60 * 24))
      const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60))
      const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60))
      const seconds = Math.floor((diff % (1000 * 60)) / 1000)

      setTimeRemaining(`${days}d ${hours}h ${minutes}m ${seconds}s`)
    }, 1000)

    return () => clearInterval(interval)
  }, [event])

  // 3. Leaflet Map setup
  useEffect(() => {
    if (event?.venueId?.location?.coordinates && window.L) {
      const [lng, lat] = event.venueId.location.coordinates
      const map = window.L.map('event-leaflet-map', { zoomControl: false }).setView([lat, lng], 14)
      
      window.L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; OpenStreetMap contributors'
      }).addTo(map)

      const marker = window.L.marker([lat, lng]).addTo(map)
      marker.bindPopup(`<b>${event.venueId.name}</b><br>${event.venueId.address}`).openPopup()

      return () => map.remove()
    }
  }, [event])

  // 4. Toggle Like
  const handleLike = async () => {
    if (!user) {
      navigate('/auth')
      return
    }
    try {
      const token = localStorage.getItem('nn_token')
      const res = await fetch(`${API}/events/${id}/like`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` }
      })
      const data = await res.json()
      setLiked(data.liked)
      setLikesCount(data.likesCount)
    } catch (err) {
      console.error(err)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-brand-dark flex items-center justify-center">
        <div className="w-12 h-12 border-4 border-white/10 border-t-brand-accent rounded-full animate-spin" />
      </div>
    )
  }

  if (!event) {
    return (
      <div className="min-h-screen bg-brand-dark text-white flex flex-col items-center justify-center p-6">
        <Compass size={48} className="text-white/20 mb-4 animate-spin" />
        <h2 className="text-2xl font-bold uppercase tracking-widest mb-2">Signal Lost</h2>
        <p className="text-white/50 text-xs mb-8">This event does not exist on our grid network.</p>
        <Link to="/explore" className="bg-white text-black font-bold uppercase tracking-[0.2em] text-[10px] px-8 py-4">Back to explore</Link>
      </div>
    )
  }

  return (
    <div className="bg-brand-dark min-h-screen pb-24 text-white">
      {/* Cover Image & Header Hero */}
      <div className="relative h-[60vh] w-full bg-black overflow-hidden border-b border-white/15">
        <img src={event.coverImage} className="w-full h-full object-cover opacity-50 grayscale hover:grayscale-0 transition-all duration-700 scale-105" alt={event.title} />
        <div className="absolute inset-0 bg-gradient-to-t from-black via-black/30 to-transparent" />

        <button
          onClick={() => navigate(-1)}
          className="absolute top-24 left-6 sm:left-10 w-12 h-12 rounded-full glass hover:bg-white/10 transition-all flex items-center justify-center z-20 border border-white/10"
        >
          <ArrowLeft className="text-white" size={20} />
        </button>

        <motion.div
          initial={{ y: 30, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          className="absolute bottom-0 left-0 right-0 px-6 sm:px-10 pb-12 max-w-7xl mx-auto"
        >
          <div className="flex flex-wrap items-end justify-between gap-6">
            <div className="flex-1 min-w-[280px]">
              <div className="flex gap-2 mb-5">
                <span className="px-3 py-1 bg-white/10 backdrop-blur-md border border-white/15 text-[9px] font-bold uppercase tracking-widest text-white">
                  {event.category}
                </span>
                {event.moods?.map(m => (
                  <span key={m} className="px-3 py-1 bg-brand-accent/20 backdrop-blur-md border border-brand-accent/30 text-[9px] font-bold uppercase tracking-widest text-brand-light">
                    {m}
                  </span>
                ))}
              </div>
              <h1 className="text-4xl sm:text-6xl md:text-7xl font-black tracking-tighter uppercase leading-none mb-3">
                {event.title}
              </h1>
              <div className="flex items-center gap-2 text-white/50 text-xs sm:text-sm font-medium">
                <MapPin size={16} className="text-brand-accent shrink-0" />
                <Link to={`/venue/${event.venueId?._id}`} className="hover:underline hover:text-white transition-all uppercase">
                  {event.venueId?.name} — {event.venueId?.city}
                </Link>
              </div>
            </div>

            {/* Like and Actions */}
            <div className="flex gap-3">
              <button 
                onClick={handleLike}
                className={`w-14 h-14 rounded-none border flex items-center justify-center transition-all ${
                  liked 
                    ? 'bg-red-500 border-red-500 text-white' 
                    : 'bg-black/50 border-white/15 text-white/60 hover:text-white hover:border-white'
                }`}
              >
                <Flame size={20} fill={liked ? 'currentColor' : 'none'} />
              </button>
              <div className="border border-white/15 px-5 h-14 flex flex-col justify-center items-center bg-black/50 min-w-20">
                <span className="text-[8px] font-mono text-white/40 uppercase">Flame rating</span>
                <span className="text-lg font-bold font-mono text-white">{likesCount}</span>
              </div>
            </div>
          </div>
        </motion.div>
      </div>

      <div className="max-w-7xl mx-auto px-6 sm:px-10 mt-12 grid lg:grid-cols-3 gap-10">
        
        {/* Main Details Panel */}
        <div className="lg:col-span-2 space-y-10">
          
          {/* Countdown & Timing Info */}
          <div className="glass p-8 rounded-[2rem] border border-white/5 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-6">
            <div>
              <div className="text-[9px] uppercase tracking-[0.25em] font-mono text-white/40 mb-2">Countdown Signal</div>
              <div className="text-2xl sm:text-3xl font-bold font-mono tracking-tight text-white">{timeRemaining}</div>
            </div>
            
            <div className="flex flex-col gap-2 border-l border-white/10 pl-6 sm:h-12 justify-center">
              <div className="flex items-center gap-2 text-xs text-white/70">
                <Calendar size={14} className="text-brand-neon" />
                <span>{new Date(event.startDate).toLocaleDateString('en-IN', { weekday: 'short', day: 'numeric', month: 'short', year: 'numeric' })}</span>
              </div>
              <div className="flex items-center gap-2 text-xs text-white/70">
                <Clock size={14} className="text-brand-neon" />
                <span>{new Date(event.startDate).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} onwards</span>
              </div>
            </div>
          </div>

          {/* Intel Description */}
          <div className="glass p-8 sm:p-12 rounded-[2rem] border border-white/5 space-y-8">
            <div>
              <h3 className="text-[10px] uppercase tracking-[0.25em] font-mono text-white/40 mb-3">Event Brief</h3>
              <p className="text-white/80 text-sm sm:text-base leading-relaxed">{event.description}</p>
            </div>

            {event.tags && event.tags.length > 0 && (
              <div>
                <h3 className="text-[10px] uppercase tracking-[0.25em] font-mono text-white/40 mb-3">Atmospheric Tags</h3>
                <div className="flex flex-wrap gap-2">
                  {event.tags.map(tag => (
                    <span key={tag} className="px-3 py-1 bg-white/5 border border-white/10 text-xs text-white/60">
                      #{tag}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Venue & Mapping Panel */}
          <div className="glass p-8 sm:p-12 rounded-[2rem] border border-white/5 space-y-8">
            <div>
              <h3 className="text-[10px] uppercase tracking-[0.25em] font-mono text-white/40 mb-3">Physical Location</h3>
              <h4 className="text-2xl font-bold uppercase">{event.venueId?.name}</h4>
              <p className="text-white/50 text-xs mt-1">{event.venueId?.address}</p>
            </div>
            
            {/* Map Container */}
            <div 
              id="event-leaflet-map" 
              className="h-64 border border-white/10 bg-black/50 z-10" 
              style={{ minHeight: '260px' }}
            />
          </div>

          {/* Rules & Policy Accordions */}
          <div className="glass p-8 sm:p-12 rounded-[2rem] border border-white/5 space-y-8">
            <h3 className="text-[10px] uppercase tracking-[0.25em] font-mono text-white/40 border-b border-white/10 pb-4">House Guidelines</h3>
            
            <div className="grid md:grid-cols-2 gap-6 text-xs leading-relaxed">
              <div className="space-y-1">
                <div className="font-bold text-white/60 uppercase">Entry Protocol</div>
                <p className="text-white/50">{event.entryRules}</p>
              </div>
              
              <div className="space-y-1">
                <div className="font-bold text-white/60 uppercase">Safety & Surveillance</div>
                <p className="text-white/50">{event.safetyNotes}</p>
              </div>

              <div className="space-y-1">
                <div className="font-bold text-white/60 uppercase">Dress Standard</div>
                <p className="text-white/50">{event.dressCode}</p>
              </div>

              <div className="space-y-1">
                <div className="font-bold text-white/60 uppercase">Age Minimum</div>
                <p className="text-white/50">Must be at least {event.ageRestriction}+ years of age with active credentials.</p>
              </div>

              <div className="space-y-1">
                <div className="font-bold text-white/60 uppercase">Food & Drink Info</div>
                <p className="text-white/50">F&B status: {event.foodInfo}. Alcohol: {event.alcoholInfo}.</p>
              </div>

              <div className="space-y-1">
                <div className="font-bold text-white/60 uppercase">Refund & Cancellation</div>
                <p className="text-white/50">{event.refundPolicy}</p>
              </div>
            </div>
          </div>

        </div>

        {/* Sticky Ticket Reservation Panel */}
        <div className="lg:col-span-1">
          <div className="glass p-8 sm:p-10 rounded-[2rem] border border-white/5 sticky top-28 shadow-2xl space-y-8">
            <div className="text-center pb-6 border-b border-white/10">
              <h3 className="text-2xl font-bold uppercase tracking-tight mb-2">Gate Access</h3>
              <p className="text-xs text-white/40">Secure your passes using the options below.</p>
            </div>

            {event.bookingModel === 'external' ? (
              <div className="space-y-4">
                <div className="flex gap-3 bg-white/5 border border-white/5 p-4 items-center">
                  <Info size={16} className="text-brand-accent shrink-0" />
                  <span className="text-[10px] font-mono text-white/50 uppercase leading-normal">This event uses partner listings. Checkout redirect active.</span>
                </div>
                <a 
                  href={event.externalBookingUrl || '#'}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full bg-white text-black hover:bg-white/80 transition-all font-bold uppercase tracking-[0.2em] text-[10px] py-5 block text-center border border-white"
                >
                  Buy via Partner
                </a>
              </div>
            ) : (
              <div className="space-y-6">
                <div>
                  <label className="text-[9px] font-mono uppercase tracking-widest text-white/30 block mb-3">TICKET TIERS</label>
                  <div className="space-y-2">
                    {event.ticketTypes?.map(tier => (
                      <div key={tier.name} className="border border-white/10 bg-black/40 p-4 flex justify-between items-center text-xs">
                        <div>
                          <div className="font-bold text-white uppercase">{tier.name}</div>
                          <div className="text-[9px] font-mono text-white/40 mt-1 uppercase">Capacity: {tier.capacity - tier.sold} remaining</div>
                        </div>
                        <div className="font-bold text-white font-mono">
                          {tier.price === 0 ? 'FREE' : `₹${tier.price}`}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <button
                  onClick={() => setShowBooking(true)}
                  className="w-full bg-white text-black hover:bg-white/80 transition-all font-bold uppercase tracking-[0.2em] text-[10px] py-5 border border-white"
                >
                  {event.bookingModel === 'paid' ? 'Proceed to Checkout' : 'Claim Free Pass'}
                </button>
              </div>
            )}

            <div className="pt-4 border-t border-white/10 text-center font-mono text-[9px] text-white/30 uppercase tracking-widest flex items-center justify-center gap-2">
              <Award size={12} className="text-brand-accent" />
              Verified Event Host
            </div>
          </div>
        </div>

      </div>

      <AnimatePresence>
        {showBooking && (
          <BookingModal event={event} onClose={() => setShowBooking(false)} />
        )}
      </AnimatePresence>
    </div>
  )
}
