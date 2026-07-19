import { useState, useEffect } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { MapPin, ArrowRight, ShieldCheck, HelpCircle, Compass, Users } from 'lucide-react'
import { API } from '../config'

// Locality maps for major cities
const LOCALITIES = {
  'delhi-ncr': ['Connaught Place', 'Hauz Khas', 'Cyber Hub', 'Sector 29', 'Greater Kailash', 'Noida Sector 62'],
  'mumbai': ['Bandra', 'Andheri', 'Colaba', 'Juhu', 'Lower Parel', 'Powai'],
  'bengaluru': ['Koramangala', 'Indiranagar', 'MG Road', 'Whitefield', 'HSR Layout', 'JP Nagar'],
  'goa': ['Baga', 'Calangute', 'Anjuna', 'Panaji', 'Vagator', 'Candolim'],
  'pune': ['Koregaon Park', 'Kalyani Nagar', 'Baner', 'Viman Nagar'],
  'hyderabad': ['Jubilee Hills', 'Banjara Hills', 'Gachibowli', 'Kondapur']
}

export default function CityDetail() {
  const { slug } = useParams()
  const navigate = useNavigate()
  const [cityData, setCityData] = useState(null)
  const [events, setEvents] = useState([])
  const [venues, setVenues] = useState([])
  const [loading, setLoading] = useState(true)
  const [submittingLink, setSubmittingLink] = useState('')
  const [submissionSuccess, setSubmissionSuccess] = useState(false)

  // Fetch city info, events, and venues
  useEffect(() => {
    setLoading(true)
    // 1. Get City Name
    fetch(`${API}/cities`)
      .then(res => res.json())
      .then(cities => {
        const found = cities.find(c => c.slug === slug)
        if (found) setCityData(found)
        else setCityData({ name: slug.split('-').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' '), slug })
      })
      .catch(() => {})

    // 2. Fetch Events
    fetch(`${API}/events?city=${slug}`)
      .then(res => res.json())
      .then(data => setEvents(data))
      .catch(() => [])

    // 3. Fetch Venues
    fetch(`${API}/venues?city=${slug}`)
      .then(res => res.json())
      .then(data => {
        setVenues(data)
        setLoading(false)
      })
      .catch(() => setLoading(false))
  }, [slug])

  const handleCommunitySubmit = (e) => {
    e.preventDefault()
    if (!submittingLink) return
    setSubmissionSuccess(true)
    setSubmittingLink('')
    setTimeout(() => setSubmissionSuccess(false), 3000)
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-brand-dark flex items-center justify-center">
        <div className="w-12 h-12 border-4 border-white/10 border-t-white rounded-full animate-spin" />
      </div>
    )
  }

  const localLocalities = LOCALITIES[slug] || ['Downtown', 'High Street', 'Metro Area']

  return (
    <div className="min-h-screen bg-black text-white pt-28 pb-20 px-6 sm:px-10 relative overflow-hidden">
      {/* Decorative grids */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_80%_80%_at_50%_-20%,rgba(124,58,237,0.15),rgba(0,0,0,0))] pointer-events-none" />

      <div className="max-w-7xl mx-auto relative z-10">
        
        {/* City Hero */}
        <div className="border border-white/10 bg-white/[0.02] p-8 sm:p-16 rounded-[2.5rem] mb-12 flex flex-col md:flex-row justify-between items-start md:items-end gap-6">
          <div>
            <div className="flex items-center gap-2 text-[10px] font-bold tracking-[0.3em] text-white/50 uppercase mb-3 font-mono">
              <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" />
              Active Hub Grid
            </div>
            <h1 className="text-5xl sm:text-8xl font-black tracking-tighter uppercase mb-4">
              {cityData?.name}
            </h1>
            <p className="text-white/50 text-sm sm:text-base max-w-xl font-medium">
              Explore the premier nightlife, underground sets, comedy clubs, stargazing routes, and sensory dining events in {cityData?.name}.
            </p>
          </div>
          <div className="flex gap-4 font-mono text-xs">
            <div className="border border-white/15 px-6 py-4 bg-black/50">
              <div className="text-[9px] text-white/30 tracking-widest uppercase mb-1">Grid Events</div>
              <div className="text-2xl font-bold">{events.length}</div>
            </div>
            <div className="border border-white/15 px-6 py-4 bg-black/50">
              <div className="text-[9px] text-white/30 tracking-widest uppercase mb-1">Local Grids</div>
              <div className="text-2xl font-bold">{venues.length}</div>
            </div>
          </div>
        </div>

        {/* Localities Section */}
        <div className="mb-16">
          <h3 className="text-[10px] uppercase tracking-[0.25em] font-mono text-white/40 mb-6 flex items-center gap-2">
            <MapPin size={12} className="text-brand-accent" />
            Explore Localities
          </h3>
          <div className="flex flex-wrap gap-3">
            {localLocalities.map(loc => (
              <button
                key={loc}
                onClick={() => navigate(`/explore?city=${slug}&search=${encodeURIComponent(loc)}`)}
                className="px-5 py-3 border border-white/10 bg-white/[0.02] hover:bg-white hover:text-black hover:border-white transition-all text-xs font-bold uppercase tracking-wider rounded-none"
              >
                {loc}
              </button>
            ))}
          </div>
        </div>

        {/* Events Grid */}
        <div className="mb-16">
          <div className="flex justify-between items-end mb-8 border-b border-white/10 pb-4">
            <div>
              <h2 className="text-2xl sm:text-4xl font-bold tracking-tight uppercase">Trending Tonight & Beyond</h2>
              <p className="text-white/40 text-xs mt-1">Live booking status updated on the network.</p>
            </div>
            <Link to="/explore" className="text-[10px] font-bold uppercase tracking-widest text-white/50 hover:text-white flex items-center gap-2 transition-colors">
              View All <ArrowRight size={14} />
            </Link>
          </div>

          {events.length === 0 ? (
            <div className="border border-white/10 p-16 text-center bg-white/[0.01]">
              <Compass className="mx-auto text-white/20 mb-4" size={40} />
              <p className="text-white/40 text-sm font-mono uppercase tracking-widest">No scheduled events active in this city grid yet</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
              {events.slice(0, 3).map(event => (
                <div 
                  key={event._id}
                  onClick={() => navigate(`/event/${event._id}`)}
                  className="group cursor-pointer border border-white/10 bg-white/[0.02] hover:border-white transition-colors duration-500 overflow-hidden flex flex-col"
                >
                  <div className="h-48 overflow-hidden relative grayscale opacity-70 group-hover:opacity-100 transition-all duration-700">
                    <img src={event.coverImage} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" alt={event.title} />
                    <div className="absolute top-4 left-4 bg-black/80 border border-white/15 px-3 py-1 text-[9px] font-mono font-bold uppercase text-white tracking-widest">
                      {event.category}
                    </div>
                  </div>
                  <div className="p-6 flex-1 flex flex-col justify-between">
                    <div>
                      <h4 className="text-xl font-bold uppercase tracking-tight text-white group-hover:text-white transition-colors mb-2 line-clamp-1">
                        {event.title}
                      </h4>
                      <p className="text-white/50 text-xs line-clamp-2 mb-4">{event.shortDescription || event.description}</p>
                    </div>
                    <div className="border-t border-white/10 pt-4 flex justify-between items-center text-[10px] font-mono text-white/40">
                      <span>{new Date(event.startDate).toLocaleDateString()}</span>
                      <span className="font-bold text-white uppercase tracking-widest">
                        {event.ticketTypes[0]?.price === 0 ? 'FREE' : `FROM ₹${event.ticketTypes[0]?.price || 'N/A'}`}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Venues Grid */}
        <div className="mb-20">
          <div className="flex justify-between items-end mb-8 border-b border-white/10 pb-4">
            <div>
              <h2 className="text-2xl sm:text-4xl font-bold tracking-tight uppercase">Featured Local Spots</h2>
              <p className="text-white/40 text-xs mt-1">High-vibe clubs, open decks, and premium lounges.</p>
            </div>
            <Link to="/explore" className="text-[10px] font-bold uppercase tracking-widest text-white/50 hover:text-white flex items-center gap-2 transition-colors">
              Explore Spots <ArrowRight size={14} />
            </Link>
          </div>

          {venues.length === 0 ? (
            <div className="border border-white/10 p-16 text-center bg-white/[0.01]">
              <Compass className="mx-auto text-white/20 mb-4" size={40} />
              <p className="text-white/40 text-sm font-mono uppercase tracking-widest">No local spot listings found.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {venues.slice(0, 4).map(venue => (
                <div
                  key={venue._id}
                  onClick={() => navigate(`/venue/${venue._id}`)}
                  className="group cursor-pointer border border-white/10 bg-white/[0.02] hover:border-white transition-colors duration-500 overflow-hidden"
                >
                  <div className="h-40 overflow-hidden relative grayscale opacity-70 group-hover:opacity-100 transition-opacity">
                    <img src={venue.img} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" alt={venue.name} />
                  </div>
                  <div className="p-4">
                    <h4 className="text-sm font-bold uppercase tracking-tight text-white truncate">{venue.name}</h4>
                    <div className="flex justify-between items-center text-[9px] text-white/40 tracking-wider uppercase mt-2 font-mono">
                      <span>{venue.type}</span>
                      <span>★ {venue.rating}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Dynamic Trust and Onboarding Grid */}
        <div className="grid md:grid-cols-3 gap-8 mb-20">
          <div className="border border-white/10 p-8 bg-white/[0.01]">
            <ShieldCheck className="text-brand-accent mb-4" size={32} />
            <h4 className="text-lg font-bold uppercase mb-2">Safety Center</h4>
            <p className="text-white/50 text-xs leading-relaxed">
              We vet local hosts and organizers. Event listings detail dress codes, couple/stag entries, wheelchair access, and staff presence for absolute transparency.
            </p>
          </div>
          
          <div className="border border-white/10 p-8 bg-white/[0.01]">
            <Users className="text-brand-accent mb-4" size={32} />
            <h4 className="text-lg font-bold uppercase mb-2">Organizer Hub</h4>
            <p className="text-white/50 text-xs leading-relaxed">
              Are you an artist, DJ, community leader, or nightclub manager? Join NightNova to deploy your own experiences and scan tickets seamlessly.
            </p>
            <Link to="/dashboard" className="text-[10px] font-bold uppercase tracking-widest text-brand-accent mt-4 inline-flex items-center gap-1">
              Start Listing <ArrowRight size={12} />
            </Link>
          </div>

          <div className="border border-white/10 p-8 bg-white/[0.01]">
            <HelpCircle className="text-brand-accent mb-4" size={32} />
            <h4 className="text-lg font-bold uppercase mb-2">Community Suggestion</h4>
            <form onSubmit={handleCommunitySubmit} className="mt-4 flex flex-col gap-2">
              <input
                type="text"
                value={submittingLink}
                onChange={e => setSubmittingLink(e.target.value)}
                placeholder="EVENT TICKET OR INSTAGRAM LINK"
                className="w-full bg-black border border-white/20 px-3 py-2 text-[10px] font-bold tracking-widest uppercase text-white focus:border-white focus:outline-none rounded-none"
              />
              <button type="submit" className="w-full bg-white text-black font-bold text-[9px] uppercase tracking-widest py-2 hover:bg-white/80 transition-colors">
                Suggest Event
              </button>
              {submissionSuccess && (
                <span className="text-[9px] font-mono text-green-400 mt-1 uppercase">Received! We will moderate and index it.</span>
              )}
            </form>
          </div>
        </div>

      </div>
    </div>
  )
}
