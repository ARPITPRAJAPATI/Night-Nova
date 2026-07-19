import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { QrCode, Search, ShieldCheck, ShieldAlert, Loader2, Sparkles, UserCheck, ArrowLeft } from 'lucide-react'
import { API } from '../config'
import { Link } from 'react-router-dom'

export default function CheckInConsole() {
  const [ticketToken, setTicketToken] = useState('')
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState(null) // { success: boolean, message: string, booking: obj }
  const [history, setHistory] = useState([]) // check-in history in current session

  const handleCheckIn = async (e) => {
    e.preventDefault()
    if (!ticketToken.trim()) return
    
    setLoading(true)
    setResult(null)
    
    try {
      const token = localStorage.getItem('nn_token')
      const res = await fetch(`${API}/bookings/checkin`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ qrCodeToken: ticketToken.trim().toUpperCase() })
      })
      const data = await res.json()

      if (res.ok) {
        setResult({ success: true, message: data.message, booking: data.booking })
        setHistory(prev => [data.booking, ...prev])
        setTicketToken('')
      } else {
        setResult({ 
          success: false, 
          message: data.message || 'Ticket verification failed.', 
          checkedInAt: data.checkedInAt 
        })
      }
    } catch (err) {
      setResult({ success: false, message: 'Server transmission error: ' + err.message })
    }
    setLoading(false)
  }

  return (
    <div className="min-h-screen bg-black text-white pt-28 pb-20 px-6 sm:px-10 relative overflow-hidden font-sans">
      {/* Grid background */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(34,197,94,0.06),rgba(0,0,0,0))] pointer-events-none z-0" />

      <div className="max-w-4xl mx-auto relative z-10 grid md:grid-cols-5 gap-10">
        
        {/* Main Scanner Section (3 columns) */}
        <div className="md:col-span-3 space-y-8">
          <div>
            <Link to="/dashboard" className="text-[10px] font-bold uppercase tracking-widest text-white/50 hover:text-white flex items-center gap-1.5 mb-4">
              <ArrowLeft size={12} /> Dashboard Control
            </Link>
            <h1 className="text-3xl sm:text-5xl font-black tracking-tighter uppercase leading-none">
              Gate <span className="text-transparent" style={{ WebkitTextStroke: '1px white' }}>Scanner.</span>
            </h1>
            <p className="text-white/40 text-xs uppercase font-mono mt-2">Verify ticket credentials in real-time.</p>
          </div>

          {/* Form console */}
          <form onSubmit={handleCheckIn} className="border border-white/10 bg-white/[0.01] p-6 space-y-6">
            <div className="space-y-2">
              <label className="text-[9px] font-mono uppercase tracking-widest text-white/40 block">Input Ticket Token Key</label>
              <div className="flex border border-white/20 p-1 focus-within:border-white transition-colors bg-black/60">
                <input
                  type="text"
                  value={ticketToken}
                  onChange={e => setTicketToken(e.target.value)}
                  placeholder="TKT-XXXXXXXXXXXX"
                  className="flex-1 bg-transparent px-4 py-3 text-sm font-mono text-white focus:outline-none placeholder-white/20 uppercase"
                  required
                />
                <button 
                  type="submit" 
                  disabled={loading}
                  className="bg-white text-black hover:bg-white/80 px-6 py-3 font-bold uppercase tracking-widest text-[10px] transition-all flex items-center gap-1.5"
                >
                  {loading ? <Loader2 className="animate-spin" size={14} /> : <Search size={14} />}
                  Verify
                </button>
              </div>
            </div>
          </form>

          {/* Verification Results Panel */}
          <AnimatePresence mode="wait">
            {result && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className={`border p-8 text-center space-y-4 ${
                  result.success 
                    ? 'border-green-500 bg-green-500/5' 
                    : 'border-red-500 bg-red-500/5'
                }`}
              >
                {result.success ? (
                  <>
                    <div className="w-12 h-12 bg-green-500 text-black mx-auto rounded-full flex items-center justify-center font-bold text-lg">
                      ✓
                    </div>
                    <div>
                      <h3 className="text-xl font-bold text-green-400 uppercase tracking-wide">Access Granted</h3>
                      <p className="text-white/80 text-xs font-bold uppercase mt-2">{result.booking?.attendee}</p>
                      <p className="text-white/40 text-[10px] font-mono mt-1 uppercase">
                        {result.booking?.quantity}x {result.booking?.ticketType}
                      </p>
                    </div>
                  </>
                ) : (
                  <>
                    <div className="w-12 h-12 bg-red-500 text-white mx-auto rounded-full flex items-center justify-center font-bold text-lg">
                      ✕
                    </div>
                    <div>
                      <h3 className="text-xl font-bold text-red-500 uppercase tracking-wide">Access Denied</h3>
                      <p className="text-white/70 text-xs mt-2 uppercase font-mono">{result.message}</p>
                      {result.checkedInAt && (
                        <p className="text-white/40 text-[9px] font-mono mt-1 uppercase">
                          Checked-in: {new Date(result.checkedInAt).toLocaleString()}
                        </p>
                      )}
                    </div>
                  </>
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Sidebar Session Stats & History (2 columns) */}
        <div className="md:col-span-2 space-y-6">
          <div className="border border-white/10 p-6 bg-white/[0.01]">
            <div className="flex justify-between items-center pb-3 border-b border-white/10 mb-4">
              <span className="text-[10px] font-bold uppercase tracking-widest text-white/50">Scanner Session</span>
              <UserCheck size={16} className="text-green-500" />
            </div>
            <div className="flex items-baseline gap-2">
              <span className="text-4xl font-bold font-mono text-white">{history.length}</span>
              <span className="text-[10px] font-mono text-white/40 uppercase">verified scans</span>
            </div>
          </div>

          <div className="border border-white/10 p-6 bg-white/[0.01] space-y-4">
            <span className="text-[10px] font-bold uppercase tracking-widest text-white/50 block pb-3 border-b border-white/10">Session Log</span>
            
            {history.length === 0 ? (
              <p className="text-[9px] font-mono text-white/30 uppercase text-center py-10">No scans in this session yet.</p>
            ) : (
              <div className="space-y-2 max-h-60 overflow-y-auto pr-1">
                {history.map((h, i) => (
                  <div key={i} className="border border-white/5 bg-black/40 p-3 text-[10px] font-mono uppercase tracking-wider flex justify-between items-center">
                    <div>
                      <div className="font-bold text-white leading-none">{h.attendee}</div>
                      <span className="text-[8px] text-white/40 mt-1 block">{h.ticketType}</span>
                    </div>
                    <div className="text-right">
                      <div className="text-green-400 font-bold">● Scan ok</div>
                      <span className="text-[8px] text-white/30">{new Date(h.checkedInAt).toLocaleTimeString()}</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

      </div>
    </div>
  )
}
