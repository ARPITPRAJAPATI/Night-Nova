import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Link, useNavigate } from 'react-router-dom'
import { X, Loader2, ShieldCheck, Mail, Lock, User as UserIcon, Globe } from 'lucide-react'
import { useAuth } from '../hooks/useAuth'

export default function Auth() {
  const [isLogin, setIsLogin] = useState(true)
  const [formData, setFormData] = useState({ name: '', email: '', password: '' })
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  
  const { login, register } = useAuth()
  const navigate = useNavigate()

  const handleAction = async (e) => {
    e.preventDefault()
    if (!formData.email.includes('@')) return setError('Invalid terminal address (email)')
    if (formData.password.length < 6) return setError('Encryption key too short (min 6 chars)')
    
    setError('')
    setLoading(true)
    
    try {
      if (isLogin) {
        await login(formData.email, formData.password)
      } else {
        if (!formData.name) throw new Error('Identity string required')
        await register(formData.name, formData.email, formData.password)
      }
      navigate('/dashboard')
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  const inputClasses = "w-full bg-white/5 border border-white/10 px-4 py-3.5 text-white placeholder-white/20 focus:outline-none focus:border-white transition-all font-mono text-xs tracking-wider"
  const labelClasses = "text-[9px] font-bold uppercase tracking-[0.2em] text-white/40 mb-2 flex items-center gap-2"

  return (
    <div className="min-h-screen bg-brand-dark flex items-center justify-center p-6 relative overflow-hidden selection:bg-white selection:text-black">
      
      {/* Background Visual System */}
      <div className="absolute inset-0 z-0 pointer-events-none">
        <video autoPlay loop muted playsInline className="w-full h-full object-cover opacity-20 grayscale scale-110">
          <source src="/auth_bg.mp4" type="video/mp4" />
        </video>
        <div className="absolute inset-0 bg-black/60" />
      </div>

      {/* Grid Architecture */}
      <div className="fixed inset-0 z-0 pointer-events-none opacity-[0.03]">
        <div className="absolute inset-0" style={{ backgroundImage: 'radial-gradient(circle at 1px 1px, white 1px, transparent 0)', backgroundSize: '40px 40px' }} />
      </div>

      <Link 
        to="/" 
        className="absolute top-8 right-8 lg:top-12 lg:right-12 w-14 h-14 rounded-none border border-white/10 flex items-center justify-center hover:bg-white hover:text-black transition-all z-20 text-white/50 hover:text-white"
      >
        <X size={20} />
      </Link>

      <motion.div 
        initial={{ y: 30, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        className="w-full max-w-lg relative z-10"
      >
        <div className="bg-black/80 backdrop-blur-3xl border border-white/10 p-10 sm:p-16 shadow-[0_0_100px_rgba(0,0,0,1)]">
          
          <div className="mb-12">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-8 h-[1px] bg-white/30" />
              <span className="text-[10px] font-bold uppercase tracking-[0.4em] text-white/40">Identity Verification</span>
            </div>
            <h2 className="text-5xl font-black text-white tracking-tighter uppercase leading-none">
              {isLogin ? 'Grant' : 'Request'} <br /> 
              <span className="text-transparent" style={{ WebkitTextStroke: '1px white' }}>Clearance</span>
            </h2>
          </div>

          <AnimatePresence mode="wait">
            <motion.div
              key={isLogin ? 'login' : 'register'}
              initial={{ opacity: 0, x: 10 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -10 }}
              transition={{ duration: 0.3 }}
            >
              <form className="space-y-6" onSubmit={handleAction}>
                {!isLogin && (
                  <div>
                    <label className={labelClasses}><UserIcon size={10} /> Full Name</label>
                    <input 
                      type="text" 
                      placeholder="ENTER IDENTITY STRING" 
                      value={formData.name}
                      onChange={e => setFormData({...formData, name: e.target.value})}
                      className={inputClasses}
                    />
                  </div>
                )}
                
                <div>
                  <label className={labelClasses}><Mail size={10} /> Terminal Address</label>
                  <input 
                    type="email" 
                    placeholder="OPERATIVE@NETWORK.SYS" 
                    value={formData.email}
                    onChange={e => setFormData({...formData, email: e.target.value})}
                    className={inputClasses}
                  />
                </div>
                
                <div>
                  <label className={labelClasses}><Lock size={10} /> Encryption Key</label>
                  <input 
                    type="password" 
                    placeholder="••••••••••••" 
                    value={formData.password}
                    onChange={e => setFormData({...formData, password: e.target.value})}
                    className={inputClasses}
                  />
                </div>

                {error && (
                  <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} className="text-red-500 text-[10px] font-bold uppercase tracking-widest border-l-2 border-red-500 pl-4 py-1">
                    System Error: {error}
                  </motion.div>
                )}

                <div className="pt-4 space-y-4">
                  <button 
                    disabled={loading}
                    className="w-full bg-white text-black font-black py-5 tracking-[0.3em] uppercase text-[10px] hover:invert transition-all flex items-center justify-center gap-3 active:scale-[0.98]"
                  >
                    {loading ? <Loader2 className="animate-spin" size={14} /> : <ShieldCheck size={14} />}
                    {isLogin ? 'Establish Connection' : 'Register Protocol'}
                  </button>

                  <div className="relative py-4 flex items-center justify-center">
                    <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-white/5"></div></div>
                    <span className="relative px-4 text-[8px] font-bold text-white/20 uppercase tracking-[0.4em] bg-black">OR</span>
                  </div>

                  {/* Social Login - Day 6 Preparation */}
                  <button 
                    type="button"
                    onClick={() => window.location.href = `${API}/auth/google`}
                    className="w-full bg-transparent border border-white/10 text-white/80 font-bold py-5 tracking-[0.3em] uppercase text-[10px] hover:bg-white hover:text-black transition-all flex items-center justify-center gap-3 active:scale-[0.98]"
                  >
                    <Globe size={14} /> Continue with Network Grid
                  </button>
                </div>
              </form>
            </motion.div>
          </AnimatePresence>

          <div className="mt-12 pt-8 border-t border-white/5 flex flex-col sm:flex-row items-center justify-between gap-6">
            <p className="text-[9px] font-bold text-white/30 tracking-[0.2em] uppercase">
              {isLogin ? "Unauthorized access?" : "Credentials verified?"}
            </p>
            <button 
              onClick={() => setIsLogin(!isLogin)}
              className="text-[10px] font-black text-white uppercase tracking-[0.3em] border-b-2 border-white/20 hover:border-white transition-all pb-1"
            >
              {isLogin ? 'Deploy New Identity' : 'Enter Portal'}
            </button>
          </div>
        </div>
      </motion.div>

      {/* Decorative Branding */}
      <div className="absolute bottom-12 right-12 hidden lg:block opacity-20">
        <span className="text-[10px] font-mono tracking-[1em] text-white uppercase [writing-mode:vertical-lr]">NIGHTNOVA OS v1.0</span>
      </div>
    </div>
  )
}
