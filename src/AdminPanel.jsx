import { useState, useRef, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X, Upload, Loader2, Check } from 'lucide-react'
import { API } from './config.js'

export default function AdminPanel({ onVenueAdded, onClose }) {
  const [form, setForm] = useState({
    name: '', city: '', type: '', address: '',
    occupancy: 0, rating: 4.0, tags: '', isOpen: true,
    img: '', 
    phone: '', website: '', instagram: '',
    openTime: '9:00 PM', closeTime: '4:00 AM',
    entryFee: 0, dressCode: 'Smart Casual',
    capacity: 500, priceRange: '₹₹'
  })
  
  const [loading, setLoading] = useState(false)
  const [uploading, setUploading] = useState(false)
  const [uploadProgress, setUploadProgress] = useState(0)
  const [success, setSuccess] = useState(false)
  const [error, setError] = useState('')
  const [preview, setPreview] = useState('')
  
  const fileRef = useRef()

  const handle = e => {
    const { name, value, type, checked } = e.target
    setForm(f => ({ ...f, [name]: type === 'checkbox' ? checked : value }))
  }

  const handleFileChange = async e => {
    const file = e.target.files[0]
    if (!file) return
    setPreview(URL.createObjectURL(file))
    setUploading(true)
    setUploadProgress(0)
    setError('')
    
    try {
      const res = await fetch(
        `${API}/upload/presign?filename=${encodeURIComponent(file.name)}&type=${encodeURIComponent(file.type)}`
      )
      const { uploadUrl, imageUrl } = await res.json()
      
      await new Promise((resolve, reject) => {
        const xhr = new XMLHttpRequest()
        xhr.upload.onprogress = e => {
          if (e.lengthComputable) setUploadProgress(Math.round((e.loaded / e.total) * 100))
        }
        xhr.onload = () => xhr.status === 200 ? resolve() : reject(new Error('Upload failed'))
        xhr.onerror = () => reject(new Error('Upload failed'))
        xhr.open('PUT', uploadUrl)
        xhr.setRequestHeader('Content-Type', file.type)
        xhr.send(file)
      })
      
      setForm(f => ({ ...f, img: imageUrl }))
      setUploadProgress(100)
    } catch (err) {
      setError('Image upload failed: ' + err.message)
      setPreview('')
    }
    setUploading(false)
  }

  const submit = async () => {
    if (!form.name || !form.city || !form.type || !form.address) {
      setError('Please fill in all required fields!')
      return
    }
    setLoading(true)
    setError('')
    
    try {
      const token = localStorage.getItem('nn_token')
      const res = await fetch(`${API}/venues`, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          ...form,
          occupancy: Number(form.occupancy),
          rating: Number(form.rating),
          entryFee: Number(form.entryFee),
          capacity: Number(form.capacity),
          tags: form.tags.split(',').map(t => t.trim()).filter(Boolean),
          img: form.img || undefined,
        }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.message)
      
      setSuccess(true)
      onVenueAdded(data)
      setTimeout(onClose, 1500)
    } catch (err) {
      setError(err.message)
    }
    setLoading(false)
  }

  const inputClasses = "w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm text-white placeholder-white/20 focus:outline-none focus:border-brand-accent transition-all"
  const labelClasses = "text-[9px] font-bold uppercase tracking-widest text-white/40 mb-2 block ml-2"

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 sm:p-10">
      <motion.div 
        initial={{ opacity: 0 }} 
        animate={{ opacity: 1 }} 
        exit={{ opacity: 0 }}
        onClick={onClose}
        className="absolute inset-0 bg-brand-dark/80 backdrop-blur-2xl"
      />
      
      <motion.div 
        initial={{ scale: 0.9, opacity: 0, y: 20 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        exit={{ scale: 0.9, opacity: 0, y: 20 }}
        className="w-full max-w-4xl max-h-[90vh] overflow-y-auto glass rounded-[2.5rem] border border-white/10 shadow-2xl relative z-10 scrollbar-none"
      >
        <div className="sticky top-0 glass border-b border-white/5 px-8 sm:px-12 py-6 flex justify-between items-center z-20">
          <div>
            <h3 className="text-[10px] font-bold uppercase tracking-[0.3em] text-brand-accent mb-1">NightNova Admin</h3>
            <h2 className="text-2xl font-bold text-white tracking-tight">Onboard New Venue</h2>
          </div>
          <button onClick={onClose} className="w-10 h-10 rounded-full glass hover:bg-red-500/20 hover:text-red-500 transition-all flex items-center justify-center border border-white/5">
            <X size={20} />
          </button>
        </div>

        <div className="p-8 sm:p-12">
          <div className="grid md:grid-cols-2 gap-10">
            {/* Left Column: Basic Info */}
            <div className="space-y-6">
              <div>
                <label className={labelClasses}>Venue Identity *</label>
                <input name="name" value={form.name} onChange={handle} placeholder="e.g. Kitty Su" className={inputClasses} />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className={labelClasses}>City Slug *</label>
                  <input name="city" value={form.city} onChange={handle} placeholder="delhi" className={inputClasses} />
                </div>
                <div>
                  <label className={labelClasses}>Identity Reveal *</label>
                  <input name="type" value={form.type} onChange={handle} placeholder="Club / Bar" className={inputClasses} />
                </div>
              </div>

              <div>
                <label className={labelClasses}>Physical Coordinates *</label>
                <input name="address" value={form.address} onChange={handle} placeholder="Sector 29, Gurgaon" className={inputClasses} />
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div className="col-span-2">
                  <label className={labelClasses}>Atmospheric Tags</label>
                  <input name="tags" value={form.tags} onChange={handle} placeholder="Rooftop, EDM, Lite" className={inputClasses} />
                </div>
                <div>
                  <label className={labelClasses}>Price Tier</label>
                  <select name="priceRange" value={form.priceRange} onChange={handle} className={inputClasses}>
                    <option value="₹">₹</option>
                    <option value="₹₹">₹₹</option>
                    <option value="₹₹₹">₹₹₹</option>
                    <option value="₹₹₹₹">₹₹₹₹</option>
                  </select>
                </div>
              </div>

              <div className="pt-4 border-t border-white/5 grid grid-cols-2 gap-4">
                <div>
                  <label className={labelClasses}>Initial Heat %</label>
                  <input name="occupancy" type="number" value={form.occupancy} onChange={handle} className={inputClasses} />
                </div>
                <div>
                  <label className={labelClasses}>Starting Rating</label>
                  <input name="rating" type="number" step="0.1" value={form.rating} onChange={handle} className={inputClasses} />
                </div>
              </div>
            </div>

            {/* Right Column: Visuals & Contact */}
            <div className="space-y-6">
              <label className={labelClasses}>Visual Identity</label>
              <div 
                onClick={() => fileRef.current.click()}
                className="h-44 rounded-3xl border-2 border-dashed border-white/5 bg-white/5 overflow-hidden flex flex-col items-center justify-center cursor-pointer hover:border-brand-accent/30 transition-all active:scale-[0.98] group relative"
              >
                {preview ? (
                  <>
                    <img src={preview} alt="Preview" className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" />
                    <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                      <span className="text-[10px] font-bold text-white uppercase tracking-widest">Swap Visual</span>
                    </div>
                  </>
                ) : (
                  <div className="text-center">
                    <div className="w-12 h-12 rounded-full bg-white/5 flex items-center justify-center mx-auto mb-3 text-white/20 group-hover:text-brand-accent transition-colors">
                      <Upload size={20} />
                    </div>
                    <span className="text-[10px] font-bold text-white/30 uppercase tracking-widest">Upload Cover Visual</span>
                  </div>
                )}
                
                <AnimatePresence>
                  {uploading && (
                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="absolute inset-0 bg-brand-dark/90 flex flex-col items-center justify-center gap-3">
                      <Loader2 className="text-brand-accent animate-spin" size={24} />
                      <span className="text-[10px] font-bold text-white uppercase tracking-widest">Streaming… {uploadProgress}%</span>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
              <input ref={fileRef} type="file" accept="image/*" onChange={handleFileChange} className="hidden" />

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className={labelClasses}>Phone Pulse</label>
                  <input name="phone" value={form.phone} onChange={handle} placeholder="+91..." className={inputClasses} />
                </div>
                <div>
                  <label className={labelClasses}>Instagram ID</label>
                  <input name="instagram" value={form.instagram} onChange={handle} placeholder="@venue" className={inputClasses} />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className={labelClasses}>Operational Hours</label>
                  <div className="flex gap-2">
                    <input name="openTime" value={form.openTime} onChange={handle} placeholder="9PM" className={inputClasses} />
                    <input name="closeTime" value={form.closeTime} onChange={handle} placeholder="4AM" className={inputClasses} />
                  </div>
                </div>
                <div>
                  <label className={labelClasses}>Entry Protocol</label>
                  <input name="entryFee" type="number" value={form.entryFee} onChange={handle} placeholder="Fee in ₹" className={inputClasses} />
                </div>
              </div>

              <div className="flex items-center gap-4 pt-4">
                <div className="flex-1 flex items-center gap-3 glass px-4 py-3 rounded-xl border border-white/5">
                  <input name="isOpen" type="checkbox" checked={form.isOpen} onChange={handle} className="w-4 h-4 accent-brand-accent" />
                  <span className="text-[10px] font-bold text-white/50 uppercase tracking-widest">Live Status: OPEN</span>
                </div>
              </div>
            </div>
          </div>

          <div className="mt-12 pt-10 border-t border-white/5 space-y-6">
            {error && (
              <motion.div initial={{ opacity: 0, y: 5 }} animate={{ opacity: 1, y: 0 }} className="text-center text-xs font-bold text-red-500 uppercase tracking-widest drop-shadow-md">
                Protocol Error: {error}
              </motion.div>
            )}
            
            <button 
              onClick={submit}
              disabled={loading || uploading}
              className="w-full bg-gradient-to-r from-brand-accent to-brand-accent-light text-white font-bold py-5 rounded-2xl tracking-[0.2em] uppercase text-xs hover:shadow-[0_0_50px_rgba(124,58,237,0.4)] transition-all hover:scale-[1.01] active:scale-[0.99] disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-3 shadow-2xl border border-brand-accent-light"
            >
              {loading ? <Loader2 className="animate-spin" size={18} /> : success ? <Check size={18} /> : null}
              {loading ? 'Transmitting Data…' : success ? 'Venue Deployed' : 'Deploy Venue to Grid'}
            </button>
          </div>
        </div>
      </motion.div>
    </div>
  )
}
