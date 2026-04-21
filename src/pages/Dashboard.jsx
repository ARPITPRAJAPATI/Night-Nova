import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Calendar, Users, MapPin, Search, Plus } from 'lucide-react'
import { API } from '../config'
import { useAuth } from '../hooks/useAuth'
import { Link } from 'react-router-dom'
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
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchBookings = async () => {
      try {
        const token = localStorage.getItem('nn_token')
        const res = await fetch(`${API}/bookings/my`, { headers: { Authorization: `Bearer ${token}` } })
        setBookings(await res.json())
      } catch (err) {} finally { setLoading(false) }
    }
    fetchBookings()
  }, [])

  return (
    <div className="min-h-screen bg-black pt-32 pb-24 px-6 sm:px-10 relative overflow-hidden">
      
      {/* Dynamic Video Background */}
      <div className="absolute inset-0 z-0 pointer-events-none">
        <video 
          autoPlay 
          loop 
          muted 
          playsInline
          className="w-full h-full object-cover opacity-20 grayscale"
        >
          <source src="/dashboard.mp4" type="video/mp4" />
        </video>
        <div className="absolute inset-0 bg-black/70" />
      </div>

      <div className="max-w-5xl mx-auto relative z-10">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="flex justify-between items-end gap-8 mb-16 border-b border-white/20 pb-8">
          <div>
            <h3 className="text-[10px] font-mono font-bold uppercase tracking-[0.3em] text-white/50 mb-2">User Profile</h3>
            <h1 className="text-4xl md:text-8xl font-bold tracking-tighter text-white uppercase">
              {user.name.split(' ')[0]}'s <span className="text-transparent" style={{ WebkitTextStroke: '1px white' }}>Dashboard</span>
            </h1>
          </div>
          <div className="border border-white/20 px-6 py-4 flex gap-8 bg-black/50">
             <div><div className="text-[9px] font-mono text-white/30 uppercase tracking-widest mb-1">Status</div><div className="text-sm font-bold text-white uppercase">VIP USER</div></div>
             <div><div className="text-[9px] font-mono text-white/30 uppercase tracking-widest mb-1">Visits</div><div className="text-sm font-bold text-white">{bookings.length}</div></div>
          </div>
        </motion.div>

        <h2 className="text-xl font-bold text-white mb-6 uppercase tracking-widest">Your Reservations</h2>

        {loading ? (
          <div className="grid md:grid-cols-2 gap-6">{[1, 2].map(i => <div key={i} className="h-48 bg-white/5 border border-white/20 animate-pulse" />)}</div>
        ) : bookings.length === 0 ? (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-center py-32 border border-white/20 bg-black/50">
             <div className="w-20 h-20 border border-white/20 rounded-none flex items-center justify-center mx-auto mb-6 text-white/30"><Search size={32} /></div>
             <h3 className="text-2xl text-white font-bold tracking-tighter uppercase mb-2">No active missions</h3>
             <p className="text-white/50 text-sm mb-8 font-mono tracking-widest uppercase">You haven't booked any experiences yet.</p>
             <Link to="/explore" className="bg-white text-black hover:bg-white/80 transition-all px-8 py-4 font-bold uppercase tracking-[0.2em] text-[10px]">Explore The Grid</Link>
          </motion.div>
        ) : (
          <div className="grid md:grid-cols-2 gap-6">
            {bookings.map((booking, i) => (
              <motion.div key={booking._id} initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="bg-black/80 overflow-hidden flex flex-col border border-white/20 hover:border-white transition-colors">
                <div className="h-32 relative grayscale">
                  <img src={booking.venueId.img} className="w-full h-full object-cover opacity-60" />
                  <div className="absolute inset-0 bg-gradient-to-t from-black to-transparent pointer-events-none" />
                  <div className="absolute top-4 right-4 bg-white px-3 py-1.5"><span className="text-[9px] font-extrabold text-black uppercase tracking-widest">{booking.status}</span></div>
                </div>
                <div className="p-6">
                  <h3 className="text-3xl font-bold text-white mb-1 uppercase tracking-tighter">{booking.venueId.name}</h3>
                  <div className="flex items-center gap-2 text-white/40 text-[10px] uppercase font-mono tracking-widest mb-6"><MapPin size={12} /> {booking.venueId.city}</div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="border border-white/20 p-4"><div className="text-[10px] text-white/50 font-mono uppercase mb-1">Date</div><div className="text-sm font-bold text-white font-mono">{new Date(booking.date).toLocaleDateString()}</div></div>
                    <div className="border border-white/20 p-4"><div className="text-[10px] text-white/50 font-mono uppercase mb-1">Entry</div><div className="text-sm font-bold text-white font-mono">{booking.guests} Guests</div></div>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

function OwnerDashboard({ user }) {
  const [venues, setVenues] = useState([])
  const [bookings, setBookings] = useState([])
  const [showAdminPanel, setShowAdminPanel] = useState(false)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchData = async () => {
      try {
        const token = localStorage.getItem('nn_token')
        const vRes = await fetch(`${API}/venues`)
        const vData = await vRes.json()
        const owned = vData.filter(v => v.ownerId === user.id || user.role === 'admin')
        setVenues(owned)

        if (owned.length > 0) {
          const bRes = await fetch(`${API}/bookings/venue/${owned[0]._id}`, {
            headers: { Authorization: `Bearer ${token}` }
          })
          setBookings(await bRes.json())
        }
      } catch (err) {
        console.error(err)
      } finally {
        setLoading(false)
      }
    }
    fetchData()
  }, [user.id, user.role])

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
    <div className="min-h-screen bg-black pt-32 pb-24 px-6 sm:px-10 relative overflow-hidden">
      
      {/* Global Background Video for Owner Dashboard */}
      <div className="absolute inset-0 z-0 pointer-events-none">
        <video 
          autoPlay 
          loop 
          muted 
          playsInline
          className="w-full h-full object-cover opacity-20 grayscale"
        >
          <source src="/dashboard.mp4" type="video/mp4" />
        </video>
        <div className="absolute inset-0 bg-black/70" />
      </div>

      <div className="max-w-6xl mx-auto relative z-10">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="flex justify-between items-end gap-8 mb-16 border-b border-white/20 pb-8">
          <div>
            <h3 className="text-[10px] font-bold uppercase tracking-[0.3em] text-white/50 mb-2">Partner Portal</h3>
            <h1 className="text-4xl md:text-8xl font-bold tracking-tighter text-white uppercase">Command <span className="text-transparent" style={{ WebkitTextStroke: '1px white' }}>Center</span></h1>
          </div>
          <button 
            onClick={() => setShowAdminPanel(true)}
            className="flex items-center gap-2 bg-white text-black px-6 py-4 font-bold uppercase tracking-widest text-[10px] hover:bg-white/80 transition-all border border-white"
          >
            <Plus size={16} /> Deploy Venue
          </button>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
           <div className="border border-white/20 p-8 bg-black/50"><div className="text-[10px] text-white/50 uppercase tracking-widest font-mono mb-2">Total Venues</div><div className="text-4xl font-mono text-white">{venues.length}</div></div>
           <div className="border border-white/20 p-8 bg-black/50"><div className="text-[10px] text-white/50 uppercase tracking-widest font-mono mb-2">Active Guests</div><div className="text-4xl font-mono text-white">{bookings.filter(b => b.status === 'confirmed').length}</div></div>
           <div className="border border-white/20 p-8 bg-black/50"><div className="text-[10px] text-white/50 uppercase tracking-widest font-mono mb-2">Pending Requests</div><div className="text-4xl font-mono text-white">{bookings.filter(b => b.status === 'pending').length}</div></div>
        </div>

        <div className="grid lg:grid-cols-3 gap-12">
          {/* Main Content: Booking Requests */}
          <div className="lg:col-span-2">
            <h2 className="text-xl font-bold text-white mb-6 uppercase tracking-widest flex items-center gap-3">
              <span className="w-2 h-2 bg-brand-accent rounded-full animate-pulse" />
              Incoming Requests
            </h2>
            <BookingsTable bookings={bookings} onUpdateStatus={updateStatus} />
          </div>

          {/* Sidebar: My Venues */}
          <div className="lg:col-span-1">
            <h2 className="text-xl font-bold text-white mb-6 uppercase tracking-widest">Your Grids</h2>
            <div className="space-y-4">
              {venues.map(v => (
                <div key={v._id} className="border border-white/20 p-2 flex items-center gap-4 group bg-black/50 hover:bg-white hover:text-black transition-colors cursor-pointer">
                  <img src={v.img} className="w-20 h-20 object-cover grayscale" />
                  <div>
                    <h3 className="font-bold text-white group-hover:text-black transition-colors uppercase tracking-tight">{v.name}</h3>
                    <p className="text-[10px] text-white/40 group-hover:text-black/60 uppercase tracking-widest mt-1 font-mono">Heat: <span className="text-white group-hover:text-black">{v.occupancy}%</span></p>
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
