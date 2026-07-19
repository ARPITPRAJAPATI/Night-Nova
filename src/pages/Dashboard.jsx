import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Calendar, Users, MapPin, Search, Plus, Award, Compass, Gift, QrCode, RefreshCw, X, ShieldCheck } from 'lucide-react'
import { API } from '../config'
import { useAuth } from '../hooks/useAuth'
import { Link, useNavigate } from 'react-router-dom'
import AdminPanel from '../AdminPanel'
import BookingsTable from '../components/BookingsTable'

export default function Dashboard() {
  const { user } = useAuth()
  
  if (!user) return null

  // Route based on role
  if (user.role === 'owner' || user.role === 'admin') {
    return <OwnerDashboard user={user} />
  }
  return <CustomerDashboard user={user} />
}

function CustomerDashboard({ user }) {
  const [bookings, setBookings] = useState([])
  const [rewards, setRewards] = useState({ balance: 250, transactions: [] })
  const [loading, setLoading] = useState(true)
  const [activeTicket, setActiveTicket] = useState(null) // Ticket model popup state
  const [expandedBookingId, setExpandedBookingId] = useState(null)
  
  const userId = user.id || user._id

  useEffect(() => {
    const fetchBookings = async () => {
      try {
        const token = localStorage.getItem('nn_token')
        const res = await fetch(`${API}/bookings/my`, { headers: { Authorization: `Bearer ${token}` } })
        const data = await res.json()
        setBookings(data)
      } catch (err) {} finally { setLoading(false) }
    }

    const fetchRewards = async () => {
      try {
        const token = localStorage.getItem('nn_token')
        const res = await fetch(`${API}/rewards/my`, { headers: { Authorization: `Bearer ${token}` } })
        if (res.ok) {
          const data = await res.json()
          setRewards(data)
        }
      } catch (err) {}
    }

    fetchBookings()
    fetchRewards()
  }, [])

  // Referrals
  const referralLink = `${window.location.origin}/auth?ref=${userId}`
  const [copied, setCopied] = useState(false)
  const copyLink = () => {
    navigator.clipboard.writeText(referralLink)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  // Fictional Badges
  const mockBadges = [
    { title: 'First Night', icon: '🦉', desc: 'Booked first event' },
    { title: 'Night Owl', icon: '🌌', desc: 'Attended after 11 PM' },
    { title: 'City Explorer', icon: '🗺️', desc: 'Visited 2+ active cities' }
  ]

  return (
    <div className="min-h-screen bg-black pt-32 pb-24 px-6 sm:px-10 relative overflow-hidden text-white">
      {/* Decorative grids */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(124,58,237,0.1),rgba(0,0,0,0))] pointer-events-none z-0" />

      <div className="max-w-6xl mx-auto relative z-10 grid lg:grid-cols-3 gap-10">
        
        {/* Left Column: Profile Card, Rewards, and Badges */}
        <div className="lg:col-span-1 space-y-8">
          {/* Profile Card */}
          <div className="border border-white/10 bg-white/[0.01] p-8 text-center space-y-4">
            <div className="w-20 h-20 bg-white text-black mx-auto flex items-center justify-center font-bold text-2xl">
              {user.name?.charAt(0).toUpperCase()}
            </div>
            <div>
              <h2 className="text-xl font-bold uppercase">{user.name}</h2>
              <span className="text-[9px] font-mono text-white/40 uppercase tracking-widest block mt-1">{user.role} Identity verified</span>
            </div>
          </div>

          {/* Reward Points */}
          <div className="border border-white/10 bg-white/[0.01] p-8 space-y-4">
            <div className="flex justify-between items-center pb-3 border-b border-white/10">
              <span className="text-[10px] font-bold uppercase tracking-widest text-white/50">Loyalty Balance</span>
              <Gift size={16} className="text-brand-accent" />
            </div>
            <div className="flex items-baseline gap-2">
              <span className="text-5xl font-bold font-mono text-white">{rewards.balance}</span>
              <span className="text-[10px] font-mono text-white/40 uppercase">points</span>
            </div>
            <p className="text-[10px] text-white/40 leading-relaxed uppercase font-mono">Earn 50 pts per booking, 100 pts per referral.</p>
          </div>

          {/* Unlocked Badges */}
          <div className="border border-white/10 bg-white/[0.01] p-8 space-y-4">
            <span className="text-[10px] font-bold uppercase tracking-widest text-white/50 block pb-3 border-b border-white/10">Unlocked Milestones</span>
            <div className="grid grid-cols-3 gap-2">
              {mockBadges.map((badge, idx) => (
                <div key={idx} className="border border-white/10 p-3 text-center bg-black/40 group relative cursor-default" title={badge.desc}>
                  <div className="text-xl mb-1">{badge.icon}</div>
                  <div className="text-[8px] font-bold uppercase tracking-wider text-white truncate">{badge.title}</div>
                  
                  {/* Tooltip */}
                  <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 bg-neutral-900 border border-white/10 text-[9px] p-2 text-white opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none w-28 uppercase font-mono">
                    {badge.desc}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Referrals */}
          <div className="border border-white/10 bg-white/[0.01] p-8 space-y-4">
            <span className="text-[10px] font-bold uppercase tracking-widest text-white/50 block pb-3 border-b border-white/10">Invite & Earn</span>
            <p className="text-[10px] text-white/50 leading-relaxed uppercase font-mono">Share your override code. Earn 100 points when your friends attend their first event.</p>
            <div className="flex border border-white/20 p-1 bg-black/60">
              <input 
                type="text" 
                value={referralLink} 
                readOnly
                className="flex-1 bg-transparent px-3 py-2 text-[9px] font-mono text-white/60 focus:outline-none"
              />
              <button 
                onClick={copyLink} 
                className="bg-white text-black px-4 py-2 font-bold text-[9px] uppercase tracking-widest"
              >
                {copied ? 'Copied' : 'Copy'}
              </button>
            </div>
          </div>
        </div>

        {/* Right Column: Bookings and History */}
        <div className="lg:col-span-2 space-y-8">
          <h2 className="text-2xl font-bold uppercase tracking-wider">Your Scheduled Passes</h2>

          {loading ? (
            <div className="space-y-4">
              {[1, 2].map(i => <div key={i} className="h-44 bg-white/5 border border-white/10 animate-pulse" />)}
            </div>
          ) : bookings.length === 0 ? (
            <div className="border border-white/10 p-16 text-center bg-white/[0.01]">
              <Search className="mx-auto text-white/20 mb-4 animate-pulse" size={32} />
              <h3 className="text-xl font-bold uppercase mb-2">No active bookings</h3>
              <p className="text-white/50 text-xs uppercase font-mono tracking-widest mb-6">Explore the grid to schedule your next night out.</p>
              <Link to="/explore" className="bg-white text-black px-6 py-4 font-bold uppercase tracking-widest text-[9px] hover:bg-white/80 border border-white">Explore Experiences</Link>
            </div>
          ) : (
            <div className="space-y-4">
              {bookings.map(booking => {
                const isEvent = !!booking.eventId
                const name = isEvent ? booking.eventId?.title : booking.venueId?.name
                const img = isEvent ? booking.eventId?.coverImage : booking.venueId?.img
                const city = isEvent ? booking.venueId?.city : booking.venueId?.city
                
                const isExpanded = expandedBookingId === booking._id
                const sub = booking.totalAmount || 0
                const fee = Math.round(sub * 0.05)
                const tax = Math.round((sub + fee) * 0.18)
                const total = sub + fee + tax

                return (
                  <div key={booking._id} className="border border-white/10 bg-white/[0.01] p-6 flex flex-col gap-4">
                    <div className="flex flex-col sm:flex-row gap-6 justify-between items-start sm:items-center w-full">
                      <div className="flex gap-4 items-center">
                        <img src={img} className="w-16 h-16 object-cover border border-white/10 grayscale" alt={name} />
                        <div>
                          <span className="text-[8px] font-mono text-brand-accent uppercase tracking-widest block">{isEvent ? 'Event Ticket' : 'Venue Table Reservation'}</span>
                          <h4 className="text-base font-bold uppercase tracking-tight text-white mt-0.5">{name}</h4>
                          <div className="flex items-center gap-1.5 text-white/40 text-[9px] uppercase font-mono mt-1">
                            <MapPin size={10} /> {city} — {new Date(booking.date).toLocaleDateString()}
                          </div>
                        </div>
                      </div>

                      <div className="flex sm:flex-col items-start sm:items-end gap-2 w-full sm:w-auto border-t sm:border-t-0 border-white/5 pt-4 sm:pt-0 justify-between">
                        <div className="flex gap-2 items-center">
                          <span className={`px-2.5 py-1 text-[8px] font-bold uppercase tracking-wider ${
                            booking.paymentStatus === 'successful' ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30' : 'bg-amber-500/20 text-amber-400 border border-amber-500/30'
                          }`}>
                            {booking.paymentStatus === 'successful' ? 'PAID' : 'PENDING'}
                          </span>
                          <span className="text-[10px] font-mono font-bold text-white uppercase">{booking.guests} {booking.guests > 1 ? 'PASSES' : 'PASS'}</span>
                        </div>
                        
                        <div className="flex gap-2">
                          <button
                            onClick={() => setExpandedBookingId(isExpanded ? null : booking._id)}
                            className="px-4 py-2 border border-white/10 hover:border-white text-[9px] font-bold uppercase tracking-widest bg-black/30 text-white/60 hover:text-white"
                          >
                            {isExpanded ? 'Hide Bill' : 'View Receipt'}
                          </button>
                          
                          {/* Ticket QR Action */}
                          {isEvent && (
                            <button
                              onClick={() => setActiveTicket(booking)}
                              className="px-4 py-2 border border-white/10 hover:border-white text-[9px] font-bold uppercase tracking-widest flex items-center gap-1.5 transition-all bg-black/30"
                            >
                              <QrCode size={12} />
                              Digital QR Pass
                            </button>
                          )}
                        </div>
                      </div>
                    </div>

                    {isExpanded && (
                      <div className="mt-2 border-t border-white/10 pt-4 text-[10px] font-mono text-white/50 space-y-2 uppercase">
                        <div className="flex justify-between"><span>Pass Price:</span><span className="text-white">₹{sub}</span></div>
                        <div className="flex justify-between"><span>Conv. Fee (5%):</span><span className="text-white">₹{fee}</span></div>
                        <div className="flex justify-between"><span>GST (18%):</span><span className="text-white">₹{tax}</span></div>
                        <div className="flex justify-between font-bold text-xs text-white border-t border-white/10 pt-2"><span>Total amount:</span><span>₹{total}</span></div>
                        {booking.paymentId && (
                          <div className="flex justify-between text-[9px] text-white/40 pt-2">
                            <span>Receipt Invoice:</span>
                            <span className="text-white select-all">{booking.paymentId}</span>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                )
              })}
            </div>
          )}
        </div>

      </div>

      {/* Ticket Details Modal Popup */}
      <AnimatePresence>
        {activeTicket && (
          <>
            <motion.div 
              initial={{ opacity: 0 }} 
              animate={{ opacity: 1 }} 
              exit={{ opacity: 0 }}
              onClick={() => setActiveTicket(null)}
              className="fixed inset-0 bg-black/90 backdrop-blur-md z-[110]"
            />
            
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-sm bg-neutral-950 border border-white/15 p-8 text-center space-y-6 z-[120] rounded-none text-white"
            >
              <button onClick={() => setActiveTicket(null)} className="absolute top-4 right-4 text-white/50 hover:text-white">
                <X size={18} />
              </button>

              <div className="space-y-1">
                <span className="text-[8px] font-mono text-brand-accent tracking-widest uppercase">Digital Pass Ticket</span>
                <h3 className="text-xl font-bold uppercase tracking-tight line-clamp-1">{activeTicket.eventId?.title}</h3>
                <p className="text-[9px] font-mono text-white/40 uppercase">{activeTicket.venueId?.name}</p>
              </div>

              {/* Render Leaflet QR code from QRServer */}
              <div className="border border-white/10 p-4 bg-white mx-auto w-48 h-48 flex items-center justify-center">
                <img 
                  src={`https://api.qrserver.com/v1/create-qr-code/?size=180x180&data=${encodeURIComponent(activeTicket.qrCodeToken)}`} 
                  alt="Ticket QR Code" 
                  className="w-full h-full object-contain"
                />
              </div>

              <div className="space-y-2 border-t border-white/10 pt-4 font-mono text-[9px] text-white/50 uppercase">
                <div className="flex justify-between"><span>Pass ID:</span><span className="text-white font-bold">{activeTicket.qrCodeToken}</span></div>
                <div className="flex justify-between"><span>Tier:</span><span className="text-white font-bold">{activeTicket.ticketType}</span></div>
                <div className="flex justify-between"><span>Quantity:</span><span className="text-white font-bold">{activeTicket.quantity} Passes</span></div>
                <div className="flex justify-between"><span>Status:</span><span className={`font-bold ${activeTicket.checkedIn ? 'text-green-400' : 'text-emerald-400'}`}>
                  {activeTicket.checkedIn ? 'ATTENDED' : 'VALID'}
                </span></div>
              </div>

              <p className="text-[8px] text-white/30 leading-normal uppercase">
                DO NOT SHARE THIS QR CODE. Present this ticket at the gates. Checked-in state matches the merchant server database.
              </p>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  )
}

function OwnerDashboard({ user }) {
  const [venues, setVenues] = useState([])
  const [selectedVenue, setSelectedVenue] = useState(null)
  const [bookings, setBookings] = useState([])
  const [showAdminPanel, setShowAdminPanel] = useState(false)
  const [loading, setLoading] = useState(true)
  const navigate = useNavigate()

  const userId = user.id || user._id

  useEffect(() => {
    const fetchData = async () => {
      try {
        const vRes = await fetch(`${API}/venues`)
        const vData = await vRes.json()
        
        if (Array.isArray(vData)) {
          const owned = vData.filter(v => v.ownerId === userId || user.role === 'admin')
          setVenues(owned)
          if (owned.length > 0 && !selectedVenue) {
            setSelectedVenue(owned[0])
          }
        }
      } catch (err) {
        console.error(err)
      } finally {
        setLoading(false)
      }
    }
    fetchData()
  }, [userId, user.role])

  useEffect(() => {
    const fetchBookings = async () => {
      if (!selectedVenue) return
      try {
        const token = localStorage.getItem('nn_token')
        const bRes = await fetch(`${API}/bookings/venue/${selectedVenue._id}`, {
          headers: { Authorization: `Bearer ${token}` }
        })
        const bData = await bRes.json()
        setBookings(Array.isArray(bData) ? bData : [])
      } catch (err) {
        console.error(err)
        setBookings([])
      }
    }
    fetchBookings()
  }, [selectedVenue])

  const updateStatus = async (id, status) => {
    try {
      const token = localStorage.getItem('nn_token')
      const res = await fetch(`${API}/bookings/${id}`, {
        method: 'PATCH',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ status })
      })
      if (res.ok) {
        setBookings(prev => prev.map(b => b._id === id ? { ...b, status } : b))
      }
    } catch (err) {
      console.error(err)
    }
  }

  return (
    <div className="min-h-screen bg-black pt-32 pb-24 px-6 sm:px-10 relative overflow-hidden text-white">
      {/* Decorative grids */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(124,58,237,0.1),rgba(0,0,0,0))] pointer-events-none z-0" />

      <div className="max-w-6xl mx-auto relative z-10">
        
        {/* Hub Header */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="flex flex-col sm:flex-row justify-between items-start sm:items-end gap-6 mb-16 border-b border-white/20 pb-8">
          <div>
            <h3 className="text-[10px] font-bold uppercase tracking-[0.3em] text-white/50 mb-2">Partner Command Portal</h3>
            <h1 className="text-4xl md:text-8xl font-bold tracking-tighter text-white uppercase">Control <span className="text-transparent" style={{ WebkitTextStroke: '1px white' }}>Deck</span></h1>
          </div>
          
          <div className="flex gap-2">
            <button 
              onClick={() => navigate('/checkin')}
              className="flex items-center gap-2 border border-white/20 hover:border-white px-6 py-4 font-bold uppercase tracking-widest text-[10px] bg-black/50 transition-all"
            >
              <QrCode size={16} /> Gate Scanner Console
            </button>
            <button 
              onClick={() => setShowAdminPanel(true)}
              className="flex items-center gap-2 bg-white text-black px-6 py-4 font-bold uppercase tracking-widest text-[10px] hover:bg-white/80 transition-all border border-white"
            >
              <Plus size={16} /> Onboard Local Spot
            </button>
          </div>
        </motion.div>

        {/* Counters */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
           <div className="border border-white/10 p-8 bg-white/[0.01]"><div className="text-[10px] text-white/50 uppercase tracking-widest font-mono mb-2">Owned spots</div><div className="text-4xl font-mono font-bold text-white">{venues.length}</div></div>
           <div className="border border-white/10 p-8 bg-white/[0.01]"><div className="text-[10px] text-white/50 uppercase tracking-widest font-mono mb-2">Checked-in Guests</div><div className="text-4xl font-mono font-bold text-white">{bookings.filter(b => b.status === 'attended').length}</div></div>
           <div className="border border-white/10 p-8 bg-white/[0.01]"><div className="text-[10px] text-white/50 uppercase tracking-widest font-mono mb-2">Pending Requests</div><div className="text-4xl font-mono font-bold text-white">{bookings.filter(b => b.status === 'pending').length}</div></div>
        </div>

        <div className="grid lg:grid-cols-3 gap-12">
          {/* Main Content: Booking Requests */}
          <div className="lg:col-span-2 space-y-6">
            <h2 className="text-xl font-bold text-white mb-6 uppercase tracking-widest flex items-center gap-3">
              <span className="w-2 h-2 bg-brand-accent rounded-full animate-pulse" />
              Incoming Requests
            </h2>
            <BookingsTable bookings={bookings} onUpdateStatus={updateStatus} />
          </div>

          {/* Sidebar: My Venues */}
          <div className="lg:col-span-1 space-y-6">
            <h2 className="text-xl font-bold text-white mb-6 uppercase tracking-widest">Active Grids</h2>
            <div className="space-y-4">
              {venues.map(v => (
                <div 
                  key={v._id} 
                  onClick={() => setSelectedVenue(v)}
                  className={`border p-2 flex items-center gap-4 group transition-colors cursor-pointer ${
                    selectedVenue?._id === v._id 
                      ? 'bg-white text-black border-white' 
                      : 'border-white/10 bg-white/[0.01] hover:bg-white/10 text-white'
                  }`}
                >
                  <img src={v.img} className="w-20 h-20 object-cover border border-white/10 grayscale" alt={v.name} />
                  <div className="overflow-hidden">
                    <h3 className={`font-bold transition-colors uppercase tracking-tight truncate ${
                      selectedVenue?._id === v._id ? 'text-black' : 'text-white'
                    }`}>{v.name}</h3>
                    <p className={`text-[10px] uppercase tracking-widest mt-1 font-mono ${
                      selectedVenue?._id === v._id ? 'text-black/60' : 'text-white/40'
                    }`}>Heat: <span>{v.occupancy}%</span></p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      <AnimatePresence>
        {showAdminPanel && (
          <AdminPanel onVenueAdded={(v) => setVenues(prev => [...prev, v])} onClose={() => setShowAdminPanel(false)} />
        )}
      </AnimatePresence>
    </div>
  )
}
