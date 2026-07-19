import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Link, useNavigate } from 'react-router-dom'
import { ArrowRight, Search, Calendar, MapPin, Compass, Flame, Shield, HelpCircle, Mail } from 'lucide-react'
import { API } from '../config'

const MOODS = [
  { name: 'Turn Up', desc: 'High energy clubs & raves', slug: 'Turn Up', icon: '🔥' },
  { name: 'Chill', desc: 'Intimate acoustic lounges & jazz', slug: 'Chill', icon: '🍸' },
  { name: 'Date Night', desc: 'Rooftops & private dining', slug: 'Date Night', icon: '🌹' },
  { name: 'Budget Night', desc: 'Comedy clubs & student events', slug: 'Budget Night', icon: '🎟️' },
  { name: 'Creative', desc: 'Sip-and-paint & pottery', slug: 'Creative', icon: '🎨' },
  { name: 'Adventure', desc: 'Midnight treks & stargazing', slug: 'Adventure', icon: '⛺' }
]

const CATEGORIES = [
  'Parties and Clubs', 'Music', 'Comedy', 'Arts and Theatre', 
  'Food and Dining', 'Adventure', 'Games and Social', 'Workshops'
]

export default function Home() {
  const navigate = useNavigate()
  const [cities, setCities] = useState([])
  const [trendingEvents, setTrendingEvents] = useState([])
  const [loading, setLoading] = useState(true)
  
  // Search state
  const [searchCity, setSearchCity] = useState('')
  const [searchCategory, setSearchCategory] = useState('')
  const [searchDate, setSearchDate] = useState('tonight')
  const [searchQuery, setSearchQuery] = useState('')
  
  // Newsletter
  const [email, setEmail] = useState('')
  const [subSubscribed, setSubSubscribed] = useState(false)

  useEffect(() => {
    // 1. Fetch cities
    fetch(`${API}/cities`)
      .then(res => res.json())
      .then(data => {
        setCities(data)
        if (data.length > 0) setSearchCity(data[0].slug)
      })
      .catch(() => {})

    // 2. Fetch trending events
    fetch(`${API}/events?sort=popularity`)
      .then(res => res.json())
      .then(data => {
        setTrendingEvents(data.slice(0, 4))
        setLoading(false)
      })
      .catch(() => setLoading(false))
  }, [])

  const handleSearch = (e) => {
    e.preventDefault()
    let url = `/explore?city=${searchCity}&date=${searchDate}`
    if (searchCategory) url += `&category=${encodeURIComponent(searchCategory)}`
    if (searchQuery) url += `&search=${encodeURIComponent(searchQuery)}`
    navigate(url)
  }

  const handleSubscribe = (e) => {
    e.preventDefault()
    if (!email) return
    setSubSubscribed(true)
    setEmail('')
  }

  return (
    <div className="bg-black min-h-screen text-white font-sans overflow-x-hidden relative">
      
      {/* Background visual texture */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(124,58,237,0.1),rgba(0,0,0,0))] pointer-events-none z-0" />

      {/* Cinematic Hero */}
      <div className="relative min-h-[90vh] flex flex-col justify-center px-6 sm:px-10 py-20 pt-32 max-w-7xl mx-auto z-10">
        
        <div className="max-w-4xl space-y-6">
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-white/5 border border-white/10 rounded-full">
            <span className="w-2 h-2 rounded-full bg-brand-neon animate-pulse" />
            <span className="text-[9px] font-mono font-bold tracking-widest text-white/70 uppercase">Network Connection Active</span>
          </div>

          <h1 className="text-5xl sm:text-8xl font-black tracking-tighter leading-none uppercase">
            Own the <span className="text-transparent" style={{ WebkitTextStroke: '1px white' }}>Night.</span>
          </h1>

          <p className="text-white/60 text-sm sm:text-lg max-w-xl leading-relaxed font-medium">
            Discover parties, live performances, hidden experiences, food trails, workshops, adventures, and everything happening after dark in your city.
          </p>
        </div>

        {/* Interactive Search Console */}
        <form onSubmit={handleSearch} className="mt-12 border border-white/15 bg-white/[0.02] p-4 sm:p-6 grid grid-cols-1 md:grid-cols-4 gap-4 rounded-none max-w-5xl backdrop-blur-md">
          {/* City */}
          <div className="flex flex-col gap-2 border-r border-white/10 pr-2">
            <label className="text-[8px] font-bold uppercase tracking-widest text-white/40 font-mono">Select City</label>
            <select 
              value={searchCity}
              onChange={e => setSearchCity(e.target.value)}
              className="bg-transparent text-xs font-bold uppercase tracking-widest text-white focus:outline-none cursor-pointer"
            >
              {cities.map(c => <option key={c.slug} value={c.slug} className="bg-neutral-900 text-white">{c.name}</option>)}
            </select>
          </div>

          {/* Date */}
          <div className="flex flex-col gap-2 border-r border-white/10 pr-2">
            <label className="text-[8px] font-bold uppercase tracking-widest text-white/40 font-mono">Timing</label>
            <select 
              value={searchDate}
              onChange={e => setSearchDate(e.target.value)}
              className="bg-transparent text-xs font-bold uppercase tracking-widest text-white focus:outline-none cursor-pointer"
            >
              <option value="tonight" className="bg-neutral-900 text-white">Tonight</option>
              <option value="tomorrow" className="bg-neutral-900 text-white">Tomorrow</option>
              <option value="weekend" className="bg-neutral-900 text-white">This Weekend</option>
              <option value="all" className="bg-neutral-900 text-white">Any Time</option>
            </select>
          </div>

          {/* Category */}
          <div className="flex flex-col gap-2 border-r border-white/10 pr-2">
            <label className="text-[8px] font-bold uppercase tracking-widest text-white/40 font-mono">Experience Class</label>
            <select 
              value={searchCategory}
              onChange={e => setSearchCategory(e.target.value)}
              className="bg-transparent text-xs font-bold uppercase tracking-widest text-white focus:outline-none cursor-pointer"
            >
              <option value="" className="bg-neutral-900 text-white">All categories</option>
              {CATEGORIES.map(cat => <option key={cat} value={cat} className="bg-neutral-900 text-white">{cat}</option>)}
            </select>
          </div>

          {/* Search Query Input */}
          <div className="flex items-center gap-3">
            <div className="flex-1 flex flex-col gap-2">
              <label className="text-[8px] font-bold uppercase tracking-widest text-white/40 font-mono">Keyword</label>
              <input 
                type="text"
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                placeholder="EDM, ROOFTOP, DJ..." 
                className="bg-transparent text-xs text-white placeholder-white/30 uppercase tracking-widest focus:outline-none"
              />
            </div>
            <button type="submit" className="w-14 h-14 bg-white text-black hover:bg-white/90 transition-all flex items-center justify-center border border-white">
              <Search size={20} />
            </button>
          </div>
        </form>

        {/* Quick Links / Active Cities */}
        <div className="mt-12 flex flex-wrap gap-3 items-center">
          <span className="text-[9px] font-mono text-white/40 uppercase tracking-widest mr-2">Active Grids:</span>
          {cities.map(c => (
            <Link 
              key={c.slug} 
              to={`/city/${c.slug}`}
              className="px-4 py-2 border border-white/10 hover:border-white text-[10px] uppercase font-bold tracking-widest transition-all hover:bg-white/[0.02]"
            >
              {c.name}
            </Link>
          ))}
        </div>
      </div>

      {/* Main Page Sections */}
      <div className="max-w-7xl mx-auto px-6 sm:px-10 space-y-24 pb-32">
        
        {/* Trending Events */}
        <section>
          <div className="flex justify-between items-end mb-10 border-b border-white/10 pb-4">
            <div>
              <h2 className="text-3xl font-black uppercase tracking-tight">Trending Tonight</h2>
              <p className="text-white/40 text-xs mt-1">High-interest reservations on the local network.</p>
            </div>
            <Link to="/explore" className="text-[10px] font-bold uppercase tracking-[0.2em] text-white/50 hover:text-white flex items-center gap-1.5 transition-colors">
              Access the Grid <ArrowRight size={14} />
            </Link>
          </div>

          {loading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
              {[1, 2, 3, 4].map(i => <div key={i} className="h-72 bg-white/5 animate-pulse border border-white/10" />)}
            </div>
          ) : trendingEvents.length === 0 ? (
            <div className="border border-white/10 p-16 text-center bg-white/[0.01]">
              <Compass className="mx-auto text-white/20 mb-4 animate-pulse" size={32} />
              <p className="text-white/40 text-xs uppercase tracking-widest font-mono">No trending listings active right now</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
              {trendingEvents.map(event => (
                <div 
                  key={event._id}
                  onClick={() => navigate(`/event/${event._id}`)}
                  className="group cursor-pointer border border-white/10 bg-white/[0.01] hover:border-white transition-colors duration-500 overflow-hidden flex flex-col"
                >
                  <div className="h-44 overflow-hidden relative grayscale opacity-70 group-hover:opacity-100 transition-opacity duration-700">
                    <img src={event.coverImage} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" alt={event.title} />
                    <div className="absolute top-4 left-4 bg-black/80 border border-white/15 px-3 py-1 text-[8px] font-mono font-bold uppercase text-white tracking-widest">
                      {event.category}
                    </div>
                  </div>
                  <div className="p-5 flex-1 flex flex-col justify-between">
                    <div>
                      <h4 className="text-lg font-bold uppercase tracking-tight text-white group-hover:text-white transition-colors mb-1 truncate">
                        {event.title}
                      </h4>
                      <p className="text-white/40 text-[10px] font-mono uppercase tracking-wider line-clamp-1 mb-3">{event.venueId?.name} — {event.venueId?.city}</p>
                    </div>
                    <div className="border-t border-white/10 pt-3 flex justify-between items-center text-[9px] font-mono text-white/30">
                      <span>{new Date(event.startDate).toLocaleDateString()}</span>
                      <span className="font-bold text-white uppercase tracking-widest">
                        {event.ticketTypes[0]?.price === 0 ? 'FREE' : `FROM ₹${event.ticketTypes[0]?.price}`}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>

        {/* Mood Selection */}
        <section>
          <div className="mb-10 border-b border-white/10 pb-4">
            <h2 className="text-3xl font-black uppercase tracking-tight">Explore by Mood</h2>
            <p className="text-white/40 text-xs mt-1">Match tonight's energy to specific atmospheric systems.</p>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
            {MOODS.map(mood => (
              <div
                key={mood.slug}
                onClick={() => navigate(`/explore?mood=${encodeURIComponent(mood.slug)}`)}
                className="border border-white/10 bg-white/[0.01] hover:border-white p-6 cursor-pointer flex flex-col justify-between items-start group transition-all duration-300 min-h-40"
              >
                <span className="text-2xl">{mood.icon}</span>
                <div>
                  <h4 className="text-sm font-bold uppercase tracking-wider text-white mb-1 group-hover:text-brand-accent transition-colors">{mood.name}</h4>
                  <p className="text-white/40 text-[10px] leading-relaxed line-clamp-2">{mood.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Safety and Trust section */}
        <section className="grid md:grid-cols-2 gap-8 border border-white/10 p-8 sm:p-16 bg-white/[0.01] rounded-none">
          <div className="space-y-6">
            <div className="w-12 h-12 bg-white/5 border border-white/10 rounded-full flex items-center justify-center text-white/50">
              <Shield size={24} />
            </div>
            <h2 className="text-3xl sm:text-4xl font-black uppercase tracking-tight max-w-md">Safe and Legally Verified Nightlife</h2>
            <p className="text-white/50 text-sm sm:text-base leading-relaxed">
              NightNova puts safety first. We partner exclusively with verified venue managers and legal experience organizers. Access detailed venue information, dress policies, occupancy rates, and safety logs directly on event grids.
            </p>
          </div>
          <div className="space-y-6 border-l border-white/10 pl-0 md:pl-12 flex flex-col justify-center">
            <div className="space-y-3">
              <div className="flex gap-3">
                <span className="text-white font-bold font-mono">01.</span>
                <span className="text-xs text-white/70 uppercase font-bold tracking-wider">Verified Hosts and Promoters Only</span>
              </div>
              <div className="flex gap-3">
                <span className="text-white font-bold font-mono">02.</span>
                <span className="text-xs text-white/70 uppercase font-bold tracking-wider">Encrypted Digital Passes with Signed Verification</span>
              </div>
              <div className="flex gap-3">
                <span className="text-white font-bold font-mono">03.</span>
                <span className="text-xs text-white/70 uppercase font-bold tracking-wider">No Fake Urgency, Hidden Fees, or Fake Seat Count</span>
              </div>
            </div>

            <div className="pt-6">
              <Link to="/dashboard" className="px-8 py-4 bg-white text-black hover:bg-white/80 transition-all font-bold uppercase tracking-[0.2em] text-[10px]">
                List an Event
              </Link>
            </div>
          </div>
        </section>

        {/* Newsletter Signup */}
        <section className="border border-white/10 p-8 sm:p-12 text-center bg-white/[0.01] relative overflow-hidden">
          <div className="max-w-xl mx-auto space-y-6 relative z-10">
            <div className="w-12 h-12 rounded-full bg-white/5 border border-white/10 flex items-center justify-center mx-auto text-white/30">
              <Mail size={20} />
            </div>
            <h3 className="text-2xl font-bold uppercase tracking-wider">Synchronize with the grid</h3>
            <p className="text-white/50 text-xs leading-relaxed max-w-sm mx-auto">
              Get notified of secret warehouse raves, food trials, and stand-up showcases in your city. Sent once a week. Quiet hours respected.
            </p>

            {subSubscribed ? (
              <motion.div initial={{ scale: 0.95 }} animate={{ scale: 1 }} className="text-xs font-bold text-green-400 font-mono uppercase tracking-widest">
                Email added to database network. Welcome to the grid.
              </motion.div>
            ) : (
              <form onSubmit={handleSubscribe} className="flex border border-white/20 p-1 bg-black/60 focus-within:border-white transition-colors">
                <input 
                  type="email" 
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  placeholder="ENTER ENCRYPTED EMAIL ADDRESS" 
                  className="flex-1 bg-transparent px-4 py-3 text-xs text-white focus:outline-none placeholder-white/30"
                  required
                />
                <button type="submit" className="bg-white text-black hover:bg-white/80 transition-all px-6 py-3 font-bold uppercase tracking-widest text-[9px]">
                  Subscribe
                </button>
              </form>
            )}
          </div>
        </section>

      </div>
    </div>
  )
}
