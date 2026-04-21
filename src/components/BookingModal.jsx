import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X, Calendar, Users, Star, CheckCircle2, Loader2 } from 'lucide-react'
import { API } from '../config'
import { useAuth } from '../hooks/useAuth'

export default function BookingModal({ venue, onClose }) {
  const { user } = useAuth()
  const [step, setStep] = useState(1)
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)
  const [formData, setFormData] = useState({
    date: new Date().toISOString().split('T')[0],
    guests: 2,
    tableType: 'General'
  })

  const tableTypes = [
    { name: 'General', desc: 'Sofa seating with min spend', price: '₹15k' },
    { name: 'VIP', desc: 'Near the DJ booth + host', price: '₹30k' },
    { name: 'VVIP Booth', desc: 'Elevated private section', price: '₹50k' },
    { name: 'Ultra Lounge', desc: 'Exclusive backroom access', price: '₹100k' }
  ]

  const handleBooking = async () => {
    setLoading(true)
    try {
      const token = localStorage.getItem('nn_token')
      const res = await fetch(`${API}/bookings`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          venueId: venue._id,
          date: formData.date,
          guests: formData.guests,
          tableType: formData.tableType
        })
      })
      if (!res.ok) throw new Error('Booking failed')
      setSuccess(true)
    } catch (err) {
      alert(err.message)
    }
    setLoading(false)
  }

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 sm:p-10">
      <motion.div 
        initial={{ opacity: 0 }} 
        animate={{ opacity: 1 }} 
        exit={{ opacity: 0 }}
        onClick={onClose}
        className="absolute inset-0 bg-brand-dark/90 backdrop-blur-xl"
      />

      <motion.div
        initial={{ scale: 0.9, opacity: 0, y: 20 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        exit={{ scale: 0.9, opacity: 0, y: 20 }}
        className="w-full max-w-xl max-h-[90vh] overflow-y-auto glass rounded-[2.5rem] border border-white/10 shadow-2xl relative z-10"
      >
        <button onClick={onClose} className="absolute top-6 right-6 w-10 h-10 rounded-full glass hover:bg-white/10 transition-all flex items-center justify-center z-20 border border-white/5">
          <X size={20} className="text-white/60" />
        </button>

        {success ? (
          <div className="p-12 text-center flex flex-col items-center gap-6">
            <div className="w-20 h-20 rounded-full bg-brand-neon/20 flex items-center justify-center text-brand-neon shadow-[0_0_40px_rgba(34,197,94,0.3)]">
              <CheckCircle2 size={40} />
            </div>
            <h2 className="text-3xl font-bold text-white tracking-tight">Booking Requested</h2>
            <p className="text-white/50 text-sm font-medium leading-relaxed max-w-xs mx-auto">
              Your request for {venue.name} has been received. You will receive a confirmation pulse shortly.
            </p>
            <button 
              onClick={onClose}
              className="mt-4 px-8 py-4 rounded-2xl bg-white/5 text-white font-bold uppercase tracking-widest text-[10px] border border-white/10"
            >
              Back to Portal
            </button>
          </div>
        ) : (
          <div className="p-8 sm:p-12">
            <div className="mb-10">
              <h3 className="text-[10px] font-bold uppercase tracking-[0.3em] text-brand-accent mb-1">VIP Reservation</h3>
              <h2 className="text-3xl font-bold text-white tracking-tight">{venue.name}</h2>
            </div>

            <div className="space-y-8">
              {/* Step 1: Details */}
              {step === 1 && (
                <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }}>
                  <div className="grid grid-cols-2 gap-6 mb-8">
                    <div>
                      <label className="text-[10px] font-mono uppercase tracking-widest text-white/50 mb-3 block">Date</label>
                      <div className="relative">
                        <Calendar size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-white" />
                        <input 
                          type="date"
                          value={formData.date}
                          onChange={e => setFormData({...formData, date: e.target.value})}
                          className="w-full bg-transparent border border-white/20 pl-12 pr-4 py-4 text-sm text-white focus:outline-none focus:border-white transition-all rounded-none"
                        />
                      </div>
                    </div>
                    <div>
                      <label className="text-[10px] font-mono uppercase tracking-widest text-white/50 mb-3 block">Guests</label>
                      <div className="relative">
                        <Users size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-white" />
                        <input 
                          type="number"
                          min="1"
                          max="20"
                          value={formData.guests}
                          onChange={e => setFormData({...formData, guests: e.target.value})}
                          className="w-full bg-transparent border border-white/20 pl-12 pr-4 py-4 text-sm text-white focus:outline-none focus:border-white transition-all rounded-none"
                        />
                      </div>
                    </div>
                  </div>

                  <label className="text-[10px] font-mono uppercase tracking-widest text-white/50 mb-4 block">Select Table Type</label>
                  <div className="grid gap-3">
                    {tableTypes.map((t) => (
                      <button
                        key={t.name}
                        onClick={() => setFormData({...formData, tableType: t.name})}
                        className={`text-left p-5 border transition-all flex justify-between items-center group rounded-none ${
                          formData.tableType === t.name 
                            ? 'bg-white border-white text-black' 
                            : 'bg-transparent border-white/20 hover:border-white hover:bg-white hover:text-black text-white'
                        }`}
                      >
                        <div>
                          <div className={`text-sm font-bold ${formData.tableType === t.name ? 'text-black' : 'text-white group-hover:text-black'}`}>{t.name}</div>
                          <div className={`text-[10px] font-medium ${formData.tableType === t.name ? 'text-black/60' : 'text-white/30 group-hover:text-black/60'}`}>{t.desc}</div>
                        </div>
                        <div className="flex flex-col items-end">
                           <div className={`text-xs font-mono font-bold ${formData.tableType === t.name ? 'text-black' : 'text-white group-hover:text-black'}`}>Min. {t.price}</div>
                           <div className={`text-[8px] font-bold uppercase tracking-wider ${formData.tableType === t.name ? 'text-black/40' : 'text-white/20 group-hover:text-black/40'}`}>Spend</div>
                        </div>
                      </button>
                    ))}
                  </div>

                  {!user ? (
                    <Link 
                      to="/auth"
                      className="w-full mt-10 bg-white text-black border border-white hover:bg-black hover:text-white font-bold uppercase tracking-[0.2em] text-[10px] py-6 rounded-none flex items-center justify-center gap-2 transition-all"
                    >
                      Sign In to Continue
                    </Link>
                  ) : (
                    <button 
                      onClick={() => setStep(2)}
                      className="w-full mt-10 bg-white text-black font-bold uppercase tracking-[0.2em] text-[10px] py-6 rounded-none border border-white hover:bg-black hover:text-white transition-all"
                    >
                      Confirm Details
                    </button>
                  )}
                </motion.div>
              )}

              {/* Step 2: Confirmation */}
              {step === 2 && (
                <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="space-y-8">
                  <div className="bg-transparent rounded-none p-8 border border-white/20 space-y-6">
                    <div className="flex justify-between items-center pb-6 border-b border-white/20">
                      <span className="text-[10px] font-mono text-white/50 uppercase tracking-widest">Selected Experience</span>
                      <span className="text-sm font-bold text-white uppercase tracking-widest">{formData.tableType}</span>
                    </div>
                    <div className="grid grid-cols-2 gap-10">
                      <div>
                        <div className="text-[9px] font-mono text-white/50 uppercase tracking-widest mb-1">Guests</div>
                        <div className="text-xl font-bold text-white font-mono">{formData.guests}</div>
                      </div>
                      <div>
                        <div className="text-[9px] font-mono text-white/50 uppercase tracking-widest mb-1">Date</div>
                        <div className="text-xl font-bold text-white font-mono">{new Date(formData.date).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}</div>
                      </div>
                    </div>
                  </div>

                  <div className="flex gap-4">
                    <button 
                      onClick={() => setStep(1)}
                      className="flex-1 bg-transparent text-white/50 font-bold uppercase tracking-[0.2em] text-[10px] py-6 rounded-none border border-white/20 hover:text-white hover:border-white transition-colors"
                    >
                      Edit
                    </button>
                    <button 
                      onClick={handleBooking}
                      disabled={loading}
                      className="flex-[2] bg-white text-black font-extrabold uppercase tracking-[0.2em] text-[10px] py-6 rounded-none hover:bg-white/80 transition-all flex items-center justify-center gap-3"
                    >
                      {loading ? <Loader2 className="animate-spin" size={18} /> : null}
                      {loading ? 'Transmitting…' : 'Finalize Request'}
                    </button>
                  </div>
                </motion.div>
              )}
            </div>
          </div>
        )}
      </motion.div>
    </div>
  )
}
