import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { Search, SlidersHorizontal, MapPin, Calendar, Compass, ShieldAlert, Sparkles, Filter, X } from 'lucide-react'
import { API } from '../config'
import { useAuth } from '../hooks/useAuth'

const MOODS = [
  'Turn Up', 'Chill', 'Date Night', 'Budget Night', 'Luxury Night', 
  'Live Music', 'Comedy', 'Adventure', 'Creative', 'Foodie', 
  'Social', 'Solo Friendly', 'Group Friendly', 'Hidden Gems', 
  'Late Night', 'Something Different'
]

const CATEGORIES = [
  'Parties and Clubs', 'Music', 'Comedy', 'Arts and Theatre', 
  'Food and Dining', 'Adventure', 'Games and Social', 'Workshops'
]

const parseNaturalLanguageQuery = (text) => {
  if (!text) return {};
  const t = text.toLowerCase();
  const parsed = {};

  // Cities
  if (t.includes('delhi') || t.includes('ncr')) parsed.city = 'delhi-ncr';
  else if (t.includes('mumbai')) parsed.city = 'mumbai';
  else if (t.includes('bangalore') || t.includes('bengaluru')) parsed.city = 'bengaluru';
  else if (t.includes('goa')) parsed.city = 'goa';
  else if (t.includes('pune')) parsed.city = 'pune';
  else if (t.includes('hyderabad')) parsed.city = 'hyderabad';

  // Dates
  if (t.includes('tonight') || t.includes('today')) parsed.date = 'today';
  else if (t.includes('tomorrow')) parsed.date = 'tomorrow';
  else if (t.includes('weekend')) parsed.date = 'weekend';

  // Price
  if (t.includes('free')) parsed.price = '0';
  else {
    const underMatch = t.match(/under\s*(\d+)/) || t.match(/below\s*(\d+)/);
    if (underMatch) {
      parsed.price = underMatch[1];
    }
  }

  // Categories
  if (t.includes('comedy') || t.includes('humor') || t.includes('laugh')) parsed.category = 'Comedy';
  else if (t.includes('music') || t.includes('concert') || t.includes('acoustic') || t.includes('jazz') || t.includes('singer')) parsed.category = 'Music';
  else if (t.includes('party') || t.includes('club') || t.includes('rave') || t.includes('techno') || t.includes('edm') || t.includes('dj') || t.includes('dance')) parsed.category = 'Parties and Clubs';
  else if (t.includes('paint') || t.includes('sip') || t.includes('workshop') || t.includes('pottery') || t.includes('class')) parsed.category = 'Workshops';
  else if (t.includes('food') || t.includes('cafe') || t.includes('dining') || t.includes('eat') || t.includes('trail')) parsed.category = 'Food and Dining';

  // Moods
  if (t.includes('date')) parsed.mood = 'Date Night';
  else if (t.includes('chill') || t.includes('relax')) parsed.mood = 'Chill';
  else if (t.includes('turn up') || t.includes('loud') || t.includes('high energy')) parsed.mood = 'Turn Up';
  else if (t.includes('adventure') || t.includes('trek') || t.includes('camp') || t.includes('stargazing')) parsed.mood = 'Adventure';

  return parsed;
};

