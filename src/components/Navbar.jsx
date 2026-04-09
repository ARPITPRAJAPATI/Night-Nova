import { Link } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { Disc3, LogOut, User } from 'lucide-react'
import { useAuth } from '../hooks/useAuth'

export default function Navbar() {
  const { user, logout } = useAuth()

  return (
    <motion.nav 
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      transition={{ type: 'spring', stiffness: 120, damping: 20 }}
      className="fixed top-0 left-0 right-0 z-50 glass border-b border-white/5 py-4 px-6 sm:px-10 flex items-center justify-between"
    >
      <Link to="/" className="flex items-center gap-2 group">
        <Disc3 className="text-white group-hover:animate-spin transition-all duration-700" size={28} strokeWidth={1.5} />
        <span className="text-xl font-bold tracking-tighter text-white">
          NightNova
        </span>
      </Link>
      
      <div className="flex items-center gap-4 sm:gap-8 text-sm font-medium text-white/60">
        <Link to="/" className="hover:text-white transition-colors duration-300 tracking-wide uppercase text-[10px] sm:text-[11px] font-bold hidden xs:block">Home</Link>
        <Link to="/explore" className="hover:text-white transition-colors duration-300 tracking-wide uppercase text-[10px] sm:text-[11px] font-bold">Explore</Link>
      </div>

      <div className="flex items-center gap-4">
        <AnimatePresence mode="wait">
          {user ? (
            <motion.div 
              key="user-actions"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              className="flex items-center gap-3 sm:gap-6"
            >
              <Link to="/dashboard" className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-full border border-white/20 hover:bg-white hover:text-black transition-colors group">
                <User size={14} className="group-hover:text-black text-white" />
                <span className="text-[10px] font-bold uppercase tracking-widest leading-none mt-0.5">
                  {user.name.split(' ')[0]}
                </span>
              </Link>
              <button 
                onClick={logout}
                className="group p-2 rounded-full hover:bg-white/10 transition-colors border border-transparent hover:border-white/20"
                title="Logout"
              >
                <LogOut size={18} className="text-white/40 group-hover:text-white transition-colors" />
              </button>
            </motion.div>
          ) : (
            <motion.div
              key="login-btn"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            >
              <Link 
                to="/auth" 
                className="px-6 py-2.5 rounded-full text-[10px] font-bold uppercase tracking-widest text-white border border-white/30 hover:bg-white hover:text-black transition-all"
              >
                Sign In
              </Link>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.nav>
  )
}
