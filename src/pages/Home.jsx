import { motion } from 'framer-motion'
import { Link } from 'react-router-dom'
import { ArrowRight } from 'lucide-react'

// Ultra-premium, Minimalist, "Icomat" style Home Page
export default function Home() {
  return (
    <div className="bg-black min-h-screen text-white font-sans overflow-hidden">
      
      {/* Cinematic Background Video */}
      <div className="fixed inset-0 z-0 pointer-events-none">
        <div className="absolute inset-0 bg-black/40 z-10" />
        <video 
          autoPlay 
          loop 
          muted 
          playsInline
          className="w-full h-full object-cover opacity-60 grayscale"
        >
          <source src="/hero.mp4" type="video/mp4" />
        </video>
      </div>

      {/* Grid Lines (Technical Aesthetic) */}
      <div className="fixed inset-0 z-0 pointer-events-none grid grid-cols-1 md:grid-cols-4 px-6 sm:px-10 gap-6 opacity-30">
        <div className="border-r border-white/10 h-full"></div>
        <div className="border-r border-white/10 h-full hidden md:block"></div>
        <div className="border-r border-white/10 h-full hidden md:block"></div>
        <div className="border-r border-white/10 h-full hidden md:block"></div>
      </div>

      {/* Interactive Content */}
      <div className="relative z-10 flex flex-col min-h-screen px-6 sm:px-10 justify-between py-10 pt-32">
        
        {/* Top Data Bar */}
        <motion.div 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1, delay: 0.5 }}
          className="flex justify-between items-start"
        >
          <div className="flex flex-col gap-1">
            <span className="text-[10px] font-mono text-white/50 tracking-[0.2em] uppercase">Status</span>
            <span className="text-[10px] text-white tracking-widest uppercase flex items-center gap-2">
              <span className="w-1.5 h-1.5 bg-white rounded-full animate-pulse"></span>
              Live Grid
            </span>
          </div>
          
          <div className="flex flex-col gap-1 text-right">
            <span className="text-[10px] font-mono text-white/50 tracking-[0.2em] uppercase">Coordinates</span>
            <span className="text-[10px] text-white tracking-widest uppercase">
              28.6139° N, 77.2090° E
            </span>
          </div>
        </motion.div>

        {/* Center Massive Typography */}
        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 1.5, ease: [0.16, 1, 0.3, 1] }}
          className="flex flex-col items-center justify-center -mt-10 sm:-mt-20"
        >
          <div className="overflow-hidden mb-2 md:mb-4">
            <motion.h1 
              initial={{ y: 100 }}
              animate={{ y: 0 }}
              transition={{ duration: 1, delay: 0.2, ease: [0.16, 1, 0.3, 1] }}
              className="text-4xl sm:text-7xl md:text-[10rem] lg:text-[12rem] font-bold tracking-tighter leading-none text-center uppercase"
            >
              NIGHTLIFE
            </motion.h1>
          </div>
          <div className="overflow-hidden">
            <motion.h1 
              initial={{ y: 100 }}
              animate={{ y: 0 }}
              transition={{ duration: 1, delay: 0.3, ease: [0.16, 1, 0.3, 1] }}
              className="text-4xl sm:text-7xl md:text-[10rem] lg:text-[12rem] font-bold tracking-tighter leading-none text-center text-transparent uppercase"
              style={{ WebkitTextStroke: '1px rgba(255,255,255,0.7)' }}
            >
              WITHOUT LIMITS.
            </motion.h1>
          </div>
        </motion.div>

        {/* Bottom Bar Container */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1, delay: 1 }}
          className="flex flex-col md:flex-row justify-between items-end md:items-center gap-8 border-t border-white/20 pt-6"
        >
          <div className="max-w-md">
            <p className="text-xs md:text-sm text-white/60 font-medium leading-relaxed">
              We design and curate the globe's most exclusive nightlife structural systems. Transformational experiences scaled from day one.
            </p>
          </div>

          <Link 
            to="/explore" 
            className="group flex flex-col items-end gap-3"
          >
            <div className="w-16 h-16 rounded-full border border-white/30 flex items-center justify-center group-hover:bg-white group-hover:text-black transition-all duration-500 overflow-hidden">
              <ArrowRight className="group-hover:translate-x-1 transition-transform duration-300" strokeWidth={1} size={28} />
            </div>
            <span className="text-[10px] uppercase tracking-[0.3em] font-mono font-medium text-white/50 group-hover:text-white transition-colors duration-300">
              Enter Platform
            </span>
          </Link>
        </motion.div>
      </div>

      {/* Footer Signature - Home Page Only */}
      <div className="absolute bottom-6 left-10 z-20">
        <span className="text-[10px] font-black tracking-widest uppercase text-white/40 hover:text-white hover:drop-shadow-[0_0_8px_rgba(255,255,255,0.8)] transition-all duration-500 cursor-default">
          Engineered by Aru
        </span>
      </div>
    </div>
  )
}
