import { useState, useEffect } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Users, Calendar, Vote, Link as LinkIcon, Plus, CheckCircle, Search, Compass, Loader2 } from 'lucide-react'
import { API } from '../config'
import { useAuth } from '../hooks/useAuth'

export default function GroupPlanner() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { user } = useAuth()
  
  // States
  const [plan, setPlan] = useState(null)
  const [tallies, setTallies] = useState({})
  const [loading, setLoading] = useState(true)
  const [selectedVotes, setSelectedVotes] = useState([])
  const [groupName, setGroupName] = useState('')
  const [creating, setCreating] = useState(false)
  const [isCopied, setIsCopied] = useState(false)

  // 1. Fetch Plan Details
  useEffect(() => {
    if (!id || id === 'new') {
      setLoading(false)
      return
    }
    fetchPlanData()
  }, [id])

  const fetchPlanData = async () => {
    setLoading(true)
    try {
      const res = await fetch(`${API}/groups/${id}`)
      const data = await res.json()
      if (res.ok) {
        setPlan(data.plan)
        setTallies(data.tallies)
        
        // Find current user's votes
        if (user) {
          const userId = user.id || user._id
          const userVotes = data.plan.votes
            .filter(v => v.userId === userId)
            .map(v => v.eventId)
          setSelectedVotes(userVotes)
        }
      }
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  // 2. Create Group Plan
  const handleCreatePlan = async (e) => {
    e.preventDefault()
    if (!groupName.trim()) return
    setCreating(true)
    try {
      const token = localStorage.getItem('nn_token')
      const res = await fetch(`${API}/groups`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ name: groupName.trim() })
      })
      const data = await res.json()
      if (res.ok) {
        navigate(`/group/${data._id}`)
      } else {
        alert(data.message)
      }
    } catch (err) {
      console.error(err)
    }
    setCreating(false)
  }

  // 3. Join Group Plan
  const handleJoinPlan = async () => {
    if (!user) {
      navigate('/auth')
      return
    }
    setLoading(true)
    try {
      const token = localStorage.getItem('nn_token')
      const res = await fetch(`${API}/groups/${id}/join`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` }
      })
      if (res.ok) {
        await fetchPlanData()
      }
    } catch (err) {
      console.error(err)
    }
    setLoading(false)
  }

  // 4. Submit Votes
  const handleSubmitVotes = async () => {
    if (!user) {
      navigate('/auth')
      return
    }
    setLoading(true)
    try {
      const token = localStorage.getItem('nn_token')
      const res = await fetch(`${API}/groups/${id}/vote`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ eventIds: selectedVotes })
      })
      if (res.ok) {
        await fetchPlanData()
      }
    } catch (err) {
      console.error(err)
    }
    setLoading(false)
  }

  const toggleVoteSelection = (eventId) => {
    setSelectedVotes(prev =>
      prev.includes(eventId) ? prev.filter(x => x !== eventId) : [...prev, eventId]
    )
  }

  const copyInviteLink = () => {
    navigator.clipboard.writeText(window.location.href)
    setIsCopied(true)
    setTimeout(() => setIsCopied(false), 2000)
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-brand-dark flex items-center justify-center text-white">
        <div className="w-12 h-12 border-4 border-white/10 border-t-brand-accent rounded-full animate-spin" />
      </div>
    )
  }

  // CREATE NEW PLAN SCENARIO
  if (!id || id === 'new') {
    return (
      <div className="min-h-screen bg-black text-white flex items-center justify-center p-6 relative overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(124,58,237,0.1),rgba(0,0,0,0))] pointer-events-none z-0" />
        
        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="w-full max-w-md p-8 sm:p-12 border border-white/10 bg-white/[0.01] backdrop-blur-md relative z-10 space-y-6"
        >
          <div className="text-center space-y-2">
            <Users size={32} className="mx-auto text-brand-accent animate-pulse" />
            <h2 className="text-2xl font-bold uppercase tracking-widest">Create Group Plan</h2>
            <p className="text-white/40 text-xs uppercase font-mono">Invite friends & vote on coordinate events</p>
          </div>

          <form onSubmit={handleCreatePlan} className="space-y-6">
            <div className="space-y-2">
              <label className="text-[9px] font-mono uppercase tracking-widest text-white/40 block">Group Grid Name</label>
              <input
                type="text"
                value={groupName}
                onChange={e => setGroupName(e.target.value)}
                placeholder="e.g. Goa Trip Weekend / Saturday Raves"
                className="w-full bg-white/[0.02] border border-white/15 px-4 py-3 text-xs text-white focus:outline-none focus:border-white uppercase tracking-wider"
                required
              />
            </div>

            {!user ? (
              <Link 
                to="/auth"
                className="w-full bg-white text-black py-4 hover:bg-white/80 transition-all font-bold uppercase tracking-widest text-[9px] block text-center border border-white"
              >
                Authenticate Identity
              </Link>
            ) : (
              <button
                type="submit"
                disabled={creating}
                className="w-full bg-white text-black py-4 hover:bg-white/80 transition-all font-bold uppercase tracking-widest text-[9px] flex items-center justify-center gap-2 border border-white"
              >
                {creating && <Loader2 className="animate-spin" size={14} />}
                Deploy Group Plan
              </button>
            )}
          </form>
        </motion.div>
      </div>
    )
  }

  const userId = user?.id || user?._id
  const isMember = plan?.members?.some(m => m.userId === userId)
  
  // Find highest voted event
  let winningEventId = null;
  let maxVotes = 0;
  Object.keys(tallies).forEach(eId => {
    if (tallies[eId] > maxVotes) {
      maxVotes = tallies[eId];
      winningEventId = eId;
    }
  });

  return (
    <div className="min-h-screen bg-black text-white pt-28 pb-20 px-6 sm:px-10 relative overflow-hidden font-sans">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(124,58,237,0.1),rgba(0,0,0,0))] pointer-events-none z-0" />

      <div className="max-w-6xl mx-auto relative z-10 grid lg:grid-cols-3 gap-10">
        
        {/* Left Column: Plan Info and Friends */}
        <div className="lg:col-span-1 space-y-8">
          
          {/* Plan Header */}
          <div className="border border-white/10 bg-white/[0.01] p-8 space-y-4">
            <span className="text-[8px] font-mono text-brand-accent tracking-widest uppercase block">Group Plan Grid</span>
            <h2 className="text-3xl font-black uppercase tracking-tight leading-none text-white">{plan.name}</h2>
            <p className="text-white/40 text-[9px] uppercase font-mono">Created by: {plan.creatorId?.name || 'Unknown'}</p>
            
            <button
              onClick={copyInviteLink}
              className="w-full py-3 border border-white/15 hover:border-white text-[9px] font-bold uppercase tracking-widest flex items-center justify-center gap-2 transition-all bg-black/40"
            >
              <LinkIcon size={12} />
              {isCopied ? 'Link Copied' : 'Invite Friends'}
            </button>
          </div>

          {/* Members list */}
          <div className="border border-white/10 bg-white/[0.01] p-8 space-y-4">
            <span className="text-[9px] font-bold uppercase tracking-widest text-white/50 block pb-3 border-b border-white/10">Active Crew ({plan.members?.length || 0})</span>
            <div className="space-y-3">
              {plan.members?.map(m => (
                <div key={m.userId} className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-none border border-white/10 flex items-center justify-center text-[10px] font-bold bg-white/5 uppercase">
                    {m.name?.charAt(0)}
                  </div>
                  <div>
                    <div className="text-xs font-bold uppercase text-white">{m.name}</div>
                    <span className="text-[8px] font-mono text-white/30 uppercase">{m.email}</span>
                  </div>
                </div>
              ))}
            </div>

            {!isMember && (
              <button
                onClick={handleJoinPlan}
                className="w-full mt-4 bg-white text-black hover:bg-white/80 py-3 font-bold uppercase tracking-widest text-[9px] border border-white transition-all"
              >
                Join Group Plan
              </button>
            )}
          </div>
        </div>

        {/* Right Column: Shortlisted Events and Voting */}
        <div className="lg:col-span-2 space-y-8">
          <div className="flex justify-between items-end border-b border-white/10 pb-4">
            <div>
              <h2 className="text-2xl font-bold uppercase tracking-wider">Shortlisted Coordinates</h2>
              <p className="text-white/40 text-xs mt-1">Vote for the experiences you want to attend.</p>
            </div>
            {isMember && (
              <button
                onClick={handleSubmitVotes}
                className="bg-white text-black hover:bg-white/90 px-5 py-3 font-bold uppercase tracking-widest text-[9px] border border-white transition-all flex items-center gap-2"
              >
                <Vote size={14} />
                Submit Votes
              </button>
            )}
          </div>

          {plan.events?.length === 0 ? (
            <div className="border border-white/10 p-16 text-center bg-white/[0.01] space-y-6">
              <Compass className="mx-auto text-white/20 animate-pulse" size={32} />
              <p className="text-white/40 text-xs uppercase tracking-widest font-mono">Shortlist is empty. Search events and add them here.</p>
              <Link to="/explore" className="bg-white text-black px-5 py-3 text-[9px] font-bold uppercase tracking-widest hover:bg-white/80 inline-block border border-white">Browse Grid</Link>
            </div>
          ) : (
            <div className="space-y-4">
              {plan.events.map(event => {
                const isWinning = winningEventId === event._id.toString();
                const isChecked = selectedVotes.includes(event._id.toString());
                const voteCount = tallies[event._id.toString()] || 0;

                return (
                  <div 
                    key={event._id}
                    onClick={() => isMember && toggleVoteSelection(event._id.toString())}
                    className={`border p-5 flex justify-between items-center transition-all ${
                      isWinning ? 'border-brand-accent bg-brand-accent/5' : 'border-white/10 bg-white/[0.01]'
                    } ${isMember ? 'cursor-pointer hover:border-white' : ''}`}
                  >
                    <div className="flex gap-4 items-center">
                      {isMember && (
                        <div className={`w-5 h-5 border flex items-center justify-center ${
                          isChecked ? 'bg-white border-white text-black' : 'border-white/20 bg-black'
                        }`}>
                          {isChecked && '✓'}
                        </div>
                      )}
                      <div>
                        <div className="flex items-center gap-2">
                          <h4 className="text-base font-bold uppercase tracking-tight text-white">{event.title}</h4>
                          {isWinning && maxVotes > 0 && (
                            <span className="bg-brand-accent/20 text-brand-light text-[8px] font-mono font-bold uppercase px-2 py-0.5 border border-brand-accent/30">
                              Winning Option
                            </span>
                          )}
                        </div>
                        <span className="text-[9px] font-mono text-white/40 uppercase tracking-widest mt-1 block">
                          {new Date(event.startDate).toLocaleDateString()} — {event.category}
                        </span>
                      </div>
                    </div>

                    <div className="flex flex-col items-end">
                      <span className="text-xl font-bold font-mono text-white">{voteCount}</span>
                      <span className="text-[8px] font-mono text-white/40 uppercase">votes</span>
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </div>

      </div>
    </div>
  )
}
