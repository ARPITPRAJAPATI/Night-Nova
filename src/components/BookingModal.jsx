import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X, Calendar, Users, Star, CheckCircle2, Loader2, CreditCard, ArrowRight, Smartphone } from 'lucide-react'
import { API } from '../config'
import { useAuth } from '../hooks/useAuth'
import { Link } from 'react-router-dom'

export default function BookingModal({ venue, event, onClose }) {
  const { user } = useAuth()
  const [step, setStep] = useState(1) // 1: Select details, 2: Review & Pay (Razorpay Mock), 3: Success
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)
  
  // Venue table form state
  const [tableForm, setTableForm] = useState({
    date: new Date().toISOString().split('T')[0],
    guests: 2,
    tableType: 'General'
  })

  // Event ticket form state
  const [ticketType, setTicketType] = useState(event?.ticketTypes?.[0]?.name || '')
  const [quantity, setQuantity] = useState(1)
  const [attendeePhone, setAttendeePhone] = useState('')
  const [paymentMethod, setPaymentMethod] = useState('upi') // upi or card
  const [bookingResult, setBookingResult] = useState(null)

  const tableTypes = [
    { name: 'General', desc: 'Sofa seating with min spend', price: '₹15k' },
    { name: 'VIP', desc: 'Near the DJ booth + host', price: '₹30k' },
    { name: 'VVIP Booth', desc: 'Elevated private section', price: '₹50k' },
    { name: 'Ultra Lounge', desc: 'Exclusive backroom access', price: '₹100k' }
  ]

  // Calculate pricing breakdown
  const selectedTier = event?.ticketTypes?.find(t => t.name === ticketType)
  const ticketPrice = selectedTier?.price || 0
  const subtotal = ticketPrice * quantity
  const convenienceFee = Math.round(subtotal * 0.05) // 5% fee
  const gst = Math.round((subtotal + convenienceFee) * 0.18) // 18% GST
  const totalAmount = subtotal + convenienceFee + gst

  const handleVenueBooking = async () => {
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
          date: tableForm.date,
          guests: tableForm.guests,
          tableType: tableForm.tableType
        })
      })
      if (!res.ok) throw new Error('Booking request transmission failed')
      setSuccess(true)
    } catch (err) {
      alert(err.message)
    }
    setLoading(false)
  }

  const handleEventBooking = async () => {
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
          eventId: event._id,
          ticketType,
          quantity,
          totalAmount: subtotal, // core subtotal to verify
          attendeeDetails: {
            name: user.name,
            email: user.email,
            phone: attendeePhone || '9999999999'
          }
        })
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.message || 'Ticket request failed')
      
      setBookingResult(data)

      // If free ticket, it confirms immediately on backend, step to success
      if (data.status === 'confirmed') {
        setSuccess(true)
      } else {
        // Move to mock payment check step
        setStep(2)
      }
    } catch (err) {
      alert(err.message)
    }
    setLoading(false)
  }

  const handleSimulatePayment = async () => {
    setLoading(true)
    try {
      // Simulate API callback check
      await new Promise(resolve => setTimeout(resolve, 1500))

      // Post to Payment Webhook
      const token = localStorage.getItem('nn_token')
      const res = await fetch(`${API}/bookings/payment-webhook`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          bookingId: bookingResult._id,
          paymentId: `PAY-${Math.random().toString(36).substring(2, 9).toUpperCase()}`,
          status: 'success'
        })
      })
      if (!res.ok) throw new Error('Payment confirmation failed')
      
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
        className="absolute inset-0 bg-brand-dark/95 backdrop-blur-2xl"
      />

      <motion.div
        initial={{ scale: 0.9, opacity: 0, y: 20 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        exit={{ scale: 0.9, opacity: 0, y: 20 }}
        className="w-full max-w-xl max-h-[90vh] overflow-y-auto glass border border-white/10 shadow-2xl relative z-10 rounded-none text-white"
      >
        <button onClick={onClose} className="absolute top-6 right-6 w-10 h-10 hover:bg-white/10 transition-all flex items-center justify-center z-20 border border-white/10">
          <X size={18} className="text-white" />
        </button>

        {success ? (
          <div className="p-10 text-center flex flex-col items-center gap-6">
            <div className="w-16 h-16 bg-white text-black flex items-center justify-center text-xl shadow-[0_0_30px_rgba(255,255,255,0.4)]">
              ✓
            </div>
            <h2 className="text-2xl font-bold uppercase tracking-widest text-white">Grid Slots Confirmed</h2>
            <p className="text-white/50 text-xs font-mono max-w-xs mx-auto leading-relaxed uppercase">
              {event ? `Passes are now active. Access QR Code in your personal dashboard.` : `Your request for table at ${venue?.name} has been received.`}
            </p>
            <div className="flex gap-2">
              <button 
                onClick={onClose}
                className="px-6 py-3 border border-white/10 text-white hover:border-white font-bold uppercase tracking-widest text-[9px]"
              >
                Close
              </button>
              <Link
                to="/dashboard"
                className="px-6 py-3 bg-white text-black font-bold uppercase tracking-widest text-[9px] hover:bg-white/90"
              >
                Go to Dashboard
              </Link>
            </div>
          </div>
        ) : (
          <div className="p-8 sm:p-10">
            
            {/* Header info */}
            <div className="mb-8">
              <span className="text-[9px] font-bold uppercase tracking-[0.25em] text-white/50 block font-mono">
                {event ? 'Event Pass Gateway' : 'Venue VIP Reservation'}
              </span>
              <h2 className="text-2xl font-bold uppercase tracking-tight mt-1 text-white">
                {event ? event.title : venue?.name}
              </h2>
            </div>

            {/* EVENT BOOKING - STEP 1 (Choose details) */}
            {event && step === 1 && (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
                <div>
                  <label className="text-[9px] font-mono uppercase tracking-widest text-white/40 block mb-2">Select Ticket Tier</label>
                  <div className="grid gap-2">
                    {event.ticketTypes?.map(tier => {
                      const avail = tier.capacity - tier.sold
                      return (
                        <button
                          key={tier.name}
                          type="button"
                          onClick={() => setTicketType(tier.name)}
                          className={`w-full text-left p-4 border transition-all flex justify-between items-center ${
                            ticketType === tier.name 
                              ? 'bg-white text-black border-white' 
                              : 'bg-transparent text-white border-white/15 hover:border-white'
                          }`}
                        >
                          <div>
                            <div className="text-xs font-bold uppercase">{tier.name}</div>
                            <div className="text-[8px] font-mono uppercase mt-1 opacity-60">{avail} spots remaining</div>
                          </div>
                          <div className="font-bold font-mono">
                            {tier.price === 0 ? 'FREE' : `₹${tier.price}`}
                          </div>
                        </button>
                      )
                    })}
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-[9px] font-mono uppercase tracking-widest text-white/40 block mb-2">Quantity</label>
                    <input 
                      type="number"
                      min="1"
                      max="10"
                      value={quantity}
                      onChange={e => setQuantity(Math.max(1, parseInt(e.target.value) || 1))}
                      className="w-full bg-white/[0.02] border border-white/15 px-3 py-3 text-xs text-white focus:outline-none focus:border-white font-mono"
                    />
                  </div>
                  <div>
                    <label className="text-[9px] font-mono uppercase tracking-widest text-white/40 block mb-2">Phone Number</label>
                    <input 
                      type="tel"
                      value={attendeePhone}
                      onChange={e => setAttendeePhone(e.target.value)}
                      placeholder="98765 43210"
                      className="w-full bg-white/[0.02] border border-white/15 px-3 py-3 text-xs text-white focus:outline-none focus:border-white font-mono"
                    />
                  </div>
                </div>

                {/* Subtotal summary */}
                {ticketPrice > 0 && (
                  <div className="border border-white/10 bg-white/[0.01] p-5 space-y-2 text-[10px] font-mono uppercase tracking-wider text-white/60">
                    <div className="flex justify-between"><span>Subtotal:</span><span className="text-white">₹{subtotal}</span></div>
                    <div className="flex justify-between"><span>Convenience Fee (5%):</span><span className="text-white">₹{convenienceFee}</span></div>
                    <div className="flex justify-between border-b border-white/10 pb-2"><span>GST (18%):</span><span className="text-white">₹{gst}</span></div>
                    <div className="flex justify-between font-bold text-xs text-white pt-1"><span>Total Bill:</span><span>₹{totalAmount}</span></div>
                  </div>
                )}

                {!user ? (
                  <Link 
                    to="/auth"
                    className="w-full bg-white text-black py-4 hover:bg-white/80 transition-all font-bold uppercase tracking-widest text-[9px] block text-center border border-white"
                  >
                    Authenticate Identity
                  </Link>
                ) : (
                  <button
                    onClick={handleEventBooking}
                    disabled={loading}
                    className="w-full bg-white text-black py-4 hover:bg-white/80 transition-all font-bold uppercase tracking-widest text-[9px] flex items-center justify-center gap-2 border border-white"
                  >
                    {loading && <Loader2 className="animate-spin" size={14} />}
                    {event.bookingModel === 'paid' ? 'Proceed to Checkout' : 'Claim Free Pass'}
                  </button>
                )}
              </motion.div>
            )}

            {/* EVENT BOOKING - STEP 2 (Razorpay Mock Sandbox Gateway) */}
            {event && step === 2 && (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
                
                {/* Razorpay Sandbox Brand */}
                <div className="border border-indigo-500/30 bg-indigo-500/5 p-5 text-center">
                  <div className="text-[8px] font-mono tracking-widest text-indigo-400 uppercase font-bold mb-1">RAZORPAY TEST GATEWAY</div>
                  <h4 className="text-lg font-bold text-white uppercase tracking-tight">Checkout Sandbox</h4>
                  <p className="text-[10px] text-white/50 mt-1 uppercase font-mono">Simulating secure merchant ledger transfer</p>
                </div>

                {/* Billing Summary */}
                <div className="border border-white/10 p-5 space-y-4">
                  <div className="flex justify-between items-center text-xs">
                    <span className="text-white/40 uppercase">Selected Passes:</span>
                    <span className="font-bold uppercase text-white font-mono">{quantity}x {ticketType}</span>
                  </div>
                  <div className="flex justify-between items-center text-xs border-t border-white/10 pt-4">
                    <span className="text-white/40 uppercase">Amount Due:</span>
                    <span className="text-xl font-bold text-white font-mono">₹{totalAmount}</span>
                  </div>
                </div>

                {/* Choose Fake Method */}
                <div className="grid grid-cols-2 gap-3">
                  <button
                    type="button"
                    onClick={() => setPaymentMethod('upi')}
                    className={`p-4 border text-[9px] font-bold uppercase tracking-widest flex flex-col items-center gap-2 ${
                      paymentMethod === 'upi' ? 'bg-white text-black border-white' : 'border-white/10 text-white hover:border-white'
                    }`}
                  >
                    <Smartphone size={16} />
                    UPI / QR Code
                  </button>
                  <button
                    type="button"
                    onClick={() => setPaymentMethod('card')}
                    className={`p-4 border text-[9px] font-bold uppercase tracking-widest flex flex-col items-center gap-2 ${
                      paymentMethod === 'card' ? 'bg-white text-black border-white' : 'border-white/10 text-white hover:border-white'
                    }`}
                  >
                    <CreditCard size={16} />
                    Credit Card
                  </button>
                </div>

                {/* Submit simulated Payment */}
                <button
                  onClick={handleSimulatePayment}
                  disabled={loading}
                  className="w-full bg-emerald-600 hover:bg-emerald-500 text-white py-5 font-bold uppercase tracking-widest text-[9px] flex items-center justify-center gap-2 transition-all border border-emerald-500"
                >
                  {loading ? <Loader2 className="animate-spin" size={14} /> : null}
                  {loading ? 'Processing Transaction…' : `Simulate Pay ₹${totalAmount}`}
                </button>
              </motion.div>
            )}

            {/* VENUE BOOKING (TABLE RESERVATION FLOW) */}
            {!event && venue && (
              <div className="space-y-6">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-[9px] font-mono uppercase tracking-widest text-white/40 block mb-2">Select Date</label>
                    <div className="relative">
                      <Calendar size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-white/50" />
                      <input 
                        type="date"
                        value={tableForm.date}
                        onChange={e => setTableForm({...tableForm, date: e.target.value})}
                        className="w-full bg-white/[0.02] border border-white/15 pl-10 pr-3 py-3 text-xs text-white focus:outline-none focus:border-white font-mono"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="text-[9px] font-mono uppercase tracking-widest text-white/40 block mb-2">Guests Count</label>
                    <div className="relative">
                      <Users size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-white/50" />
                      <input 
                        type="number"
                        min="1"
                        max="20"
                        value={tableForm.guests}
                        onChange={e => setTableForm({...tableForm, guests: parseInt(e.target.value) || 2})}
                        className="w-full bg-white/[0.02] border border-white/15 pl-10 pr-3 py-3 text-xs text-white focus:outline-none focus:border-white font-mono"
                      />
                    </div>
                  </div>
                </div>

                <div>
                  <label className="text-[9px] font-mono uppercase tracking-widest text-white/40 block mb-2">Select Table Class</label>
                  <div className="grid gap-2">
                    {tableTypes.map(t => (
                      <button
                        key={t.name}
                        type="button"
                        onClick={() => setTableForm({...tableForm, tableType: t.name})}
                        className={`w-full text-left p-4 border transition-all flex justify-between items-center ${
                          tableForm.tableType === t.name 
                            ? 'bg-white text-black border-white' 
                            : 'bg-transparent text-white border-white/15 hover:border-white'
                        }`}
                      >
                        <div>
                          <div className="text-xs font-bold uppercase">{t.name}</div>
                          <div className="text-[8px] font-mono uppercase mt-0.5 opacity-60">{t.desc}</div>
                        </div>
                        <div className="text-right">
                          <div className="font-bold text-xs">Min Spend {t.price}</div>
                        </div>
                      </button>
                    ))}
                  </div>
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
                    onClick={handleVenueBooking}
                    disabled={loading}
                    className="w-full bg-white text-black py-4 hover:bg-white/80 transition-all font-bold uppercase tracking-widest text-[9px] flex items-center justify-center gap-2 border border-white"
                  >
                    {loading && <Loader2 className="animate-spin" size={14} />}
                    Request Table Reservation
                  </button>
                )}
              </div>
            )}

          </div>
        )}
      </motion.div>
    </div>
  )
}