export default function Explore() {
  const navigate = useNavigate()
  const { user } = useAuth()
  const [searchParams, setSearchParams] = useSearchParams()
  
  // URL Params Synchronization
  const currentMode = searchParams.get('mode') || 'events' // events or venues
  const currentCity = searchParams.get('city') || 'delhi-ncr'
  const currentCategory = searchParams.get('category') || ''
  const currentMood = searchParams.get('mood') || ''
  const currentDate = searchParams.get('date') || 'all'
  const currentSearch = searchParams.get('search') || ''
  const currentPrice = searchParams.get('price') || ''
  
  // Local States
  const [cities, setCities] = useState([])
  const [dataList, setDataList] = useState([])
  const [loading, setLoading] = useState(true)
  const [showFiltersDrawer, setShowFiltersDrawer] = useState(false)
  const [savedIds, setSavedIds] = useState([]) // Event / Venue bookmarks local state stub

  const parsedNL = parseNaturalLanguageQuery(currentSearch);
  const showSuggestion = Object.keys(parsedNL).length > 0;

  const handleApplyAISuggestions = () => {
    const params = new URLSearchParams(searchParams);
    if (parsedNL.city) params.set('city', parsedNL.city);
    if (parsedNL.category) params.set('category', parsedNL.category);
    if (parsedNL.mood) params.set('mood', parsedNL.mood);
    if (parsedNL.date) params.set('date', parsedNL.date);
    if (parsedNL.price) params.set('price', parsedNL.price);
    
    // Clear search text so they see results filtered cleanly!
    params.delete('search');
    setSearchParams(params);
  };
  
  // 1. Fetch cities
  useEffect(() => {
    fetch(`${API}/cities`)
      .then(res => res.json())
      .then(data => {
        setCities(data)
        if (data.length > 0 && !searchParams.get('city')) {
          updateParam('city', data[0].slug)
        }
      })
      .catch(() => {})
  }, [])

  // 2. Fetch Listing Data (Events or Venues)
  useEffect(() => {
    setLoading(true)
    const endpoint = currentMode === 'events' ? 'events' : 'venues'
    
    // Construct Query String
    let query = `?city=${currentCity}`
    if (currentCategory) query += `&category=${encodeURIComponent(currentCategory)}`
    if (currentMood) query += `&mood=${encodeURIComponent(currentMood)}`
    if (currentDate && currentDate !== 'all') query += `&date=${currentDate}`
    if (currentSearch) query += `&search=${encodeURIComponent(currentSearch)}`
    if (currentPrice) query += `&priceRange=${currentPrice}`

    fetch(`${API}/${endpoint}${query}`)
      .then(res => {
        if (!res.ok) throw new Error('Failed to fetch grid listing data')
        return res.json()
      })
      .then(data => {
        setDataList(data)
        setLoading(false)
      })
      .catch(err => {
        console.error(err)
        setDataList([])
        setLoading(false)
      })
  }, [currentMode, currentCity, currentCategory, currentMood, currentDate, currentSearch, currentPrice])

  const updateParam = (key, val) => {
    const params = new URLSearchParams(searchParams)
    if (val) {
      params.set(key, val)
    } else {
      params.delete(key)
    }
    setSearchParams(params)
  }

  const resetFilters = () => {
    const params = new URLSearchParams()
    params.set('mode', currentMode)
    params.set('city', currentCity)
    setSearchParams(params)
    setShowFiltersDrawer(false)
  }

  const handleToggleBookmark = (id, e) => {
    e.stopPropagation()
    setSavedIds(prev => 
      prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]
    )
  }

  return (
    <div className="min-h-screen bg-black pt-32 pb-24 px-6 sm:px-10 relative overflow-hidden text-white">
      {/* Decorative grids */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(124,58,237,0.1),rgba(0,0,0,0))] pointer-events-none z-0" />

      <div className="max-w-7xl mx-auto relative z-10 space-y-10">
        
        {/* Hub Header */}
        <div className="flex flex-col xl:flex-row xl:items-end justify-between gap-6 border-b border-white/10 pb-6">
          <div>
            <h1 className="text-4xl sm:text-7xl font-black tracking-tighter uppercase leading-none mb-4">
              Access the <span className="text-transparent" style={{ WebkitTextStroke: '1px white' }}>Grid.</span>
            </h1>
            
            {/* Mode Selector Tab Bar */}
            <div className="flex gap-4 mb-4 border border-white/10 p-1 w-fit bg-white/[0.01]">
              <button
                onClick={() => {
                  updateParam('mode', 'events')
                  setDataList([])
                }}
                className={`px-6 py-2 text-[10px] font-bold uppercase tracking-widest transition-all ${
                  currentMode === 'events' ? 'bg-white text-black font-extrabold' : 'text-white/60 hover:text-white'
                }`}
              >
                Events & Experiences
              </button>
              <button
                onClick={() => {
                  updateParam('mode', 'venues')
                  setDataList([])
                }}
                className={`px-6 py-2 text-[10px] font-bold uppercase tracking-widest transition-all ${
                  currentMode === 'venues' ? 'bg-white text-black font-extrabold' : 'text-white/60 hover:text-white'
                }`}
              >
                Clubs & Lounges
              </button>
            </div>

            {/* City Selection Strips */}
            <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-none max-w-full">
              {cities.map(c => (
                <button
                  key={c.slug}
                  onClick={() => updateParam('city', c.slug)}
                  className={`flex-shrink-0 px-4 py-2 border text-[9px] font-bold uppercase tracking-wider transition-all ${
                    currentCity === c.slug 
                      ? 'bg-white text-black border-white' 
                      : 'bg-transparent text-white/50 border-white/10 hover:text-white hover:border-white/30'
                  }`}
                >
                  {c.name}
                </button>
              ))}
            </div>
          </div>

          {/* Quick Search Console */}
          <div className="flex flex-col sm:flex-row gap-4 w-full xl:w-auto items-stretch sm:items-end">
            <div className="flex flex-col gap-2 flex-1 sm:w-80 relative">
              <div className="relative">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-white/40" size={16} />
                <input 
                  type="text" 
                  placeholder="SEARCH IDENTITIES..."
                  value={currentSearch}
                  onChange={e => updateParam('search', e.target.value)}
                  className="w-full bg-white/[0.03] border border-white/10 pl-12 pr-4 py-4 text-xs font-bold tracking-widest uppercase text-white placeholder-white/30 focus:border-white focus:outline-none rounded-none"
                />
              </div>
              
              {showSuggestion && (
                <button
                  type="button"
                  onClick={handleApplyAISuggestions}
                  className="text-left bg-purple-950/40 hover:bg-purple-900/40 border border-purple-500/30 p-2.5 text-[9px] font-mono text-brand-light flex items-center gap-1.5 uppercase transition-all"
                >
                  <Sparkles size={12} className="text-brand-accent animate-pulse shrink-0" />
                  <span>AI: Filter by {Object.entries(parsedNL).map(([k, v]) => `${k}='${v}'`).join(', ')}?</span>
                </button>
              )}
            </div>
            
            <button
              onClick={() => setShowFiltersDrawer(true)}
              className="px-6 py-4 border border-white/10 bg-white/[0.02] hover:bg-white hover:text-black flex items-center justify-center gap-2 text-xs font-bold uppercase tracking-widest transition-all rounded-none"
            >
              <Filter size={16} />
              Filters
            </button>
          </div>
        </div>

        {/* Display Active Filters Chips */}
        {(currentCategory || currentMood || currentDate !== 'all' || currentPrice) && (
          <div className="flex flex-wrap gap-2 items-center">
            <span className="text-[9px] font-mono text-white/40 uppercase tracking-widest mr-2">Active Filters:</span>
            {currentCategory && (
              <span className="px-3 py-1 bg-white/10 border border-white/10 text-[9px] font-mono flex items-center gap-1.5 uppercase">
                Category: {currentCategory}
                <button onClick={() => updateParam('category', '')} className="text-white/40 hover:text-white">✕</button>
              </span>
            )}
            {currentMood && (
              <span className="px-3 py-1 bg-white/10 border border-white/10 text-[9px] font-mono flex items-center gap-1.5 uppercase">
                Mood: {currentMood}
                <button onClick={() => updateParam('mood', '')} className="text-white/40 hover:text-white">✕</button>
              </span>
            )}
            {currentDate !== 'all' && (
              <span className="px-3 py-1 bg-white/10 border border-white/10 text-[9px] font-mono flex items-center gap-1.5 uppercase">
                Timing: {currentDate}
                <button onClick={() => updateParam('date', 'all')} className="text-white/40 hover:text-white">✕</button>
              </span>
            )}
            {currentPrice && (
              <span className="px-3 py-1 bg-white/10 border border-white/10 text-[9px] font-mono flex items-center gap-1.5 uppercase">
                Max Price: ₹{currentPrice}
                <button onClick={() => updateParam('price', '')} className="text-white/40 hover:text-white">✕</button>
              </span>
            )}
            <button onClick={resetFilters} className="text-[9px] font-mono text-brand-accent uppercase tracking-widest hover:underline ml-2">Reset All</button>
          </div>
        )}

        {/* Listings Grid */}
        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
            {[1, 2, 3, 4].map(i => <div key={i} className="h-72 bg-white/5 animate-pulse border border-white/10" />)}
          </div>
        ) : dataList.length === 0 ? (
          <div className="text-center py-40 border border-white/10 bg-white/[0.01]">
            <Compass size={48} className="mx-auto text-white/20 mb-4" />
            <h3 className="text-xl font-bold uppercase tracking-tight mb-2">No signals matched.</h3>
            <p className="text-white/40 text-xs font-mono max-w-xs mx-auto leading-relaxed">
              Nothing matches these filters on this city grid yet. Try increasing the distance or reset parameters.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
            {dataList.map(item => {
              if (currentMode === 'events') {
                const isBookmarked = savedIds.includes(item._id)
                return (
                  <div
                    key={item._id}
                    onClick={() => navigate(`/event/${item._id}`)}
                    className="group cursor-pointer border border-white/10 bg-white/[0.01] hover:border-white transition-colors duration-500 overflow-hidden flex flex-col justify-between"
                  >
                    <div className="h-48 overflow-hidden relative grayscale opacity-70 group-hover:opacity-100 transition-opacity duration-700">
                      <img src={item.coverImage} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" alt={item.title} />
                      <div className="absolute top-4 left-4 bg-black/85 border border-white/15 px-3 py-1 text-[8px] font-mono font-bold uppercase text-white tracking-widest">
                        {item.category}
                      </div>
                      
                      {/* Bookmark icon */}
                      <button 
                        onClick={(e) => handleToggleBookmark(item._id, e)}
                        className={`absolute top-4 right-4 w-8 h-8 flex items-center justify-center border transition-all ${
                          isBookmarked ? 'bg-white border-white text-black' : 'bg-black/60 border-white/15 text-white/60 hover:text-white'
                        }`}
                      >
                        ★
                      </button>
                    </div>

                    <div className="p-5 flex-1 flex flex-col justify-between">
                      <div>
                        <h4 className="text-lg font-bold uppercase tracking-tight text-white mb-1 truncate">
                          {item.title}
                        </h4>
                        <p className="text-white/40 text-[10px] font-mono uppercase tracking-wider mb-3 truncate">
                          {item.venueId?.name || 'Local Venue'} — {item.venueId?.city || 'City'}
                        </p>
                      </div>

                      <div className="border-t border-white/10 pt-3 flex justify-between items-center text-[9px] font-mono text-white/30">
                        <span>{new Date(item.startDate).toLocaleDateString()}</span>
                        <span className="font-bold text-white uppercase tracking-widest">
                          {item.ticketTypes[0]?.price === 0 ? 'FREE' : `FROM ₹${item.ticketTypes[0]?.price}`}
                        </span>
                      </div>
                    </div>
                  </div>
                )
              } else {
                // Venues Card
                const isBookmarked = savedIds.includes(item._id)
                return (
                  <div
                    key={item._id}
                    onClick={() => navigate(`/venue/${item._id}`)}
                    className="group cursor-pointer border border-white/10 bg-white/[0.01] hover:border-white transition-colors duration-500 overflow-hidden flex flex-col justify-between"
                  >
                    <div className="h-44 overflow-hidden relative grayscale opacity-70 group-hover:opacity-100 transition-opacity">
                      <img src={item.img} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" alt={item.name} />
                      <div className="absolute top-4 left-4 bg-black/85 border border-white/15 px-3 py-1 text-[8px] font-mono font-bold uppercase text-white tracking-widest">
                        {item.type}
                      </div>
                      
                      <button 
                        onClick={(e) => handleToggleBookmark(item._id, e)}
                        className={`absolute top-4 right-4 w-8 h-8 flex items-center justify-center border transition-all ${
                          isBookmarked ? 'bg-white border-white text-black' : 'bg-black/60 border-white/15 text-white/60 hover:text-white'
                        }`}
                      >
                        ★
                      </button>
                    </div>

                    <div className="p-5 flex-1 flex flex-col justify-between">
                      <div>
                        <h4 className="text-base font-bold uppercase tracking-tight text-white mb-1 truncate">{item.name}</h4>
                        <p className="text-white/40 text-[9px] uppercase tracking-widest font-mono mb-3 line-clamp-1">{item.address}</p>
                      </div>

                      <div className="border-t border-white/10 pt-3 flex justify-between items-center text-[9px] font-mono text-white/30">
                        <span className="flex items-center gap-1">
                          <span className="w-1.5 h-1.5 bg-brand-neon rounded-full" />
                          {item.occupancy}% Occupancy
                        </span>
                        <span className="font-bold text-white uppercase">★ {item.rating}</span>
                      </div>
                    </div>
                  </div>
                )
              }
            })}
          </div>
        )}

      </div>

      {/* Slide-out Bottom Sheet / Drawer Filters */}
      <AnimatePresence>
        {showFiltersDrawer && (
          <>
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowFiltersDrawer(false)}
              className="fixed inset-0 bg-black/80 backdrop-blur-md z-50"
            />
            
            <motion.div
              initial={{ y: '100%' }}
              animate={{ y: 0 }}
              exit={{ y: '100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 220 }}
              className="fixed bottom-0 left-0 right-0 max-h-[85vh] bg-neutral-950 border-t border-white/15 z-[60] overflow-y-auto"
            >
              <div className="max-w-2xl mx-auto p-6 sm:p-10 space-y-8">
                
                {/* Header */}
                <div className="flex justify-between items-center border-b border-white/10 pb-4">
                  <div>
                    <h3 className="text-xl font-bold uppercase tracking-wide">Refine Search Grid</h3>
                    <p className="text-white/40 text-[10px]">Filter coordinates on current localized rolling states.</p>
                  </div>
                  <button 
                    onClick={() => setShowFiltersDrawer(false)}
                    className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center hover:bg-white/15"
                  >
                    <X size={18} />
                  </button>
                </div>

                {/* Date filter (only for events) */}
                {currentMode === 'events' && (
                  <div className="space-y-3">
                    <label className="text-[10px] font-mono uppercase tracking-widest text-white/40">Select Timing</label>
                    <div className="grid grid-cols-4 gap-2">
                      {[
                        { id: 'all', name: 'Any Time' },
                        { id: 'today', name: 'Tonight' },
                        { id: 'tomorrow', name: 'Tomorrow' },
                        { id: 'weekend', name: 'This Weekend' }
                      ].map(d => (
                        <button
                          key={d.id}
                          onClick={() => updateParam('date', d.id)}
                          className={`py-3 border text-[9px] font-bold uppercase tracking-widest transition-all ${
                            currentDate === d.id ? 'bg-white text-black border-white' : 'bg-transparent text-white/70 border-white/10'
                          }`}
                        >
                          {d.name}
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {/* Category filter */}
                <div className="space-y-3">
                  <label className="text-[10px] font-mono uppercase tracking-widest text-white/40">Filter Category</label>
                  <div className="flex flex-wrap gap-2">
                    <button
                      onClick={() => updateParam('category', '')}
                      className={`px-4 py-2 border text-[9px] font-bold uppercase tracking-widest transition-all ${
                        !currentCategory ? 'bg-white text-black border-white' : 'bg-transparent text-white/70 border-white/10'
                      }`}
                    >
                      All categories
                    </button>
                    {CATEGORIES.map(cat => (
                      <button
                        key={cat}
                        onClick={() => updateParam('category', cat)}
                        className={`px-4 py-2 border text-[9px] font-bold uppercase tracking-widest transition-all ${
                          currentCategory === cat ? 'bg-white text-black border-white' : 'bg-transparent text-white/70 border-white/10'
                        }`}
                      >
                        {cat}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Mood filter */}
                <div className="space-y-3">
                  <label className="text-[10px] font-mono uppercase tracking-widest text-white/40">Filter Mood</label>
                  <div className="flex flex-wrap gap-2">
                    <button
                      onClick={() => updateParam('mood', '')}
                      className={`px-4 py-2 border text-[9px] font-bold uppercase tracking-widest transition-all ${
                        !currentMood ? 'bg-white text-black border-white' : 'bg-transparent text-white/70 border-white/10'
                      }`}
                    >
                      All moods
                    </button>
                    {MOODS.map(mood => (
                      <button
                        key={mood}
                        onClick={() => updateParam('mood', mood)}
                        className={`px-4 py-2 border text-[9px] font-bold uppercase tracking-widest transition-all ${
                          currentMood === mood ? 'bg-white text-black border-white' : 'bg-transparent text-white/70 border-white/10'
                        }`}
                      >
                        {mood}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Price range filter */}
                <div className="space-y-3">
                  <div className="flex justify-between items-center text-[10px] font-mono uppercase tracking-widest text-white/40">
                    <span>Pricing Constraint</span>
                    <span>Max: {currentPrice ? `₹${currentPrice}` : 'Unlimited'}</span>
                  </div>
                  <input
                    type="range"
                    min="0"
                    max="5000"
                    step="250"
                    value={currentPrice || '5000'}
                    onChange={e => updateParam('price', e.target.value === '5000' ? '' : e.target.value)}
                    className="w-full accent-white"
                  />
                  <div className="flex justify-between text-[9px] font-mono text-white/30 uppercase">
                    <span>Free (₹0)</span>
                    <span>₹5,000+</span>
                  </div>
                </div>

                {/* CTA actions */}
                <div className="flex gap-4 pt-6 border-t border-white/10">
                  <button
                    onClick={resetFilters}
                    className="flex-1 py-4 border border-white/20 hover:border-white font-bold uppercase tracking-widest text-[10px] transition-colors"
                  >
                    Reset Grid
                  </button>
                  <button
                    onClick={() => setShowFiltersDrawer(false)}
                    className="flex-[2] py-4 bg-white text-black hover:bg-white/80 font-bold uppercase tracking-widest text-[10px] transition-all"
                  >
                    Apply Filter Set
                  </button>
                </div>

              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  )
}
