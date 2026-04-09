import { useState } from 'react'
import { motion } from 'framer-motion'
import { Link, useNavigate } from 'react-router-dom'
import { X, Loader2 } from 'lucide-react'
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
    setError('')
    setLoading(true)
    
    try {
      if (isLogin) {
        await login(formData.email, formData.password)
      } else {
        await register(formData.name, formData.email, formData.password)
      }
      navigate('/')
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-black flex items-center justify-center p-6 relative overflow-hidden">
      
      {/* Dynamic Video Background */}
      <div className="absolute inset-0 z-0 pointer-events-none">
        <video 
          autoPlay 
          loop 
          muted 
          playsInline
          className="w-full h-full object-cover opacity-30 grayscale"
        >
          <source src="/auth.mp4" type="video/mp4" />
        </video>
        <div className="absolute inset-0 bg-black/50" />
      </div>

      {/* Grid Lines for Auth */}
      <div className="fixed inset-0 z-0 pointer-events-none grid grid-cols-1 md:grid-cols-4 px-6 sm:px-10 gap-6 opacity-30">
        <div className="border-r border-white/10 h-full w-px"></div>
        <div className="border-r border-white/10 h-full w-px hidden md:block"></div>
        <div className="border-r border-white/10 h-full w-px hidden md:block"></div>
        <div className="border-r border-white/10 h-full w-px hidden md:block"></div>
      </div>

      <Link 
        to="/" 
        className="absolute top-8 right-8 lg:top-12 lg:right-12 w-12 h-12 rounded-none border border-white/30 flex items-center justify-center hover:bg-white hover:text-black transition-colors z-20 text-white"
      >
        <X size={24} />
      </Link>

      <motion.div 
        initial={{ y: 50, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ type: 'spring', damping: 25, stiffness: 200 }}
        className="w-full max-w-md relative z-10 pt-16 lg:pt-0"
      >
        <div className="bg-black border border-white/20 p-8 sm:p-12">
          <div className="text-center mb-10">
            <h2 className="text-3xl font-bold text-white tracking-tighter uppercase mb-2">
              {isLogin ? 'Portal Access' : 'Initialize Identity'}
            </h2>
            <p className="text-white/50 text-xs font-mono tracking-widest uppercase">
              {isLogin ? 'Secure Entry Required' : 'Awaiting credentials'}
            </p>
          </div>

          <form className="flex flex-col gap-6" onSubmit={handleAction}>
            {!isLogin && (
              <motion.div initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }}>
                <label className="text-[10px] font-mono uppercase tracking-widest text-white/50 mb-2 block">Full Name</label>
                <input 
                  type="text" 
                  required
                  placeholder="CLASSIFIED" 
                  value={formData.name}
                  onChange={e => setFormData({...formData, name: e.target.value})}
                  className="w-full bg-transparent border-b border-white/20 py-3 text-white placeholder-white/20 focus:outline-none focus:border-white transition-all font-mono text-sm"
                />
              </motion.div>
            )}
            
            <div>
              <label className="text-[10px] font-mono uppercase tracking-widest text-white/50 mb-2 block">Email Address</label>
              <input 
                type="email" 
                required
                placeholder="OPERATIVE@NETWORK.COM" 
                value={formData.email}
                onChange={e => setFormData({...formData, email: e.target.value})}
                className="w-full bg-transparent border-b border-white/20 py-3 text-white placeholder-white/20 focus:outline-none focus:border-white transition-all font-mono text-sm"
              />
            </div>
            
            <div>
              <div className="flex justify-between items-center mb-2">
                <label className="text-[10px] font-mono uppercase tracking-widest text-white/50">Password</label>
              </div>
              <input 
                type="password" 
                required
                placeholder="••••••••" 
                value={formData.password}
                onChange={e => setFormData({...formData, password: e.target.value})}
                className="w-full bg-transparent border-b border-white/20 py-3 text-white placeholder-white/20 focus:outline-none focus:border-white transition-all font-mono text-sm"
              />
            </div>

            {error && (
              <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-white text-xs font-bold text-center uppercase tracking-widest bg-red-600/20 py-2 border border-red-600/50">
                {error}
              </motion.p>
            )}

            <button 
              disabled={loading}
              className="mt-6 w-full bg-white text-black font-bold py-4 tracking-[0.2em] uppercase text-[10px] hover:bg-white/80 transition-all flex items-center justify-center gap-2"
            >
              {loading && <Loader2 className="animate-spin" size={16} />}
              {isLogin ? 'Grant Access' : 'Deploy Protocol'}
            </button>
          </form>

          <p className="text-center text-[10px] font-mono text-white/40 tracking-widest mt-8 uppercase">
            {isLogin ? "No clearance?" : "Clearance verified?"}{' '}
            <button 
              onClick={() => setIsLogin(!isLogin)}
              className="text-white hover:text-white/70 transition-colors border-b border-white/30 ml-2 py-0.5"
            >
              {isLogin ? 'Request access' : 'Enter portal'}
            </button>
          </p>
        </div>
      </motion.div>
    </div>
  )
}
