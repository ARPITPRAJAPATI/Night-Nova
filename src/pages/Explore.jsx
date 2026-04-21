import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useNavigate } from 'react-router-dom'
import { Search, SlidersHorizontal, MapPin } from 'lucide-react'
import GlowCard from '../components/GlowCard'
import SkeletonLoader from '../components/SkeletonLoader'
import { API } from '../config'

export default function Explore() {
  const [cities, setCities] = useState([])
  const [city, setCity] = useState('')
  const [venues, setVenues] = useState([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const [activeSort, setActiveSort] = useState('newest')
  
  const navigate = useNavigate()

  useEffect(() => {
    fetch(`${API}/cities`)
      .then(res => {
        if (!res.ok) throw new Error('API failed')
        return res.json()
      })
      .then(data => { 
        setCities(data)
        if (data.length > 0) setCity(data[0].slug)
        else setLoading(false)
      })
      .catch(() => setLoading(false))
  }, [])

  useEffect(() => {
    if (!city) {
      setLoading(false)
      return
    }
    setLoading(true)
    fetch(`${API}/venues?city=${city}`)
      .then(res => {
        if (!res.ok) throw new Error('API failed')
        return res.json()
      })
      .then(data => { 
        setVenues(data)
        setLoading(false) 
      })
      .catch(() => setLoading(false))
  }, [city])

  const filteredVenues = venues
    .filter(v => v.name.toLowerCase().includes(searchQuery.toLowerCase()) || v.tags.some(t => t.toLowerCase().includes(searchQuery.toLowerCase())))
    .sort((a, b) => {
      if (activeSort === 'occupancy') return b.occupancy - a.occupancy
      if (activeSort === 'rating') return b.rating - a.rating
      return 0
    })

  return (
    <div className="min-h-screen bg-black pt-32 pb-24 px-6 sm:px-10 relative overflow-hidden">
      
      {/* Global Background Video for Explore */}
      <div className="absolute inset-0 z-0 pointer-events-none">
        <video 
          autoPlay 
          loop 
          muted 
          playsInline
          className="w-full h-full object-cover opacity-20 grayscale"
        >
          <source src="/explore.mp4" type="video/mp4" />
        </video>
        <div className="absolute inset-0 bg-black/60" />
      </div>

      <div className="max-w-7xl mx-auto relative z-10">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex flex-col md:flex-row md:items-end justify-between gap-8 mb-16 border-b border-white/20 pb-8"
        >
          <div>
            <h1 className="text-4xl md:text-7xl font-bold tracking-tighter text-white mb-6 uppercase">
              Night <span className="text-transparent" style={{ WebkitTextStroke: '1px white' }}>Discovery</span>
            </h1>
            
            <div className="flex gap-4 overflow-x-auto pb-4 scrollbar-none">
              {cities.map(c => (
                <button
                  key={c.slug}
                  onClick={() => setCity(c.slug)}
                  className={`flex-shrink-0 px-6 py-2.5 text-[10px] font-bold uppercase tracking-[0.2em] transition-all border ${
                    city === c.slug 
                      ? 'bg-white text-black border-white' 
                      : 'bg-black text-white/50 hover:text-white border-white/20'
                  }`}
                >
                  <span className="flex items-center gap-2">
                    <MapPin size={12} className={city === c.slug ? 'text-white' : 'text-brand-accent'} />
                    {c.name}
                  </span>
                </button>
              ))}
            </div>
          </div>

          <div className="flex flex-col sm:flex-row gap-4 w-full md:w-auto">
            <div className="relative group flex-1 sm:w-80">
              <Search className="absolute left-5 top-1/2 -translate-y-1/2 text-white/50 group-focus-within:text-white transition-colors" size={18} />
              <input 
                type="text" 
                placeholder="SEARCH VENUE OR TAG" 
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                className="w-full bg-transparent border border-white/20 pl-12 pr-6 py-4 text-xs font-bold uppercase tracking-widest text-white placeholder-white/50 focus:outline-none focus:border-white transition-all rounded-none"
              />
            </div>
            
            <div className="flex border border-white/20 p-1 relative">
              {[
                { id: 'newest', label: 'Trending' },
                { id: 'occupancy', label: 'Busy' },
                { id: 'rating', label: 'Top' }
              ].map((sort) => (
                <button
                  key={sort.id}
                  onClick={() => setActiveSort(sort.id)}
                  className={`px-4 py-2.5 text-[9px] font-bold uppercase tracking-widest transition-all ${
                    activeSort === sort.id ? 'bg-white text-black' : 'text-white/50 hover:text-white'
                  }`}
                >
                  {sort.label}
                </button>
              ))}
            </div>
          </div>
        </motion.div>

        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
            {[1, 2, 3, 4].map(i => <SkeletonLoader key={i} />)}
          </div>
        ) : filteredVenues.length === 0 ? (
           <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-center py-40 glass rounded-[3rem] border border-white/5">
             <div className="w-20 h-20 bg-white/5 rounded-full flex items-center justify-center mx-auto mb-6 text-white/10">
               <SlidersHorizontal size={32} />
             </div>
             <h3 className="text-2xl text-white/80 font-bold tracking-tight mb-2">No matches in the grid</h3>
             <p className="text-white/30 text-sm font-medium">Try broadening your search or switching cities.</p>
           </motion.div>
        ) : (
          <motion.div 
            layout
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8"
          >
            <AnimatePresence>
              {filteredVenues.map((v, i) => (
                <motion.div
                  key={v._id}
                  layout
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.9 }}
                  transition={{ delay: i * 0.05, duration: 0.4 }}
                >
                  <GlowCard venue={v} onClick={() => navigate(`/venue/${v._id}`)} />
                </motion.div>
              ))}
            </AnimatePresence>
          </motion.div>
        )}
      </div>
    </div>
  )
}
