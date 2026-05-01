import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { MessageSquare, Send, User, AlertCircle, CheckCircle2 } from 'lucide-react'
import { API } from '../config'
import { useAuth } from '../hooks/useAuth'
import StarRating from './StarRating'

export default function ReviewsSection({ venueId }) {
  const { user } = useAuth()
  const [reviews, setReviews] = useState([])
  const [rating, setRating] = useState(5)
  const [comment, setComment] = useState('')
  const [loading, setLoading] = useState(false)
  const [fetching, setFetching] = useState(true)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)

  useEffect(() => {
    fetchReviews()
  }, [venueId])

  const fetchReviews = async () => {
    try {
      const res = await fetch(`${API}/reviews/venue/${venueId}`)
      const data = await res.json()
      setReviews(Array.isArray(data) ? data : [])
    } catch (err) {
      console.error('Error fetching reviews:', err)
    } finally {
      setFetching(false)
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!comment.trim()) return
    setLoading(true)
    setError('')
    setSuccess(false)

    try {
      const token = localStorage.getItem('nn_token')
      const res = await fetch(`${API}/reviews`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ venueId, rating, comment })
      })

      const data = await res.json()
      if (!res.ok) throw new Error(data.message || 'Failed to post review')

      setSuccess(true)
      setComment('')
      setRating(5)
      fetchReviews() // Refresh the list
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="glass p-8 md:p-12 rounded-[2.5rem] border border-white/5">
      <div className="flex items-center justify-between mb-10">
        <div>
          <h3 className="text-[10px] uppercase tracking-[0.25em] font-bold text-white/40 mb-2">Social Feedback</h3>
          <h2 className="text-3xl font-bold text-white tracking-tight">Vibe Reports</h2>
        </div>
        <div className="flex items-center gap-3 bg-white/5 border border-white/5 px-4 py-2 rounded-full">
          <MessageSquare size={14} className="text-brand-accent" />
          <span className="text-[10px] font-bold text-white/60 tracking-widest uppercase">{reviews.length} Intel Packets</span>
        </div>
      </div>

      {/* Review Form */}
      {user ? (
        <div className="mb-16 p-8 border border-white/10 bg-black/40 rounded-3xl relative overflow-hidden group">
          <div className="absolute top-0 right-0 w-32 h-32 bg-brand-accent/5 blur-3xl -mr-16 -mt-16 pointer-events-none" />
          
          <form onSubmit={handleSubmit} className="relative z-10 space-y-6">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-white/60">Broadcast Your Intel</span>
              <StarRating rating={rating} setRating={setRating} interactive size={20} />
            </div>

            <div className="relative">
              <textarea
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                placeholder="How's the energy? How's the music? Any gatekeeping?"
                className="w-full bg-white/5 border border-white/10 rounded-2xl p-6 text-sm text-white placeholder-white/20 focus:outline-none focus:border-brand-accent/50 transition-all h-32 resize-none"
              />
            </div>

            <div className="flex items-center justify-between gap-6">
              <AnimatePresence>
                {error && (
                  <motion.div initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} className="flex items-center gap-2 text-red-500 text-[10px] font-bold uppercase tracking-widest">
                    <AlertCircle size={14} /> {error}
                  </motion.div>
                )}
                {success && (
                  <motion.div initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} className="flex items-center gap-2 text-brand-neon text-[10px] font-bold uppercase tracking-widest">
                    <CheckCircle2 size={14} /> Intel Transmitted Successfully
                  </motion.div>
                )}
              </AnimatePresence>

              <button
                type="submit"
                disabled={loading || !comment.trim()}
                className="bg-white text-black hover:bg-brand-accent hover:text-white transition-all px-8 py-4 font-bold uppercase tracking-[0.2em] text-[10px] flex items-center gap-3 disabled:opacity-30 disabled:hover:bg-white disabled:hover:text-black"
              >
                {loading ? 'Transmitting...' : (
                  <>
                    Deploy Report <Send size={14} />
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      ) : (
        <div className="mb-16 p-10 border border-white/10 border-dashed rounded-3xl text-center">
          <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-white/30 mb-6 italic">Authentication required to deploy vibe reports</p>
          <button className="px-8 py-4 bg-white/5 border border-white/10 text-white text-[10px] font-bold uppercase tracking-widest hover:bg-white hover:text-black transition-all">
            Secure Session Entry
          </button>
        </div>
      )}

      {/* Reviews List */}
      <div className="space-y-6">
        {fetching ? (
          <div className="space-y-6">
            {[1, 2].map(i => (
              <div key={i} className="h-32 border border-white/5 rounded-3xl animate-pulse bg-white/5" />
            ))}
          </div>
        ) : reviews.length === 0 ? (
          <div className="py-20 text-center border border-white/5 rounded-3xl bg-black/20">
            <p className="text-[10px] font-mono font-bold uppercase tracking-[0.4em] text-white/20">No Intel packets discovered in this grid</p>
          </div>
        ) : (
          reviews.map((review) => (
            <motion.div
              key={review._id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="p-8 border border-white/5 bg-white/[0.02] rounded-3xl group hover:border-white/10 transition-colors"
            >
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-brand-accent/20 to-brand-accent/40 border border-white/10 flex items-center justify-center text-white/60">
                    <User size={20} />
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-white uppercase tracking-tight">{review.userId?.name}</h4>
                    <div className="flex items-center gap-3 mt-1">
                      <StarRating rating={review.rating} size={10} />
                      <span className="text-[8px] font-bold uppercase tracking-widest text-white/20 font-mono">
                        {new Date(review.createdAt).toLocaleDateString()}
                      </span>
                    </div>
                  </div>
                </div>
                {review.sentiment && (
                   <span className={`px-2 py-1 rounded-full text-[8px] font-bold uppercase tracking-widest border ${
                     review.sentiment === 'positive' ? 'bg-green-500/10 text-green-500 border-green-500/20' :
                     review.sentiment === 'negative' ? 'bg-red-500/10 text-red-500 border-red-500/20' :
                     'bg-white/10 text-white/40 border-white/10'
                   }`}>
                     {review.sentiment}
                   </span>
                )}
              </div>
              <p className="text-white/60 text-sm leading-relaxed pl-16">
                {review.comment}
              </p>
            </motion.div>
          ))
        )}
      </div>
    </div>
  )
}
